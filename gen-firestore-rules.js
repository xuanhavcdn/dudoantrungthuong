// Regenerates firestore.rules from the match schedule in data.js.
// Run from the repo root:  node gen-firestore-rules.js
// Then deploy:             firebase deploy --only firestore:rules
const fs = require("fs");
const ROOT = __dirname;
const src = fs.readFileSync(ROOT + "/data.js", "utf8");
const code = src + "\nmodule.exports = { MATCHES };";
const m = new module.constructor();
m._compile(code, "data.js");
const MATCHES = m.exports.MATCHES;

const schedule = MATCHES.map(x => {
  const ms = Date.parse(x.date + "T" + x.time + ":00+07:00");
  if (isNaN(ms)) throw new Error("bad date for " + x.id);
  return "        '" + x.id + "': " + ms;
}).join(",\n");

const rules = `rules_version = '2';

// =============================================================================
// Firestore security rules for the World Cup 2026 prediction app.
//
// NO LOGIN MODEL: users self-identify with a typed name + email (no auth), so
// these rules CANNOT verify who someone is. What they DO enforce server-side:
//
//   - votes / voterLog : readable by all; can only be written/edited/deleted
//     BEFORE kickoff (server clock vs the trusted schedule below), with valid
//     scores. This is the real fix for "users could edit a vote after the match
//     started/ended" — it holds even if the device clock/timezone is wrong or
//     someone hits the DB directly.
//   - results : readable by all, writable from the app (in-app admin panel).
//
// NOTE: because there is no real authentication, the rules cannot stop someone
// from voting under another name, or from forging results. That is an accepted
// trade-off of the name+email model.
//
// Kickoff times below are GENERATED from data.js (Vietnam time, UTC+7) as epoch
// millis. If you change any match date/time in data.js, regenerate this file:
//     node gen-firestore-rules.js   then redeploy:
//     firebase deploy --only firestore:rules
// =============================================================================

service cloud.firestore {
  match /databases/{database}/documents {

    // ----- trusted kickoff schedule (epoch millis, UTC) -----
    function kickoffMillis(matchId) {
      return {
${schedule}
      }.get(matchId, 0);
    }
    // Voting is open only when the match exists in the schedule and kickoff is
    // still in the future (server clock). Unknown match -> 0 -> closed.
    function votingOpen(matchId) {
      return kickoffMillis(matchId) > 0
        && request.time.toMillis() < kickoffMillis(matchId);
    }

    // ----- value validation -----
    function validScore(v) {
      return v is int && v >= 0 && v <= 30;
    }
    // A vote/voterLog write must target a real, still-open match with sane
    // scores. docId is kept as "<email>_<matchId>" so each identity has a single
    // row per match (the app builds it this way). Other fields (choice, team
    // labels, timestamp) are allowed; user-controlled text is size-capped.
    function validVoteWrite(docId, data) {
      return data.email is string
        && data.matchId is string
        && docId == data.email + '_' + data.matchId
        && validScore(data.score1) && validScore(data.score2)
        && (!('name' in data) || (data.name is string && data.name.size() <= 80))
        && votingOpen(data.matchId);
    }

    // ===== results: public read, app-writable (in-app admin panel) =====
    match /results/{matchId} {
      allow read: if true;
      allow write: if request.method == 'delete'
        || (validScore(request.resource.data.score1)
            && validScore(request.resource.data.score2));
    }

    // ===== votes (one row per identity per match) =====
    match /votes/{docId} {
      allow read: if true;
      allow create, update: if validVoteWrite(docId, request.resource.data);
      // a vote may only be removed before kickoff
      allow delete: if votingOpen(resource.data.matchId);
    }

    // ===== voterLog (public scoreboard rows) =====
    match /voterLog/{docId} {
      allow read: if true;
      allow create, update: if validVoteWrite(docId, request.resource.data);
      allow delete: if votingOpen(resource.data.matchId);
    }

    // Deny everything else by default.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

fs.writeFileSync(ROOT + "/firestore.rules", rules);
console.log("wrote firestore.rules,", MATCHES.length, "matches embedded,", rules.split("\\n").length, "lines");
