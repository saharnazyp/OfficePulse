/**
 * OfficePulse — Daily Office Reminder Board
 * -------------------------------------------------------------
 * سیستم ریمایندر دفتر — نسخه تک‌شیتی
 * فقط یک تب به اسم "SHEET_DAILY" با ستون‌های:
 *   A: ساعت | B: شرح کار | C: وضعیت | D: زمان انجام
 * مسئول دفتر هر روز ساعت و شرح کار را می‌نویسد؛ دو ستون آخر را سیستم پر می‌کند.
 * -------------------------------------------------------------
 */

const SHEET_NAME = 'SHEET_DAILY';

const COL_TIME   = 1; // A ساعت
const COL_TASK   = 2; // B شرح کار
const COL_STATUS = 3; // C وضعیت
const COL_DONEAT = 4; // D زمان انجام

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ریمایندر دفتر')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getTasks() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh) return { rows: [], now: nowHM() };

  const last = sh.getLastRow();
  if (last < 2) return { rows: [], now: nowHM() };

  const data = sh.getRange(2, 1, last - 1, 4).getValues();
  const rows = [];
  data.forEach(function (r, i) {
    const task = String(r[COL_TASK - 1] || '').trim();
    if (!task) return;
    rows.push({
      row: i + 2,
      time: formatTime(r[COL_TIME - 1]),
      task: task,
      done: String(r[COL_STATUS - 1] || '').trim() === 'انجام شد',
      doneAt: r[COL_DONEAT - 1] ? formatTime(r[COL_DONEAT - 1]) : ''
    });
  });

  rows.sort(function (a, b) { return a.time.localeCompare(b.time); });
  return { rows: rows, now: nowHM() };
}

function markDone(rowNumber) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sh.getRange(rowNumber, COL_STATUS).setValue('انجام شد');
  sh.getRange(rowNumber, COL_DONEAT).setValue(nowHM());
  return getTasks();
}

function unmarkDone(rowNumber) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sh.getRange(rowNumber, COL_STATUS).setValue('');
  sh.getRange(rowNumber, COL_DONEAT).setValue('');
  return getTasks();
}

/* ---------- ابزارها ---------- */

function nowHM() {
  return Utilities.formatDate(new Date(), tz(), 'HH:mm');
}

function tz() {
  return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || 'Asia/Tehran';
}

function formatTime(val) {
  if (val === '' || val === null || val === undefined) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, tz(), 'HH:mm');
  }
  var s = String(val).trim().replace('٫', ':').replace('/', ':').replace('،', '');
  var m = s.match(/^(\d{1,2})[:.](\d{1,2})$/);
  if (m) return pad(m[1]) + ':' + pad(m[2]);
  if (/^\d{1,2}$/.test(s)) return pad(s) + ':00';
  return s;
}

function pad(n) { n = String(parseInt(n, 10)); return n.length < 2 ? '0' + n : n; }

/* ---------- تست ---------- */

function testRead() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('نام فایل: ' + ss.getName());

  const names = ss.getSheets().map(function (s) { return s.getName(); });
  Logger.log('تب‌های موجود: ' + JSON.stringify(names));

  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { Logger.log('❌ تب ' + SHEET_NAME + ' پیدا نشد'); return; }

  Logger.log('آخرین ردیف: ' + sh.getLastRow());
  Logger.log('محتوا: ' + JSON.stringify(sh.getRange(1, 1, Math.min(5, sh.getLastRow()), 4).getValues()));

  Logger.log('نتیجه getTasks: ' + JSON.stringify(getTasks()));
}
