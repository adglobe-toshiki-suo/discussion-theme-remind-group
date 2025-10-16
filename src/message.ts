import { Member, TeamMembersMap } from "./config/types";

/**
 * slackへ送るリマインド文を作成します。
 * @param {} discussionMembers - 座談会メンバー情報
 * @param {string} eventDate - 座談会実施日
 * @returns {string} messageBody -
 */
export const createMessageBody = (
  discussionMembers: Member[],
  eventDate: string
): string => {
  let mention = "";
  let teamMembersMap: TeamMembersMap = {};
  for (const discussionMember of discussionMembers) {
    if (!discussionMember.participation) continue;
    if (discussionMember.isFacili) {
      mention += `<@${discussionMember.memberID}>`;
    }

    const team = discussionMember.team;
    if (team) {
      if (!teamMembersMap[team]) {
        teamMembersMap[team] = "";
      }
      teamMembersMap[team] += ` ・${discussionMember.name}\n`;
    }
  }

  const memberBody = Object.entries(teamMembersMap)
    .map(([team, members]) => `\n【${team}チーム】\n${members}`)
    .join("");

  const messageBody = `${mention}\nお疲れ様です。\n次回座談会のファシリテーターの方へリマインドです！\n\n来週${eventDate}に座談会が予定されています🙌\nお題の共有がまだであれば、共有よろしくお願いいたします🙇\n\n座談会メンバー構成は下記をご確認ください。\n  ${memberBody}\n\t`;
  return messageBody;
};
