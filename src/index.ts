import { NEXT_WEEK } from "./config/constants";
import { createMessageBody } from "./message";
import { getSheetData } from "./sheets";
import { sendToSlack } from "./send";
import { sectionList } from "./config/section";
export function main() {
  const scriptProperties: GoogleAppsScript.Properties.Properties =
    PropertiesService.getScriptProperties();

  // const spreadSheetID: string | null = scriptProperties.getProperty(
  //   "GOOGLE_SPREADSHEET_ID"
  // );

  const slackOAuthToken = scriptProperties.getProperty("SLACK_OAUTH_TOKEN");

  if (!slackOAuthToken) {
    Logger.log(
      "Error: SLACK_OAUTH_TOKEN Property is not set in script Property."
    );
    return;
  }

  // Gas実行日を取得
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);

  // 1週間後に座談会があるか判定するため、1週間後の日付を保持
  const nextWeek: Date = new Date();
  nextWeek.setDate(today.getDate() + NEXT_WEEK);
  const targetDate = Utilities.formatDate(
    new Date(nextWeek),
    Session.getScriptTimeZone(),
    "yyyy/MM/dd"
  );

  // リマインド本文に使用するため成型
  const eventDate: string = Utilities.formatDate(
    nextWeek,
    "Asia/Tokyo",
    "MM/dd"
  );

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
        `Error: Error: Property is not set in script Property. webhookUrl: ${webhookUrl}, channelName: ${channelName}`
      );
      continue;
    }

    // スプレッドシートからスケジュール情報とメンバー情報を取得
    const discussionMembers = getSheetData(
      targetDate,
      scheduleSheetName,
      memberSheetName
    );

    // スプレッドシートから情報が取得できない場合、当該セクションはスキップ
    if (!discussionMembers) {
      Logger.log(`No schedule found on ${targetDate}.`);
      continue;
    }

    // リマインド本文を作成
    const messageBody = createMessageBody(discussionMembers, eventDate);

    // Slackへリマインドを通知
    sendToSlack(webhookUrl, slackOAuthToken, channelName, messageBody);
  }
}

declare let global: any;
global.main = main;
