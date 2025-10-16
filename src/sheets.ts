import {
  HEADER_ROW_INDEX,
  FIRST_DATA_ROW_INDEX,
  DATE_COLUMN_KEY,
} from "./config/constants";
import { Schedule, Member } from "./config/types";

/**
 * スプレッドシートから各シートの情報を取得し、座談会スケジュール情報とメンバー情報を返却します。
 * @param spreadSheetID - シートID
 * @param targetDate - GAS実行日の1週間後の日にち(1週間後にリマインドするべき座談会があるかを判定するために使用)
 */
export const getSheetData = (
  targetDate: string,
  scheduleSheetName: string,
  memberSheetName: string
) => {
  // スプレッドシートオブジェクトを取得
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) throw new Error(`Spreadsheet not found.`);

  // スケジュールを取得
  const schedule = getScheduleFromSheet(
    spreadsheet,
    targetDate,
    scheduleSheetName
  );

  if (!schedule) {
    Logger.log(`No schedule found on ${targetDate}.`);
    return;
  }

  const members = getMemberFromSheet(spreadsheet, memberSheetName);

  for (const member of members) {
    if (member.name in schedule) {
      member.team = schedule[member.name];
      member.isFacili =
        schedule[member.team + "ファシリ"] === member.name ? true : false;
    }
  }

  return members;
};

/**
 * スプレッドシートから1週間後に座談会がある場合、座談会の参加者を取得します。
 * @param spreadsheet - シート情報
 * @param targetDate - Gas実行日
 * @param scheduleSheetName - スケジュール情報が記載されているシート名
 */
function getScheduleFromSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  targetDate: string,
  scheduleSheetName: string
): Schedule | null {
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
  const header = values[HEADER_ROW_INDEX];
  // ヘッダーを除いた2行目以降のデータとして扱う
  const data = values.slice(FIRST_DATA_ROW_INDEX);

  // 表情報が取得できない場合、エラーを出力
  if (data.length === 0) {
    Logger.log(`No schedule data in sheet: ${sheet.getName()}`);
    return null;
  }

  // 1週間後にある座談会情報を取得
  const matchedRow = data.find((row) => {
    const rowDate = Utilities.formatDate(
      new Date(row[0]),
      Session.getScriptTimeZone(),
      "yyyy/MM/dd"
    );
    return rowDate === targetDate;
  });

  // 座談会情報が取得できない場合、空のオブジェクトを返却
  if (!matchedRow) return null;

  // スプレッドシートで取得した座談会情報配列をオブジェクトに変換
  const schedule = matchedRow.reduce((accumulator, currentValue, index) => {
    const key = header[index];
    // 日付列はスキップ
    if (key === DATE_COLUMN_KEY) return accumulator;

    accumulator[key] = currentValue;
    return accumulator;
  }, {} as Schedule);

  return schedule;
}

/**
 * メンバーマスター情報を取得します。
 * @param spreadsheet - シート情報
 * @param memberSheetName - メンバー情報が記載されているシート名
 */
function getMemberFromSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  memberSheetName: string
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
  const header = values[HEADER_ROW_INDEX];
  // ヘッダーを除いた2行目以降のデータとして扱う
  const data = values.slice(FIRST_DATA_ROW_INDEX);

  // データが取得できない場合、エラーを出力
  if (data.length === 0) {
    throw new Error(`No member data found in sheet: ${sheet.getName()}`);
  }

  const members = data.map((row) => {
    const member: Member = row.reduce((accumulator, currentValue, index) => {
      accumulator[header[index]] = currentValue;
      return accumulator;
    }, {} as Member);
    return member;
  });

  return members;
}
