// SL1座談会スケジュールシート
export const SL1_SCHEDULE_SHEET_NAME = "section1_schedule" as const;
// SL1メンバーマスターシート
export const SL1_MEMBER_SHEET_NAME = "section1_member_master" as const;
// SL2座談会スケジュールシート
export const SL2_SCHEDULE_SHEET_NAME = "section2_schedule" as const;
// SL2メンバーマスターシート
export const SL2_MEMBER_SHEET_NAME = "section2_member_master" as const;
// スプレッドシート表ヘッダーINDEX
export const HEADER_ROW_INDEX = 0 as const;
// スプレッドシート表カラムINDEX
export const FIRST_DATA_ROW_INDEX = 1 as const;
// スケジュールシート日付ヘッダー
export const DATE_COLUMN_KEY = "date" as const;
// セクション情報
export const sectionList = [
  {
    sectionName: "SL1",
    scheduleSheetName: "section1_schedule",
    memberSheetName: "section1_member_master",
    webhookUrlKey: "SL1_WEBHOOK_URL",
    channelNameKey: "SL1_SLACK_CHANNEL",
  },
  {
    sectionName: "SL2",
    scheduleSheetName: "section2_schedule",
    memberSheetName: "section2_member_master",
    webhookUrlKey: "SL2_WEBHOOK_URL",
    channelNameKey: "SL2_SLACK_CHANNEL",
  },
] as const;

// エラーメッセージ定義
export const ERROR_MESSAGES = {
  NO_PARTICIPANTS: "No participants found in the schedule",
  FACILITATOR_UNASSIGNED: "Facilitator is not assigned",
  TEAMS_UNASSIGNED: "Teams are unassigned for all participants",
} as const;
