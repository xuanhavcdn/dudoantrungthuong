// Google Sheets live sync — POSTs every vote to a Google Apps Script web app,
// which upserts one row per (email + match) in a live, online spreadsheet.
//
// Setup: open google-sheets-sync.gs, follow the steps, then paste the deployed
// web app URL into CONFIG.SHEETS_WEBHOOK_URL in config.js.
//
// Note: we send Content-Type text/plain and mode "no-cors" so the browser makes
// a "simple" request (no CORS preflight, which Apps Script can't answer). The
// response can't be read in no-cors mode — that's fine, this is fire-and-forget.

function gsEnabled() {
  return typeof CONFIG !== "undefined"
    && typeof CONFIG.SHEETS_WEBHOOK_URL === "string"
    && CONFIG.SHEETS_WEBHOOK_URL.startsWith("http");
}

function gsPost(payload) {
  if (!gsEnabled()) return;
  try {
    fetch(CONFIG.SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Sheets sync failed:", err));
  } catch (err) {
    console.error("Sheets sync error:", err);
  }
}

// Build a flat, stable row for one vote (column order is fixed by the script).
function gsBuildRow(match, choice, score1, score2) {
  const choiceName = choice === "team1" ? match.team1
    : choice === "team2" ? match.team2 : "Draw";
  return {
    timestamp: new Date().toISOString(),
    email: userProfile ? userProfile.email : "",
    name: userProfile ? userProfile.name : "",
    matchId: match.id,
    round: match.group ? ("Group " + match.group) : (match.round || ""),
    date: match.date,
    time: match.time,
    match: `${match.team1} vs ${match.team2}`,
    team1: match.team1,
    team2: match.team2,
    score1,
    score2,
    prediction: `${score1}-${score2}`,
    predictedWinner: choiceName,
  };
}

// Upsert a vote row in the Sheet
function gsSaveVote(match, choice, score1, score2) {
  gsPost({ action: "upsert", row: gsBuildRow(match, choice, score1, score2) });
}

// Delete a vote row from the Sheet (keyed by email + matchId)
function gsRemoveVote(matchId, email) {
  gsPost({ action: "delete", email, matchId });
}
