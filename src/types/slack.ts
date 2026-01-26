/**
 * 送信メッセージ本文に記載するチームに紐づくメンバー
 */
export type TeamMembersMap = {
  [teamName: string]: string;
};

/**
 * Slackに送信するペイロードの型
 */
export type SlackPayload = {
  channel: string;
  text: string;
};
