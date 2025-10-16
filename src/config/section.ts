import {
  SL1_MEMBER_SHEET_NAME,
  SL1_SCHEDULE_SHEET_NAME,
  SL2_MEMBER_SHEET_NAME,
  SL2_SCHEDULE_SHEET_NAME,
} from "./constants";

export const sectionList = {
  sl1: {
    scheduleSheetName: SL1_SCHEDULE_SHEET_NAME,
    memberSheetName: SL1_MEMBER_SHEET_NAME,
    webhookUrlKey: "SL1_WEBHOOK_URL",
    channelNameKey: "SL1_SLACK_CHANNEL",
  },
  sl2: {
    scheduleSheetName: SL2_SCHEDULE_SHEET_NAME,
    memberSheetName: SL2_MEMBER_SHEET_NAME,
    webhookUrlKey: "SL2_WEBHOOK_URL",
    channelNameKey: "SL2_SLACK_CHANNEL",
  },
};
