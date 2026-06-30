// Firebase Sync — stores votes & voter log in Firestore
// Falls back to localStorage when Firebase is disabled

let db = null;

function initFirebase() {
  if (!CONFIG.FIREBASE_ENABLED) return;
  try {
    firebase.initializeApp(CONFIG.FIREBASE);
    db = firebase.firestore();
    console.log("Firebase connected");
  } catch (err) {
    console.error("Firebase init failed:", err);
    db = null;
  }
}

// Save a vote to Firestore (per user email + match)
async function fbSaveVote(matchId, voteData, userEmail) {
  if (!db) return;
  try {
    const docId = `${userEmail}_${matchId}`;
    await db.collection("votes").doc(docId).set({
      matchId,
      email: userEmail,
      ...voteData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error("Firebase save vote failed:", err);
  }
}

// Remove a vote from Firestore
async function fbRemoveVote(matchId, userEmail) {
  if (!db) return;
  try {
    const docId = `${userEmail}_${matchId}`;
    await db.collection("votes").doc(docId).delete();
  } catch (err) {
    console.error("Firebase remove vote failed:", err);
  }
}

// Save voter log entry to Firestore
async function fbSaveVoterLog(matchId, voterEntry) {
  if (!db) return;
  try {
    const docId = `${voterEntry.email}_${matchId}`;
    await db.collection("voterLog").doc(docId).set({
      matchId,
      ...voterEntry,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error("Firebase save voter log failed:", err);
  }
}

// Remove voter log entry from Firestore
async function fbRemoveVoterLog(matchId, userEmail) {
  if (!db) return;
  try {
    const docId = `${userEmail}_${matchId}`;
    await db.collection("voterLog").doc(docId).delete();
  } catch (err) {
    console.error("Firebase remove voter log failed:", err);
  }
}

// Load all votes from Firestore into local state
async function fbLoadAllVoterLogs() {
  if (!db) return;
  try {
    const snapshot = await db.collection("voterLog").get();
    const freshLog = {};
    snapshot.forEach(doc => {
      const d = doc.data();
      if (!freshLog[d.matchId]) freshLog[d.matchId] = [];
      freshLog[d.matchId].push({
        name: d.name,
        email: d.email,
        choice: d.choice,
        score1: d.score1,
        score2: d.score2,
        penWinner: d.penWinner,
        pen1: d.pen1,
        pen2: d.pen2,
        timestamp: d.timestamp,
      });
    });
    // Merge into local voterLog
    Object.assign(voterLog, freshLog);
    localStorage.setItem("wc2026_voterlog", JSON.stringify(voterLog));
  } catch (err) {
    console.error("Firebase load voter logs failed:", err);
  }
}

// Load current user's votes from Firestore
async function fbLoadUserVotes(userEmail) {
  if (!db) return;
  try {
    const snapshot = await db.collection("votes").where("email", "==", userEmail).get();
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.score1 !== undefined && d.score2 !== undefined) {
        const v = { score1: d.score1, score2: d.score2 };
        if (d.penWinner) v.penWinner = d.penWinner;
        if (d.pen1 != null && d.pen2 != null) { v.pen1 = d.pen1; v.pen2 = d.pen2; }
        votes[d.matchId] = v;
      } else if (d.choice) {
        votes[d.matchId] = d.choice;
      }
    });
    localStorage.setItem("wc2026_votes", JSON.stringify(votes));
  } catch (err) {
    console.error("Firebase load user votes failed:", err);
  }
}

// Save match result to Firestore.
// Full replace (no merge) so penalty fields are dropped when a result is edited
// from a level score back to a decisive one.
async function fbSaveResult(matchId, resultData) {
  if (!db) return;
  try {
    await db.collection("results").doc(matchId).set({
      matchId,
      ...resultData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Firebase save result failed:", err);
  }
}

// Load all results from Firestore
async function fbLoadResults() {
  if (!db) return;
  try {
    const snapshot = await db.collection("results").get();
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.score1 !== undefined && d.score2 !== undefined) {
        const r = { score1: d.score1, score2: d.score2 };
        if (d.pen1 != null && d.pen2 != null) { r.pen1 = d.pen1; r.pen2 = d.pen2; }
        results[d.matchId] = r;
      }
    });
    localStorage.setItem("wc2026_results", JSON.stringify(results));
  } catch (err) {
    console.error("Firebase load results failed:", err);
  }
}

// Delete match result from Firestore
async function fbDeleteResult(matchId) {
  if (!db) return;
  try {
    await db.collection("results").doc(matchId).delete();
  } catch (err) {
    console.error("Firebase delete result failed:", err);
  }
}

// Full sync: load everything from Firestore
async function fbFullSync() {
  if (!db) return;
  await fbLoadResults();
  await fbLoadAllVoterLogs();
  if (userProfile && userProfile.email) {
    await fbLoadUserVotes(userProfile.email);
  }
}

// Initialize on load
initFirebase();
