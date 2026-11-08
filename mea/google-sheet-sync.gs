/**
 * MEA Database – keeps this Google Sheet in step with the MEA website.
 * Paste into Extensions > Apps Script in the "MEA Database" sheet, then run setup() once.
 * It copies students, teachers & staff, courses, enrolments, results, certificates,
 * inventory, orders and enquiries every 15 minutes.
 */
const MEA_URL = 'https://mea-engineering.pages.dev/api/export';
const MEA_KEY = 'PASTE_EXPORT_KEY_HERE';

function syncMEA() {
  const res = UrlFetchApp.fetch(MEA_URL, { headers: { 'x-export-key': MEA_KEY }, muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('MEA website said: ' + res.getContentText());
  const data = JSON.parse(res.getContentText());
  const ss = SpreadsheetApp.getActive();
  Object.keys(data.sheets).forEach(function (name) {
    const rows = data.sheets[name].map(function (r) { return r.map(function (v) { return v === null ? '' : v; }); });
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clearContents();
    if (!rows.length) return;
    const width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    const square = rows.map(function (r) { while (r.length < width) r.push(''); return r; });
    sh.getRange(1, 1, square.length, width).setValues(square);
    sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#e3f0ff');
    sh.setFrozenRows(1);
  });
  const sum = ss.getSheetByName('Summary');
  if (sum) sum.getRange('A2:B2').setValues([['Last updated', Utilities.formatDate(new Date(), 'Australia/Sydney', 'yyyy-MM-dd HH:mm') + ' (updates every 15 minutes)']]);
}

/** Run this once. It asks for permission, copies the data now and sets the 15-minute update. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'syncMEA') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('syncMEA').timeBased().everyMinutes(15).create();
  syncMEA();
}

/** Adds an "MEA" menu so you can update by hand too. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('MEA').addItem('Update now', 'syncMEA').addToUi();
}
