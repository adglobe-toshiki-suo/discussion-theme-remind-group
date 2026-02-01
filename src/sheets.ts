import dayjs, { type Dayjs } from "dayjs";
import {
  HEADER_ROW_INDEX,
  FIRST_DATA_ROW_INDEX,
  ERROR_MESSAGES,
} from "./config/constants";
import { Member } from "./types/spreadSheet";

/**
 * スプレッドシートから各シートの情報を取得し、座談会スケジュール情報とメンバー情報を返却します。
 * @param spreadSheetID - シートID
 * @param targetDate - GAS実行日の1週間後の日にち(1週間後にリマインドするべき座談会があるかを判定するために使用)
 */
export const getSheetData = (
  targetDate: Dayjs,
  scheduleSheetName: string,
  memberSheetName: string,
): Member[] | null => {
  // スプレッドシートオブジェクトを取得
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) throw new Error(`Spreadsheet not found.`);

  // メンバー情報を取得
  const members = getMemberFromSheet(spreadsheet, memberSheetName);

  // スケジュールからメンバー詳細情報を取得
  const scheduleInfo = getScheduleFromSheet(
    spreadsheet,
    targetDate,
    scheduleSheetName,
    members,
  );

  if (!scheduleInfo) return null;

  return scheduleInfo;
};

/**
 * スプレッドシートから1週間後に座談会がある場合、座談会の参加者を取得します。
 * @param spreadsheet - シート情報
 * @param targetDate - Gas実行日
 * @param scheduleSheetName - スケジュール情報が記載されているシート名
 */
function getScheduleFromSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  targetDate: Dayjs,
  scheduleSheetName: string,
  members: Member[],
): Member[] | null {
  const sheet = spreadsheet.getSheetByName(scheduleSheetName);

  if (!sheet) {
    throw new Error(`Sheet "${scheduleSheetName}" not found.`);
  }

  // スプレッドシートの表情報を取得
  const values = sheet.getDataRange().getValues();

  // スプレッドシートの表情報が取得できない場合、エラーを出力
  if (!values || values.length <= HEADER_ROW_INDEX) {
    throw new Error(`Invalid sheet structure: ${sheet.getName()}`);
  }

  // 表ヘッダーを取得
  const header: string[] = values[HEADER_ROW_INDEX];
  // ヘッダーを除いた2行目以降のデータとして扱う
  const data: (string | Dayjs)[][] = values.slice(FIRST_DATA_ROW_INDEX);

  // 表情報が取得できない場合、エラーを出力
  if (data.length === 0) {
    Logger.log(`No schedule data in sheet: ${sheet.getName()}`);
    return null;
  }

  // 1週間後にある座談会情報を取得
  const matchedRow = data.find((row) => {
    const rowDate: Dayjs = dayjs(row[0]);
    return rowDate.isSame(targetDate, "day");
  });

  // 座談会情報が取得できない場合、空のオブジェクトを返却
  if (!matchedRow) return null;

  const scheduleInfo = members
    .filter((member) => member.participation)
    .map((member) => {
      const team = matchedRow[header.indexOf(member.name)] as string;
      const isFacilitator =
        matchedRow[header.indexOf(`${team}ファシリ`)] === member.name;
      return { ...member, team, isFacilitator };
    });

  const errors = validateScheduleData(scheduleInfo);
  if (errors.length > 0) {
    errors.forEach((errorKey) => {
      Logger.log(
        `Error: ${
          ERROR_MESSAGES[errorKey as keyof typeof ERROR_MESSAGES]
        } in the schedule sheet "${scheduleSheetName}" on ${targetDate.format(
          "MM/DD",
        )}`,
      );
    });
    return null;
  }

  return scheduleInfo;
}

/**
 * メンバーマスター情報を取得します。
 * @param spreadsheet - シート情報
 * @param memberSheetName - メンバー情報が記載されているシート名
 */
function getMemberFromSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  memberSheetName: string,
): Member[] {
  const sheet = spreadsheet.getSheetByName(memberSheetName);

  if (!sheet) {
    throw new Error(`Sheet "${memberSheetName}" not found.`);
  }

  // スプレッドシートの表情報を取得
  const values = sheet.getDataRange().getValues();

  // スプレッドシートの表情報が取得できない場合、エラーを出力
  if (!values || values.length <= HEADER_ROW_INDEX) {
    throw new Error(`Invalid member sheet structure: ${sheet.getName()}`);
  }
  // 表ヘッダーを取得
  const header: String[] = values[HEADER_ROW_INDEX];
  // ヘッダーを除いた2行目以降のデータとして扱う
  const data: (string | Boolean)[][] = values.slice(FIRST_DATA_ROW_INDEX);

  // データが取得できない場合、エラーを出力
  if (data.length === 0) {
    throw new Error(`No member data found in sheet: ${sheet.getName()}`);
  }

  const members: Member[] = data.map((row) => {
    const member = Object.fromEntries(
      header.map((key, index) => [key, row[index]]),
    );

    return {
      name: String(member.name ?? ""),
      email: String(member.email ?? ""),
      memberID: String(member.memberID ?? ""),
      participation: Boolean(member.participation),
      team: null,
      isFacilitator: null,
    } as Member;
  });

  return members;
}

/**
 * スケジュールとメンバー情報において、ファシリテーターが未設定の場合およびメンバー全てのチームが未設定の場合にエラーを出力します。
 * @param discussionMembers - 座談会メンバー情報
 * @returns errors - エラー情報配列
 */
export const validateScheduleData = (discussionMembers: Member[]) => {
  const errors: string[] = [];
  const participants = discussionMembers.filter(
    (member) => member.participation,
  );

  if (participants.length === 0) {
    errors.push("NO_PARTICIPANTS");
    return errors;
  }

  const facilitatorsUnassigned = participants.every(
    (member) => !member.isFacilitator,
  );

  if (facilitatorsUnassigned) {
    errors.push("FACILITATOR_UNASSIGNED");
  }

  const teamsUnassigned = participants.every((member) => !member.team);

  if (teamsUnassigned) {
    errors.push("TEAMS_UNASSIGNED");
  }

  return errors;
};
