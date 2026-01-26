/**
 * 各メンバー詳細
 */
export type Member = {
  name: string;
  email: string;
  memberID: string;
  participation: boolean;
  team: string | null;
  isFacilitator: boolean | null;
};

/**
 * チームごとのメンバー詳細
 */
export type TeamMembers = Partial<Record<string, Member[]>>;

/**
 * スプレッドシート取得データ
 */
export type GetSheetData = {
  allSchedulesMap: SectionSchedules;
  allMembersMap: SectionMembers;
};

/**
 * シートのスケジュール情報
 * ファシリテート担当者: メンバー名 or メンバー名: 参加チーム名
 */
type Schedule = {
  [key: string]: string | null;
};

/**
 * セクションごとのスケジュール詳細
 */
type SectionSchedules = {
  [sectionName: string]: Schedule;
};

/**
 * セクションごとのメンバー詳細
 */
type SectionMembers = {
  [sectionName: string]: Member[];
};
