import { createMessageBody } from "./message";
import { getSheetData } from "./sheets";
import { sendToSlack } from "./send";
import { sectionList } from "./config/constants";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { Member, TeamMembers } from "./types/spreadSheet";

dayjs.locale("ja");

export function main() {
  const scriptProperties: GoogleAppsScript.Properties.Properties =
    PropertiesService.getScriptProperties();

  const slackOAuthToken: string | null =
    scriptProperties.getProperty("SLACK_OAUTH_TOKEN");

  if (!slackOAuthToken) {
    Logger.log(
      "Error: SLACK_OAUTH_TOKEN Property is not set in script Property.",
    );
    return;
  }

  // Gas実行日を取得
  const today: Dayjs = dayjs();

  // 1週間後に座談会があるか判定するため、1週間後の日付を保持
  const nextWeek: Dayjs = today.add(7, "day");

  // セクションごとに座談会がGAS実行日の1週間後に予定されているかを判定し、予定されている場合は各セクションチャンネルにリマインドを送る
  for (const section of Object.values(sectionList)) {
    const {
      scheduleSheetName,
      memberSheetName,
      webhookUrlKey,
      channelNameKey,
    } = section;
    const webhookUrl = scriptProperties.getProperty(webhookUrlKey);
    const channelName = scriptProperties.getProperty(channelNameKey);

    // プロパティから値を取得できない場合、当該セクションはスキップ
    if (!webhookUrl || !channelName) {
      Logger.log(
        `Error: Error: Property is not set in script Property. webhookUrl: ${webhookUrl}, channelName: ${channelName}`,
      );
      continue;
    }

    // スプレッドシートからスケジュール情報とメンバー情報を取得
    const scheduleInfo: Member[] | null = getSheetData(
      nextWeek,
      scheduleSheetName,
      memberSheetName,
    );

    // スプレッドシートから情報が取得できない場合、当該セクションはスキップ
    if (!scheduleInfo) {
      Logger.log(
        `No schedule found on ${nextWeek.format("MM/DD")} for ${
          section.sectionName
        }.`,
      );
      continue;
    }

    const discussionMembers: Required<Member>[] = scheduleInfo.filter(
      (member) => member.participation && member.team !== null,
    );

    const teamMembers: TeamMembers = Object.groupBy(
      discussionMembers,
      (member) => {
        if (!member.team) {
          throw new Error("Unexpected team value");
        }
        return member.team;
      },
    );

    for (const [team, members] of Object.entries(teamMembers)) {
      if (!members || members.length === 0) continue;

      // リマインド本文を作成
      const messageBody: string = createMessageBody(members, team, nextWeek);

      // Slackへリマインドを通知
      sendToSlack(webhookUrl, slackOAuthToken, channelName, messageBody);
    }
  }
}

declare let global: any;
global.main = main;
