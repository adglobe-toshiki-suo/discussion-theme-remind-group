import { SlackPayload } from "./config/types";

/**
 * Slackにメッセージを送信します。
 * @param url - SlackのWebhook URL
 * @param token - Slackの認証トークン
 * @param channel - 送信先のチャンネル名
 * @param text - 送信するメッセージ
 */
export const sendToSlack = (
  url: string,
  token: string,
  channel: string,
  text: string
): void => {
  const data: SlackPayload = {
    channel: `#${channel}`,
    text,
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: `Bearer ${token}` },
    payload: JSON.stringify(data),
  };

  // Slack APIにリクエストを送信
  UrlFetchApp.fetch(url, options);
};
