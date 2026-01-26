import { Member } from "./types/spreadSheet";
import { Dayjs } from "dayjs";

/**
 * slackへ送るリマインド文を作成します。
 * @param {Member[]} discussionMembers - 座談会メンバー情報
 * @param {string} team  - チームごとのメンバー情報
 * @param {Dayjs} eventDate - 座談会実施日
 * @returns {string} messageBody - リマインド本文
 */
export const createMessageBody = (
  discussionMembers: Member[],
  team: string,
  eventDate: Dayjs,
): string => {
  const facilitator = discussionMembers.find(
    (member) => member.isFacilitator === true,
  );

  const memberBody = `\n【${team}チーム】\n${discussionMembers.map((member) => ` ・${member.name}\n`).join("")}`;

  const messageBody = `@${facilitator?.memberID ?? ""}\nお疲れ様です。\n次回座談会のファシリテーターの方へリマインドです！\n\n来週${eventDate.format(
    "MM/DD",
  )}に座談会が予定されています🙌\nお題の共有がまだであれば、共有よろしくお願いいたします🙇\n\n座談会メンバー構成は下記をご確認ください。\n  ${memberBody}\n\t`;
  return messageBody;
};
