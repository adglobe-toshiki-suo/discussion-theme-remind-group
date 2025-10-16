export type SectionSchedules = {
  [sectionName: string]: Schedule;
};

export type Schedule = {
  [memberName: string]: string | null;
};

export type SectionMembers = {
  [sectionName: string]: Member[];
};

export type Member = {
  name: string;
  email: string;
  memberID: string;
  participation: boolean;
  team: string | null;
  isFacili: boolean | null;
};

export type GetSheetData = {
  allSchedulesMap: SectionSchedules;
  allMembersMap: SectionMembers;
};

export type TeamMembersMap = {
  [teamName: string]: string;
};

// Slackに送信するペイロードの型
export type SlackPayload = {
  channel: string;
  text: string;
};
