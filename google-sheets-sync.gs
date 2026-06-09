/**
 * Google Sheets live sync for World Cup 2026 vote data.
 *
 * SETUP (one time, ~3 minutes):
 *   1. Create a new Google Sheet (sheets.new). This is your live, online spreadsheet.
 *   2. Extensions -> Apps Script. Delete the sample code and paste this whole file.
 *   3. Click Deploy -> New deployment -> type "Web app".
 *        - Description: WC2026 vote sync
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Click Deploy, authorize when prompted, and COPY the Web app URL.
 *   4. Paste that URL into CONFIG.SHEETS_WEBHOOK_URL in config.js, then redeploy your site.
 *
 * After this, every vote (and vote removal) appears/updates live in the Sheet.
 * The header row is frozen and an auto-filter is enabled, so you can click the
 * Email column's filter to view one person's predictions. File -> Download ->
 * Microsoft Excel (.xlsx) gives you a real Excel file anytime.
 *
 * Each row is keyed by email + matchId, so re-voting overwrites the same row
 * (no duplicates) and removing a vote deletes the row.
 */

var SHEET_NAME = "Votes";

// Column order — must match the keys produced by sheets-sync.js gsBuildRow().
var HEADERS = [
  "Timestamp", "Email", "Name", "Match ID", "Round", "Date", "Time",
  "Match", "Team 1", "Team 2", "Score 1", "Score 2", "Prediction", "Predicted Winner"
];

function rowFromPayload(r) {
  return [
    r.timestamp || "", r.email || "", r.name || "", r.matchId || "", r.round || "",
    r.date || "", r.time || "", r.match || "", r.team1 || "", r.team2 || "",
    r.score1, r.score2, r.prediction || "", r.predictedWinner || ""
  ];
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // Ensure header row exists, is frozen, and filterable
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
  }
  return sheet;
}

// Find the row index (1-based) matching email + matchId, or -1 if none.
function findRow(sheet, email, matchId) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var values = sheet.getRange(2, 2, last - 1, 3).getValues(); // cols B(email)..D(matchId)
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(email) && String(values[i][2]) === String(matchId)) {
      return i + 2; // offset for header + 0-index
    }
  }
  return -1;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // serialize concurrent writes to avoid clobbering
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    if (data.action === "delete") {
      var delRow = findRow(sheet, data.email, data.matchId);
      if (delRow > 0) sheet.deleteRow(delRow);
      return ok({ deleted: delRow > 0 });
    }

    // default: upsert
    var r = data.row || {};
    var existing = findRow(sheet, r.email, r.matchId);
    var rowValues = rowFromPayload(r);
    if (existing > 0) {
      sheet.getRange(existing, 1, 1, HEADERS.length).setValues([rowValues]);
      return ok({ updated: true, row: existing });
    } else {
      sheet.appendRow(rowValues);
      return ok({ inserted: true });
    }
  } catch (err) {
    return ok({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function ok(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: visit the web app URL in a browser to confirm it's live.
function doGet() {
  return ok({ status: "WC2026 vote sync is running" });
}
