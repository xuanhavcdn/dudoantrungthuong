// State
let currentView = "matches";
let currentGroup = "all";
let votes = JSON.parse(localStorage.getItem("wc2026_votes") || "{}");
let voterLog = JSON.parse(localStorage.getItem("wc2026_voterlog") || "{}"); // { matchId: [ {name, email, choice, timestamp} ] }
let results = JSON.parse(localStorage.getItem("wc2026_results") || "{}");
let userProfile = JSON.parse(localStorage.getItem("wc2026_user") || "null");
let pendingVote = null;
let expandedVoters = {}; // track which match cards have voter list open
let winnersMatchFilter = "all"; // filter for winners tab
let winnersGroupFilter = "all"; // group filter for winners tab
let currentDateFilter = "all"; // date filter: "all", "today", "3days", or a specific date
let currentStatusFilter = "all"; // status filter: "all", "upcoming", "finished"
let adminMode = localStorage.getItem("wc2026_admin") === "true";

// DOM
const mainContent = document.getElementById("mainContent");
const groupFilter = document.getElementById("groupFilter");
const toast = document.getElementById("toast");
const profileModal = document.getElementById("profileModal");

// Load test data from config
function loadTestData() {
  if (!CONFIG.TEST_MODE || !CONFIG.TEST_DATA) return;
  const td = CONFIG.TEST_DATA;
  if (td.results) Object.assign(results, td.results);
  if (td.voterLog) {
    for (const [matchId, voters] of Object.entries(td.voterLog)) {
      if (!voterLog[matchId]) voterLog[matchId] = [];
      voters.forEach(v => {
        if (!voterLog[matchId].some(existing => existing.email === v.email)) {
          voterLog[matchId].push(v);
        }
      });
    }
  }
  localStorage.setItem("wc2026_results", JSON.stringify(results));
  localStorage.setItem("wc2026_voterlog", JSON.stringify(voterLog));
}

// One-time local reset — purges cached match data when DATA_RESET_TOKEN changes.
// Keeps the user's profile (name/email) so people aren't logged out.
function maybeResetLocalData() {
  const token = CONFIG.DATA_RESET_TOKEN || "";
  if (!token) return;
  if (localStorage.getItem("wc2026_reset_token") === token) return;
  ["wc2026_votes", "wc2026_voterlog", "wc2026_results"].forEach(k => localStorage.removeItem(k));
  votes = {};
  voterLog = {};
  results = {};
  localStorage.setItem("wc2026_reset_token", token);
}

// Init
async function init() {
  maybeResetLocalData();
  loadTestData();
  migrateOldVotes();
  setupNavTabs();
  setupGroupFilter();
  renderUserBadge();
  createFallingIcons();
  await fbFullSync();
  render();
  startAutoRefresh();
  startCountdownTicker();
}

function createFallingIcons() {
  const container = document.createElement("div");
  container.className = "falling-icons";
  document.body.appendChild(container);
  const icons = ["⚽", "🏆", "🥅", "⚽", "🏆", "⚽", "🏆", "⚽"];
  for (let i = 0; i < 12; i++) {
    const icon = document.createElement("span");
    icon.className = "falling-icon";
    icon.textContent = icons[i % icons.length];
    icon.style.left = (Math.random() * 100) + "%";
    icon.style.animationDuration = (3 + Math.random() * 5) + "s";
    icon.style.animationDelay = (Math.random() * 4) + "s";
    icon.style.fontSize = (1.2 + Math.random() * 1.0) + "rem";
    container.appendChild(icon);
  }
}

function startAutoRefresh() {
  if (CONFIG.AUTO_REFRESH_MINUTES > 0) {
    setInterval(() => fetchResults(), CONFIG.AUTO_REFRESH_MINUTES * 60 * 1000);
  }
}

// Live countdown — ticks every second, refreshes the view at kickoff to lock voting
function startCountdownTicker() {
  setInterval(updateCountdowns, 1000);
}

// Returns HTML segments: [1 d] [08 h] [34 m] [59 s] — days hidden when 0
function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = n => String(n).padStart(2, "0");
  const seg = (val, unit) => `<span class="cd-seg"><span class="cd-num">${val}</span><span class="cd-unit">${unit}</span></span>`;
  return (d > 0 ? seg(d, "d") : "") + seg(pad(h), "h") + seg(pad(m), "m") + seg(pad(s), "s");
}

// Human-readable voting window, e.g. "5 days" or "36h"
function formatVoteWindow() {
  const hours = CONFIG.VOTE_OPEN_BEFORE_HOURS;
  return hours % 24 === 0 ? `${hours / 24} days` : `${hours}h`;
}

function updateCountdowns() {
  const now = Date.now();
  let needsRerender = false;
  document.querySelectorAll(".match-countdown").forEach(el => {
    const kickoff = parseInt(el.dataset.kickoff, 10);
    const ms = kickoff - now;
    if (ms <= 0) {
      needsRerender = true; // kickoff reached — re-render so voting/removal lock in
      return;
    }
    const timeEl = el.querySelector(".countdown-time");
    if (timeEl) timeEl.innerHTML = formatCountdown(ms);
  });
  if (needsRerender) render();
}

// Migrate votes that exist without voter log entries
function migrateOldVotes() {
  if (!userProfile) return;
  let changed = false;
  for (const [matchId, choice] of Object.entries(votes)) {
    if (!voterLog[matchId]) voterLog[matchId] = [];
    const alreadyLogged = voterLog[matchId].some(v => v.email === userProfile.email);
    if (!alreadyLogged) {
      voterLog[matchId].push({
        name: userProfile.name,
        email: userProfile.email || null,
        choice,
        timestamp: new Date().toISOString()
      });
      changed = true;
    }
  }
  if (changed) {
    localStorage.setItem("wc2026_voterlog", JSON.stringify(voterLog));
  }
}

// Navigation
function setupNavTabs() {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentView = tab.dataset.view;
      groupFilter.style.display = (currentView === "matches" || currentView === "standings") ? "flex" : "none";
      mainContent.classList.toggle("bracket-mode", currentView === "bracket");
      render();
    });
  });
}

function setupGroupFilter() {
  GROUPS.forEach(g => {
    const btn = document.createElement("button");
    btn.className = "group-btn";
    btn.dataset.group = g;
    btn.textContent = `Group ${g}`;
    groupFilter.appendChild(btn);
  });

  // Add knockout stages
  ["R32", "R16", "QF", "SF", "FINAL"].forEach(r => {
    const btn = document.createElement("button");
    btn.className = "group-btn";
    btn.dataset.group = r;
    const labels = { R32: "R32", R16: "R16", QF: "QF", SF: "SF", FINAL: "Final" };
    btn.textContent = labels[r];
    groupFilter.appendChild(btn);
  });

  groupFilter.addEventListener("click", (e) => {
    if (!e.target.classList.contains("group-btn")) return;
    document.querySelectorAll(".group-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    currentGroup = e.target.dataset.group;
    render();
  });
}

// Render
function render() {
  switch (currentView) {
    case "matches": renderMatches(); break;
    case "standings": renderStandings(); break;
    case "bracket": renderBracket(); break;
    case "winners": renderWinners(); break;
    case "my-votes": renderMyVotes(); break;
  }
}

// Match status
function getMatchStatus(match) {
  if (results[match.id]) return "finished";
  const matchDate = new Date(`${match.date}T${match.time}:00`);
  const now = new Date();
  if (now >= matchDate && now <= new Date(matchDate.getTime() + 2 * 60 * 60 * 1000)) return "live";
  if (now > matchDate) return "past";
  return "upcoming";
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// All match dates/times in data.js are stored in Vietnam time (UTC+7).

// Date filter
function setDateFilter(filter) {
  currentDateFilter = filter;
  render();
}

function setStatusFilter(filter) {
  currentStatusFilter = filter;
  render();
}

function filterByDate(matches) {
  if (currentDateFilter === "all") return matches;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (currentDateFilter === "today") {
    const todayStr = today.toISOString().slice(0, 10);
    return matches.filter(m => m.date === todayStr);
  }
  if (currentDateFilter === "3days") {
    const end = new Date(today);
    end.setDate(end.getDate() + 3);
    return matches.filter(m => {
      const d = new Date(m.date + "T00:00:00");
      return d >= today && d < end;
    });
  }
  return matches.filter(m => m.date === currentDateFilter);
}

function filterByStatus(matches) {
  if (currentStatusFilter === "all") return matches;
  if (currentStatusFilter === "finished") return matches.filter(m => results[m.id]);
  // "upcoming" includes upcoming, live, past without result
  return matches.filter(m => !results[m.id]);
}

function getRoundLabel(match) {
  if (match.id.startsWith("R32")) return "Round of 32";
  if (match.id.startsWith("R16")) return "Round of 16";
  if (match.id.startsWith("QF")) return "Quarter-finals";
  if (match.id.startsWith("SF")) return "Semi-finals";
  if (match.id.startsWith("3P")) return "3rd Place";
  if (match.id.startsWith("F")) return "Final";
  return "Group " + match.group;
}

function renderMatchFilters() {
  // Show dates only for the currently selected group/round
  const knockoutRounds = ["R32", "R16", "QF", "SF", "FINAL"];
  let scopedMatches;
  if (currentGroup === "all") {
    scopedMatches = MATCHES;
  } else if (knockoutRounds.includes(currentGroup)) {
    scopedMatches = MATCHES.filter(m => m.round === currentGroup || (currentGroup === "FINAL" && m.round === "3P"));
  } else {
    scopedMatches = MATCHES.filter(m => m.group === currentGroup);
  }
  const allDates = [...new Set(scopedMatches.map(m => m.date))].sort();
  const finishedCount = scopedMatches.filter(m => results[m.id]).length;
  const upcomingCount = scopedMatches.length - finishedCount;

  let html = `<div class="match-filters">`;

  // Status filter row
  html += `<div class="filter-row">
    <button class="date-filter-btn ${currentStatusFilter === 'all' ? 'active' : ''}" onclick="setStatusFilter('all')">All</button>
    <button class="date-filter-btn ${currentStatusFilter === 'upcoming' ? 'active' : ''}" onclick="setStatusFilter('upcoming')">Upcoming (${upcomingCount})</button>
    <button class="date-filter-btn ${currentStatusFilter === 'finished' ? 'active' : ''}" onclick="setStatusFilter('finished')">Finished (${finishedCount})</button>
  </div>`;

  // Date filter row
  html += `<div class="filter-row">
    <button class="date-filter-btn ${currentDateFilter === 'all' ? 'active' : ''}" onclick="setDateFilter('all')">All Dates</button>
    <button class="date-filter-btn ${currentDateFilter === 'today' ? 'active' : ''}" onclick="setDateFilter('today')">Today</button>
    <button class="date-filter-btn ${currentDateFilter === '3days' ? 'active' : ''}" onclick="setDateFilter('3days')">Next 3 Days</button>`;
  allDates.forEach(d => {
    const label = new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    html += `<button class="date-filter-btn ${currentDateFilter === d ? 'active' : ''}" onclick="setDateFilter('${d}')">${label}</button>`;
  });
  html += `</div></div>`;
  return html;
}

// Matches View
function renderMatches() {
  const knockoutRounds = ["R32", "R16", "QF", "SF", "FINAL"];
  let filtered;
  if (currentGroup === "all") {
    filtered = MATCHES;
  } else if (knockoutRounds.includes(currentGroup)) {
    filtered = MATCHES.filter(m => m.round === currentGroup || (currentGroup === "FINAL" && m.round === "3P"));
  } else {
    filtered = MATCHES.filter(m => m.group === currentGroup);
  }
  filtered = filterByDate(filtered);
  filtered = filterByStatus(filtered);

  const filterHtml = renderMatchFilters();

  if (filtered.length === 0) {
    mainContent.innerHTML = filterHtml + `<div class="no-results"><div class="no-results-icon">⚽</div><p>No matches found</p></div>`;
    return;
  }

  // Split into upcoming and finished, finished goes to end
  const upcoming = filtered.filter(m => !results[m.id]);
  const finished = filtered.filter(m => results[m.id]);
  const sorted = [...upcoming, ...finished];

  // Group matches by date
  const byDate = {};
  sorted.forEach(m => {
    if (!byDate[m.date]) byDate[m.date] = [];
    byDate[m.date].push(m);
  });

  let html = filterHtml + `<button class="fetch-btn" onclick="fetchResults()">Fetch Latest Results</button>`;

  // Render upcoming first
  let hasUpcoming = false;
  for (const [date, matches] of Object.entries(byDate)) {
    const upcomingInDate = matches.filter(m => !results[m.id]);
    if (upcomingInDate.length === 0) continue;
    hasUpcoming = true;
    html += `<div style="margin: 20px 0 12px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">${formatDate(date)}</div>`;
    upcomingInDate.forEach(m => { html += renderMatchCard(m); });
  }

  // Render finished at the end
  const finishedInFiltered = filtered.filter(m => results[m.id]);
  if (finishedInFiltered.length > 0) {
    if (hasUpcoming) {
      html += `<div style="margin: 28px 0 12px; font-size: 0.9rem; font-weight: 700; color: var(--text-dim); border-top: 1px solid var(--border); padding-top: 16px;">Finished Matches</div>`;
    }
    const finishedByDate = {};
    finishedInFiltered.forEach(m => {
      if (!finishedByDate[m.date]) finishedByDate[m.date] = [];
      finishedByDate[m.date].push(m);
    });
    for (const [date, matches] of Object.entries(finishedByDate)) {
      html += `<div style="margin: 20px 0 12px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">${formatDate(date)}</div>`;
      matches.forEach(m => { html += renderMatchCard(m); });
    }
  }

  mainContent.innerHTML = html;
}

// Resolve knockout match teams from bracket data
function resolveKnockoutTeams(match) {
  if (match.group) return { team1: match.team1, team2: match.team2, flag1: match.flag1, flag2: match.flag2 };

  let t1 = { name: match.team1, flag: match.flag1 || "" };
  let t2 = { name: match.team2, flag: match.flag2 || "" };

  // R32: resolve from group slots
  if (match.slot1) t1 = getBracketSlotTeam(match.slot1);
  if (match.slot2) t2 = getBracketSlotTeam(match.slot2);

  // R16+: resolve from previous round winners/losers
  if (match.from) {
    const bracketDef = BRACKET[match.id];
    if (bracketDef) {
      const teams = getBracketMatchTeams(bracketDef);
      t1 = teams.team1.name !== "TBD" ? teams.team1 : { name: teams.label1, flag: "" };
      t2 = teams.team2.name !== "TBD" ? teams.team2 : { name: teams.label2, flag: "" };
    }
  }

  return { team1: t1.name, team2: t2.name, flag1: t1.flag || "", flag2: t2.flag || "" };
}

function renderMatchCard(match) {
  const status = getMatchStatus(match);
  const result = results[match.id];
  const vote = votes[match.id];
  const totalVotes = getVoteCounts(match.id);

  const matchDate = new Date(`${match.date}T${match.time}:00`);
  const now = new Date();
  const locked = now >= matchDate;
  const notYetOpen = (matchDate - now) > CONFIG.VOTE_OPEN_BEFORE_HOURS * 60 * 60 * 1000;
  const votingDisabled = locked || notYetOpen;

  // Countdown — shown when voting is open (within the voting window) and the match hasn't started or finished
  const msToKickoff = matchDate - now;
  const withinWindow = !result && !locked && msToKickoff > 0 && msToKickoff <= CONFIG.VOTE_OPEN_BEFORE_HOURS * 60 * 60 * 1000;
  const countdownHtml = withinWindow ? `
    <div class="match-countdown" data-kickoff="${matchDate.getTime()}">
      <span class="countdown-icon">⏱️</span>
      <span class="countdown-label">Voting closes in</span>
      <span class="countdown-time">${formatCountdown(msToKickoff)}</span>
    </div>
  ` : '';

  // Resolve team names for knockout matches
  const resolved = resolveKnockoutTeams(match);
  const team1 = resolved.team1;
  const team2 = resolved.team2;
  const flag1 = resolved.flag1;
  const flag2 = resolved.flag2;

  let scoreHtml = `<div class="match-vs">VS</div>`;
  if (result) {
    scoreHtml = `<div class="match-score">${result.score1} - ${result.score2}</div>`;
  }

  let statusClass = status === "past" ? "upcoming" : status;
  let statusText = status === "upcoming" ? "Upcoming" : status === "live" ? "LIVE" : status === "past" ? "Awaiting Result" : "Finished";
  if (result) { statusClass = "finished"; statusText = "Finished"; }

  // Determine winner for vote highlighting
  let winner = null;
  if (result) {
    if (result.score1 > result.score2) winner = "team1";
    else if (result.score2 > result.score1) winner = "team2";
    else winner = "draw";
  }

  // Round label
  const roundLabel = match.group ? `GROUP ${match.group}` : getRoundLabel(match);
  const roundClass = match.group ? "match-group" : "match-round";

  return `
    <div class="match-card ${result ? 'finished' : ''}">
      <div class="match-meta">
        <span class="${roundClass}">${roundLabel}</span>
        <span class="match-datetime">${match.time} (giờ VN)</span>
        <span class="match-status ${statusClass}">${statusText}</span>
      </div>
      <div class="match-teams">
        <div class="team ${winner === 'team1' ? 'team-winner' : ''}">
          <span class="team-flag">${flag1}</span>
          <span class="team-name">${team1}</span>
        </div>
        ${scoreHtml}
        <div class="team right ${winner === 'team2' ? 'team-winner' : ''}">
          <span class="team-flag">${flag2}</span>
          <span class="team-name">${team2}</span>
        </div>
      </div>
      ${result ? `<div class="match-winner-banner">${winner === 'draw' ? 'Draw' : `${winner === 'team1' ? flag1 + ' ' + team1 : flag2 + ' ' + team2} wins!`}</div>` : ''}
      ${countdownHtml}
      ${renderVoteForm({...match, team1, team2, flag1, flag2}, vote, votingDisabled, locked, notYetOpen, result, winner, totalVotes)}
      ${isAdmin() ? renderAdminPanel(match, result, team1, team2, flag1, flag2) : ''}
    </div>
  `;
}

function renderAdminPanel(match, result, team1, team2, flag1, flag2) {
  const s1 = result ? result.score1 : '';
  const s2 = result ? result.score2 : '';
  return `
    <div class="admin-panel">
      <div class="admin-label">ADMIN: Enter Result</div>
      <div class="admin-form">
        <span class="admin-team">${flag1} ${team1}</span>
        <input type="number" min="0" max="20" class="svf-input" id="res-s1-${match.id}" value="${s1}" placeholder="0">
        <span class="svf-separator">-</span>
        <input type="number" min="0" max="20" class="svf-input" id="res-s2-${match.id}" value="${s2}" placeholder="0">
        <span class="admin-team">${team2} ${flag2}</span>
        <button class="admin-save-btn" onclick="submitResult('${match.id}')">Save</button>
        ${result ? `<button class="admin-delete-btn" onclick="deleteResult('${match.id}')">Delete</button>` : ''}
      </div>
    </div>
  `;
}

// Vote Form
function renderVoteForm(match, vote, votingDisabled, locked, notYetOpen, result, winner, totalVotes) {
  // vote is now an object: { score1, score2 } or legacy string
  const userVote = typeof vote === 'object' && vote !== null ? vote : null;
  const userChoice = userVote ? (userVote.score1 > userVote.score2 ? 'team1' : userVote.score2 > userVote.score1 ? 'team2' : 'draw') : (typeof vote === 'string' ? vote : null);

  let voteResultClass = '';
  if (userVote && result) {
    const exactMatch = userVote.score1 === result.score1 && userVote.score2 === result.score2;
    const correctWinner = userChoice === winner;
    if (exactMatch) voteResultClass = 'vote-exact';
    else if (correctWinner) voteResultClass = 'vote-correct-winner';
    else voteResultClass = 'vote-wrong';
  }

  // Show user's prediction (locked: after match started or finished)
  const showLockedPrediction = userVote && (locked || result || notYetOpen);
  const userPredictionHtml = showLockedPrediction ? `
    <div class="user-prediction ${voteResultClass}">
      <span class="prediction-label">Your prediction:</span>
      <span class="prediction-score">${match.team1} ${userVote.score1} - ${userVote.score2} ${match.team2}</span>
      ${result ? (voteResultClass === 'vote-exact' ? '<span class="prediction-badge exact">Win (exact!)</span>' : voteResultClass === 'vote-correct-winner' ? '<span class="prediction-badge correct">Win</span>' : '<span class="prediction-badge wrong">Lose</span>') : ''}
    </div>
  ` : '';

  // Vote bar
  const voteBarHtml = totalVotes.total > 0 ? `
    <div class="vote-bar-container">
      <div class="vote-bar team1" style="width: ${(totalVotes.team1 / totalVotes.total * 100)}%"></div>
      <div class="vote-bar draw" style="width: ${(totalVotes.draw / totalVotes.total * 100)}%"></div>
      <div class="vote-bar team2" style="width: ${(totalVotes.team2 / totalVotes.total * 100)}%"></div>
    </div>
    <div class="vote-bar-labels">
      <span class="vbl-team1">${match.team1}: ${plural(totalVotes.team1, 'vote')}</span>
      <span class="vbl-draw">Draw: ${plural(totalVotes.draw, 'vote')}</span>
      <span class="vbl-team2">${match.team2}: ${plural(totalVotes.team2, 'vote')}</span>
    </div>
  ` : '';

  // Score input form — show whenever match hasn't started and no result (allows editing existing vote)
  let formHtml = '';
  if (!result && !locked && !notYetOpen) {
    const s1 = userVote ? userVote.score1 : '';
    const s2 = userVote ? userVote.score2 : '';
    formHtml = `
      <div class="score-vote-form">
        <span class="svf-team">${match.flag1} ${match.team1}</span>
        <input type="number" min="0" max="20" class="svf-input" id="svf-s1-${match.id}" value="${s1}" placeholder="0">
        <span class="svf-separator">-</span>
        <input type="number" min="0" max="20" class="svf-input" id="svf-s2-${match.id}" value="${s2}" placeholder="0">
        <span class="svf-team">${match.team2} ${match.flag2}</span>
        <button class="svf-btn" onclick="castScoreVote('${match.id}')">${userVote ? 'Update' : 'Vote'}</button>
      </div>
    `;
  } else if (locked && !result) {
    formHtml = !userVote ? '<div class="vote-locked-msg">Voting locked - match has started</div>' : '';
  } else if (notYetOpen) {
    formHtml = `<div class="vote-locked-msg">Voting opens ${formatVoteWindow()} before kickoff</div>`;
  }

  // Voter toggle
  const voterToggle = totalVotes.total > 0 ? `
    <button class="voters-toggle" onclick="toggleVoters('${match.id}')">
      ${expandedVoters[match.id] ? 'Hide' : 'View'} ${plural(totalVotes.total, 'Voter')}
    </button>
    ${expandedVoters[match.id] ? renderVoterList(match) : ''}
  ` : '';

  return `${userPredictionHtml}${formHtml}${voteBarHtml}${voterToggle}`;
}

// User Profile
function renderUserBadge() {
  const existing = document.getElementById("userBadge");
  if (existing) existing.remove();
  const existingAdmin = document.getElementById("adminToggle");
  if (existingAdmin) existingAdmin.remove();

  if (userProfile) {
    const badge = document.createElement("div");
    badge.className = "user-badge";
    badge.id = "userBadge";
    badge.onclick = () => openProfileModal();
    badge.innerHTML = `
      <span class="user-badge-name">${escapeHtml(userProfile.name)}</span>
      <span class="user-badge-edit">edit</span>
    `;
    document.querySelector(".header").appendChild(badge);
  } else {
    const loginBtn = document.createElement("div");
    loginBtn.className = "user-badge login-btn";
    loginBtn.id = "userBadge";
    loginBtn.onclick = () => openProfileModal();
    loginBtn.innerHTML = `<span class="user-badge-name">Login to Vote</span>`;
    document.querySelector(".header").appendChild(loginBtn);
  }

  // Admin toggle button (always visible)
  const adminBtn = document.createElement("button");
  adminBtn.className = `admin-toggle ${adminMode ? 'active' : ''}`;
  adminBtn.id = "adminToggle";
  adminBtn.onclick = toggleAdminMode;
  adminBtn.textContent = adminMode ? "Admin ON" : "Admin";
  document.querySelector(".header").appendChild(adminBtn);
}

function openProfileModal() {
  document.getElementById("userName").value = userProfile ? userProfile.name : "";
  document.getElementById("userEmail").value = userProfile ? (userProfile.email || "") : "";
  profileModal.classList.add("show");
}

function submitProfile(e) {
  e.preventDefault();
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  if (!name || !email) return;

  userProfile = { name, email };
  localStorage.setItem("wc2026_user", JSON.stringify(userProfile));
  profileModal.classList.remove("show");
  renderUserBadge();
  showToast(`Welcome, ${userProfile.name}!`);

  // Process pending vote if any
  if (pendingVote) {
    const pv = pendingVote;
    const choice = pv.score1 > pv.score2 ? "team1" : pv.score2 > pv.score1 ? "team2" : "draw";
    recordVote(pv.matchId, choice, pv.score1, pv.score2);
    pendingVote = null;
    render();
  }
  return false;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Close modal on overlay click
profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) {
    profileModal.classList.remove("show");
    pendingVote = null;
  }
});

// Voting
function checkVotingWindow(matchId) {
  const match = MATCHES.find(m => m.id === matchId);
  const label = match ? `${match.team1} vs ${match.team2}` : matchId;
  if (results[matchId]) return `${label} — match already finished!`;
  if (match) {
    const matchDate = new Date(`${match.date}T${match.time}:00`);
    const now = new Date();
    if (now >= matchDate) return `${label} — voting locked, match has started!`;
    if ((matchDate - now) > CONFIG.VOTE_OPEN_BEFORE_HOURS * 60 * 60 * 1000) return `${label} — voting opens ${formatVoteWindow()} before kickoff`;
  }
  return null;
}

function castScoreVote(matchId) {
  const err = checkVotingWindow(matchId);
  if (err) { showToast(err, "error"); return; }

  if (!userProfile) {
    const s1 = parseInt(document.getElementById(`svf-s1-${matchId}`).value);
    const s2 = parseInt(document.getElementById(`svf-s2-${matchId}`).value);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) { showToast("Enter valid scores", "error"); return; }
    pendingVote = { matchId, score1: s1, score2: s2 };
    openProfileModal();
    return;
  }

  const s1 = parseInt(document.getElementById(`svf-s1-${matchId}`).value);
  const s2 = parseInt(document.getElementById(`svf-s2-${matchId}`).value);
  if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
    showToast("Enter valid scores", "error");
    return;
  }

  const isUpdate = !!votes[matchId];
  const choice = s1 > s2 ? "team1" : s2 > s1 ? "team2" : "draw";
  recordVote(matchId, choice, s1, s2, isUpdate);
  render();
}

function recordVote(matchId, choice, score1, score2, isUpdate) {
  votes[matchId] = { score1, score2 };
  localStorage.setItem("wc2026_votes", JSON.stringify(votes));

  const match = MATCHES.find(m => m.id === matchId);
  const choiceName = choice === "team1" ? match.team1 : choice === "team2" ? match.team2 : "Draw";

  // Add to voter log
  if (!voterLog[matchId]) voterLog[matchId] = [];
  voterLog[matchId] = voterLog[matchId].filter(v => v.email !== userProfile.email);
  voterLog[matchId].push({
    name: userProfile.name,
    email: userProfile.email || null,
    choice,
    score1,
    score2,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("wc2026_voterlog", JSON.stringify(voterLog));

  // Sync to Firebase with readable fields
  const fbData = {
    name: userProfile.name,
    email: userProfile.email,
    matchId,
    match: `${match.team1} vs ${match.team2}`,
    predictedWinner: choiceName,
    [match.team1]: score1,
    [match.team2]: score2,
    choice,
    score1,
    score2,
    timestamp: new Date().toISOString(),
  };
  fbSaveVote(matchId, fbData, userProfile.email);
  fbSaveVoterLog(matchId, fbData);

  // Sync to live Google Sheet (no-op if SHEETS_WEBHOOK_URL is empty)
  if (typeof gsSaveVote === "function") gsSaveVote(match, choice, score1, score2);

  const matchLabel = `${match.team1} ${score1}-${score2} ${match.team2}`;
  showToast(isUpdate ? `Vote updated: ${matchLabel}` : `Vote recorded: ${matchLabel}`, "success");
}

function confirmRemoveVote(matchId) {
  const match = MATCHES.find(m => m.id === matchId);
  const label = match ? `${match.team1} vs ${match.team2}` : matchId;

  // Guard: cannot delete once the match has started or has a result
  if (results[matchId]) {
    showToast(`${label} — match already finished, vote can't be removed!`, "error");
    render();
    return;
  }
  if (match) {
    const matchDate = new Date(`${match.date}T${match.time}:00`);
    if (new Date() >= matchDate) {
      showToast(`${label} — match has started, vote can't be removed!`, "error");
      render();
      return;
    }
  }

  if (confirm(`Remove your vote for ${label}?`)) {
    removeVote(matchId);
    render();
  }
}

function removeVote(matchId) {
  const match = MATCHES.find(m => m.id === matchId);
  delete votes[matchId];
  localStorage.setItem("wc2026_votes", JSON.stringify(votes));

  // Remove from voter log
  if (voterLog[matchId]) {
    voterLog[matchId] = voterLog[matchId].filter(v => v.email !== userProfile.email);
    localStorage.setItem("wc2026_voterlog", JSON.stringify(voterLog));
  }

  // Remove from Firebase
  if (typeof fbRemoveVote === "function") fbRemoveVote(matchId, userProfile.email);

  // Sync to Firebase
  fbRemoveVote(matchId, userProfile.email);
  fbRemoveVoterLog(matchId, userProfile.email);

  // Remove from live Google Sheet (no-op if SHEETS_WEBHOOK_URL is empty)
  if (typeof gsRemoveVote === "function") gsRemoveVote(matchId, userProfile.email);

  showToast("Vote removed", "info");
}

function getVoteCounts(matchId) {
  const voters = voterLog[matchId] || [];
  let team1 = 0, draw = 0, team2 = 0;
  voters.forEach(v => {
    if (v.choice === "team1") team1++;
    else if (v.choice === "draw") draw++;
    else if (v.choice === "team2") team2++;
  });
  return { team1, draw, team2, total: team1 + draw + team2 };
}

function toggleVoters(matchId) {
  expandedVoters[matchId] = !expandedVoters[matchId];
  render();
}

// Voter List
function renderVoterList(match) {
  const voters = voterLog[match.id] || [];
  if (voters.length === 0) return '';

  const choiceLabel = (v) => {
    if (v.choice === "team1") return match.team1;
    if (v.choice === "team2") return match.team2;
    return "Draw";
  };

  const choiceClass = (v) => {
    if (v.choice === "team1") return "voter-team1";
    if (v.choice === "team2") return "voter-team2";
    return "voter-draw";
  };

  const result = results[match.id];

  const rows = voters.map(v => {
    const hasScore = v.score1 !== undefined && v.score2 !== undefined;
    let extraClass = '';
    if (hasScore && result) {
      if (v.score1 === result.score1 && v.score2 === result.score2) extraClass = 'voter-exact';
      else if (v.choice === (result.score1 > result.score2 ? 'team1' : result.score2 > result.score1 ? 'team2' : 'draw')) extraClass = 'voter-correct';
    }
    const scoreHtml = hasScore
      ? `<div class="voter-score-predict"><span class="vsp-num">${v.score1}</span> <span class="vsp-sep">-</span> <span class="vsp-num">${v.score2}</span></div>`
      : `<div class="voter-score-predict voter-no-score">—</div>`;
    return `
      <div class="voter-row ${extraClass}">
        <div class="voter-name">${escapeHtml(v.name)}</div>
        ${scoreHtml}
        <div class="voter-choice ${choiceClass(v)}">${choiceLabel(v)}</div>
      </div>
    `;
  }).join("");

  return `<div class="voter-list">${rows}</div>`;
}

// Fetch Results from API
async function fetchResults() {
  const btn = document.querySelector(".fetch-btn");
  if (btn) {
    btn.textContent = "Fetching...";
    btn.disabled = true;
  }

  try {
    // Use the free football-data.org API or fallback
    const response = await fetch(CONFIG.FOOTBALL_API_URL, {
      headers: { "X-Auth-Token": CONFIG.FOOTBALL_API_KEY }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.matches) {
        data.matches.forEach(apiMatch => {
          if (apiMatch.status === "FINISHED") {
            // Try to match with our data
            const ourMatch = findMatchByTeams(apiMatch);
            if (ourMatch) {
              results[ourMatch.id] = {
                score1: apiMatch.score.fullTime.home,
                score2: apiMatch.score.fullTime.away,
              };
            }
          }
        });
        localStorage.setItem("wc2026_results", JSON.stringify(results));
        showToast("Results updated!", "success");
      }
    } else {
      showToast("API unavailable - matches haven't started yet", "error");
    }
  } catch (err) {
    // Fallback: check if matches should have results based on date
    showToast("Could not fetch results. Tournament starts June 11.", "error");
  }

  if (btn) {
    btn.textContent = "Fetch Latest Results";
    btn.disabled = false;
  }
  render();
}

function findMatchByTeams(apiMatch) {
  const home = apiMatch.homeTeam?.name?.toLowerCase() || "";
  const away = apiMatch.awayTeam?.name?.toLowerCase() || "";
  return MATCHES.find(m =>
    m.team1.toLowerCase().includes(home) || home.includes(m.team1.toLowerCase()) ||
    m.team2.toLowerCase().includes(away) || away.includes(m.team2.toLowerCase())
  );
}

// Bracket View
function getBracketSlotTeam(slot) {
  // slot like "1A" means 1st in Group A, "2B" means 2nd in Group B
  const clean = slot.replace("*", "");
  const pos = parseInt(clean[0]); // 1 or 2
  const group = clean[1]; // A-L

  // If group results exist, use actual standings
  if (GROUPS.includes(group)) {
    const standings = calculateStandings(group);
    if (standings.length >= pos && standings[pos - 1].played > 0) {
      return { name: standings[pos - 1].name, flag: standings[pos - 1].flag };
    }
  }

  // Fallback: use seeded teams from BRACKET_GROUPS (map.webp data)
  const groupTeams = BRACKET_GROUPS[group];
  if (groupTeams && groupTeams.length >= pos) {
    const team = groupTeams[pos - 1];
    return { name: team.name, flag: team.flag };
  }

  return { name: clean, flag: "🏳️" };
}

function getBracketMatchTeams(matchDef) {
  // R32 matches have slot1/slot2
  if (matchDef.slot1) {
    return {
      team1: getBracketSlotTeam(matchDef.slot1),
      team2: getBracketSlotTeam(matchDef.slot2),
      label1: matchDef.slot1.replace("*", ""),
      label2: matchDef.slot2.replace("*", ""),
    };
  }
  // Later rounds pull from winners of previous matches
  if (matchDef.from) {
    const r1 = results[matchDef.from[0]];
    const r2 = results[matchDef.from[1]];
    const prev1 = BRACKET[matchDef.from[0]];
    const prev2 = BRACKET[matchDef.from[1]];

    let team1 = { name: "TBD", flag: "" };
    let team2 = { name: "TBD", flag: "" };
    let label1 = `W ${matchDef.from[0]}`;
    let label2 = `W ${matchDef.from[1]}`;

    if (r1) {
      const prev = getBracketMatchTeams(prev1);
      if (r1.score1 > r1.score2) { team1 = prev.team1; label1 = prev.team1.name; }
      else if (r1.score2 > r1.score1) { team1 = prev.team2; label1 = prev.team2.name; }
      else { team1 = { name: "PEN?", flag: "" }; label1 = "Pending"; }
    }
    if (r2) {
      const prev = getBracketMatchTeams(prev2);
      if (r2.score1 > r2.score2) { team2 = prev.team1; label2 = prev.team1.name; }
      else if (r2.score2 > r2.score1) { team2 = prev.team2; label2 = prev.team2.name; }
      else { team2 = { name: "PEN?", flag: "" }; label2 = "Pending"; }
    }

    return { team1, team2, label1, label2 };
  }
  return { team1: { name: "TBD", flag: "" }, team2: { name: "TBD", flag: "" }, label1: "TBD", label2: "TBD" };
}

function renderBracketSlot(matchId) {
  const matchDef = BRACKET[matchId];
  const result = results[matchId];
  const teams = getBracketMatchTeams(matchDef);

  const hasResult = !!result;
  let winner = null;
  if (hasResult) {
    winner = result.score1 > result.score2 ? 1 : result.score2 > result.score1 ? 2 : 0;
  }

  const t1Class = hasResult ? (winner === 1 ? "bk-winner" : "bk-loser") : "";
  const t2Class = hasResult ? (winner === 2 ? "bk-winner" : "bk-loser") : "";
  const score1 = hasResult ? result.score1 : "";
  const score2 = hasResult ? result.score2 : "";

  return `
    <div class="bk-match ${hasResult ? 'bk-match-done' : ''}" data-match="${matchId}">
      <div class="bk-team ${t1Class}">
        <span class="bk-flag">${teams.team1.flag}</span>
        <span class="bk-name">${teams.team1.name !== "TBD" ? teams.team1.name : teams.label1}</span>
        <span class="bk-score">${score1}</span>
      </div>
      <div class="bk-team ${t2Class}">
        <span class="bk-flag">${teams.team2.flag}</span>
        <span class="bk-name">${teams.team2.name !== "TBD" ? teams.team2.name : teams.label2}</span>
        <span class="bk-score">${score2}</span>
      </div>
    </div>
  `;
}

function renderBracket() {
  // Build horizontal bracket: left R32 → R16 → QF → SF → FINAL ← SF ← QF ← R16 ← R32 right
  let html = '<div class="bk-container"><div class="bk-chart">';

  // Left side columns (R32 → SF)
  const leftRounds = [
    { key: "R32", ids: ["R32-L1","R32-L2","R32-L3","R32-L4","R32-L5","R32-L6","R32-L7","R32-L8"], label: "Round of 32" },
    { key: "R16", ids: ["R16-L1","R16-L2","R16-L3","R16-L4"], label: "Round of 16" },
    { key: "QF", ids: ["QF-L1","QF-L2"], label: "Quarter Finals" },
    { key: "SF", ids: ["SF-L"], label: "Semi Finals" },
  ];

  const rightRounds = [
    { key: "SF", ids: ["SF-R"], label: "Semi Finals" },
    { key: "QF", ids: ["QF-R1","QF-R2"], label: "Quarter Finals" },
    { key: "R16", ids: ["R16-R1","R16-R2","R16-R3","R16-R4"], label: "Round of 16" },
    { key: "R32", ids: ["R32-R1","R32-R2","R32-R3","R32-R4","R32-R5","R32-R6","R32-R7","R32-R8"], label: "Round of 32" },
  ];

  // Left columns
  leftRounds.forEach(round => {
    html += `<div class="bk-round bk-round-${round.key}">`;
    html += `<div class="bk-round-label">${round.label}</div>`;
    html += `<div class="bk-matches">`;
    round.ids.forEach(id => { html += renderBracketSlot(id); });
    html += `</div></div>`;
  });

  // Final (center)
  html += `<div class="bk-round bk-round-FINAL">`;
  html += `<div class="bk-round-label bk-final-label">FINAL</div>`;
  html += `<div class="bk-matches bk-final-matches">`;
  html += renderBracketSlot("FINAL");

  // Trophy
  const finalResult = results["FINAL"];
  let champion = null;
  if (finalResult) {
    const teams = getBracketMatchTeams(BRACKET["FINAL"]);
    if (finalResult.score1 > finalResult.score2) champion = teams.team1;
    else if (finalResult.score2 > finalResult.score1) champion = teams.team2;
  }
  html += `<div class="bk-trophy">${champion ? `<div class="bk-champion-flag">${champion.flag}</div><div class="bk-champion-name">${champion.name}</div>` : '🏆'}</div>`;
  html += `</div></div>`;

  // Right columns
  rightRounds.forEach(round => {
    html += `<div class="bk-round bk-round-${round.key}">`;
    html += `<div class="bk-round-label">${round.label}</div>`;
    html += `<div class="bk-matches">`;
    round.ids.forEach(id => { html += renderBracketSlot(id); });
    html += `</div></div>`;
  });

  html += '</div></div>';
  html += '<p style="text-align:center;font-size:0.72rem;color:var(--text-dim);margin-top:12px;">Scroll horizontally to see full bracket</p>';

  mainContent.innerHTML = html;
}

// Standings View
function renderStandings() {
  const groups = currentGroup === "all" ? GROUPS : [currentGroup];
  let html = "";

  groups.forEach(g => {
    const standings = calculateStandings(g);
    html += `
      <div class="standings-group">
        <div class="standings-group-title">Group ${g}</div>
        <table class="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map((team, i) => `
              <tr class="${i < 3 ? 'qualified' : ''}">
                <td>${i + 1}</td>
                <td><div class="team-cell"><span>${team.flag}</span> ${team.name}</div></td>
                <td>${team.played}</td>
                <td>${team.won}</td>
                <td>${team.drawn}</td>
                <td>${team.lost}</td>
                <td>${team.gf}</td>
                <td>${team.ga}</td>
                <td>${team.gd > 0 ? '+' : ''}${team.gd}</td>
                <td style="font-weight:700;color:var(--accent)">${team.points}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  });

  if (!html) html = `<div class="no-results"><div class="no-results-icon">📊</div><p>No standings available yet</p></div>`;
  mainContent.innerHTML = html;
}

function calculateStandings(group) {
  const groupMatches = MATCHES.filter(m => m.group === group);
  const teams = {};

  groupMatches.forEach(m => {
    if (!teams[m.team1]) teams[m.team1] = { name: m.team1, flag: m.flag1, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    if (!teams[m.team2]) teams[m.team2] = { name: m.team2, flag: m.flag2, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };

    const result = results[m.id];
    if (result) {
      const t1 = teams[m.team1];
      const t2 = teams[m.team2];
      t1.played++; t2.played++;
      t1.gf += result.score1; t1.ga += result.score2;
      t2.gf += result.score2; t2.ga += result.score1;

      if (result.score1 > result.score2) {
        t1.won++; t1.points += 3; t2.lost++;
      } else if (result.score1 < result.score2) {
        t2.won++; t2.points += 3; t1.lost++;
      } else {
        t1.drawn++; t2.drawn++; t1.points++; t2.points++;
      }

      t1.gd = t1.gf - t1.ga;
      t2.gd = t2.gf - t2.ga;
    }
  });

  return Object.values(teams).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

// Winners View
function setWinnersFilter(matchId) {
  winnersMatchFilter = matchId;
  renderWinners();
}

function setWinnersGroupFilter(group) {
  winnersGroupFilter = group;
  winnersMatchFilter = "all";
  renderWinners();
}

function renderWinners() {
  const finishedMatches = MATCHES.filter(m => results[m.id]);

  if (finishedMatches.length === 0) {
    mainContent.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🏆</div>
        <p>No finished matches yet</p>
        <p style="font-size:0.8rem;margin-top:8px;color:var(--text-dim)">Tournament starts June 11, 2026</p>
      </div>
    `;
    return;
  }

  // Group filter
  const finishedGroups = [...new Set(finishedMatches.map(m => m.group))];
  let filterHtml = `<div class="winners-filter">
    <div class="wf-row">
      <button class="winners-filter-btn ${winnersGroupFilter === 'all' ? 'active' : ''}" onclick="setWinnersGroupFilter('all')">All Groups</button>`;
  finishedGroups.forEach(g => {
    filterHtml += `<button class="winners-filter-btn ${winnersGroupFilter === g ? 'active' : ''}" onclick="setWinnersGroupFilter('${g}')">Group ${g}</button>`;
  });
  filterHtml += `</div>`;

  // Match filter (filtered by selected group)
  const groupFilteredMatches = winnersGroupFilter === "all" ? finishedMatches : finishedMatches.filter(m => m.group === winnersGroupFilter);
  filterHtml += `<div class="wf-row wf-matches">
    <button class="winners-filter-btn ${winnersMatchFilter === 'all' ? 'active' : ''}" onclick="setWinnersFilter('all')">All Matches</button>`;
  groupFilteredMatches.forEach(m => {
    const r = results[m.id];
    filterHtml += `<button class="winners-filter-btn ${winnersMatchFilter === m.id ? 'active' : ''}" onclick="setWinnersFilter('${m.id}')">${m.flag1} ${r.score1}-${r.score2} ${m.flag2}</button>`;
  });
  filterHtml += `</div></div>`;

  // Get voters per match
  const matchesToShow = winnersMatchFilter === "all" ? groupFilteredMatches : groupFilteredMatches.filter(m => m.id === winnersMatchFilter);

  // Tally results per voter (grouped by email) across selected matches.
  // Calculation is win/draw/lose based: a prediction is a WIN when its outcome
  // (team1 win / draw / team2 win) matches the actual result, otherwise a LOSS.
  // Exact score is shown as a bonus label but does not change the win/loss count.
  // Tiebreaker: most wins, then fewest losses, then earliest vote.
  const voterStats = {};
  matchesToShow.forEach(m => {
    const r = results[m.id];
    const correctChoice = r.score1 > r.score2 ? "team1" : r.score2 > r.score1 ? "team2" : "draw";
    const voters = voterLog[m.id] || [];
    voters.forEach(v => {
      const key = v.email || v.name;
      if (!voterStats[key]) voterStats[key] = { name: v.name, email: v.email || "", won: 0, lost: 0, exact: 0, played: 0, matches: [], earliestVote: v.timestamp };
      const s = voterStats[key];
      s.played++;
      const isWin = v.choice === correctChoice;
      const isExact = v.score1 === r.score1 && v.score2 === r.score2;
      if (isWin) {
        s.won++;
        if (isExact) s.exact++;
        s.matches.push({ ...m, badge: isExact ? "exact" : "win" });
      } else {
        s.lost++;
        s.matches.push({ ...m, badge: "lose" });
      }
      if (v.timestamp < s.earliestVote) s.earliestVote = v.timestamp;
    });
  });

  // Sort: most wins, then fewest losses, then most exact, then earliest vote
  const sortedVoters = Object.values(voterStats).sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (a.lost !== b.lost) return a.lost - b.lost;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return (a.earliestVote || "").localeCompare(b.earliestVote || "");
  });

  const top3 = sortedVoters.slice(0, 3);

  let html = filterHtml;
  html += `<div class="winners-title">🏆 Top 3 Predictors</div>`;
  html += `<div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:16px;">Win = correct outcome (win / draw / lose) · Exact = exact score · Tiebreaker: fewest losses, then earliest vote</div>`;

  if (top3.length === 0) {
    html += `<div class="no-results"><p>No predictions yet</p></div>`;
  } else {
    top3.forEach((voter, i) => {
      const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
      const matchDetails = voter.matches.map(m => {
        const badge = m.badge === "exact" ? '<span class="prediction-badge exact">Exact</span>'
          : m.badge === "win" ? '<span class="prediction-badge correct">Win</span>'
          : '<span class="prediction-badge wrong">Lose</span>';
        return `<span>${m.flag1} ${m.team1} vs ${m.team2} ${m.flag2} ${badge}</span>`;
      }).join(" ");
      const voteTime = new Date(voter.earliestVote).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
      html += `
        <div class="winner-card top-${i + 1}">
          <div class="winner-rank">${rank}</div>
          <div class="winner-info">
            <div class="winner-team">${escapeHtml(voter.name)}</div>
            <div class="winner-stats"><span class="stat-won">${voter.won} won</span> · <span class="stat-lost">${voter.lost} lost</span>${voter.exact ? ` · ${voter.exact} exact` : ''}</div>
            <div class="winner-matches">${matchDetails}</div>
            <div class="winner-time">First vote: ${voteTime}</div>
          </div>
        </div>
      `;
    });
  }

  // Summary table grouped by email — how many matches won/lost per person
  if (sortedVoters.length > 0) {
    html += `<div class="email-summary">
      <div class="email-summary-title">📊 Summary by Email</div>
      <div class="email-summary-table">
        <div class="est-row est-head">
          <span class="est-cell est-email">Email</span>
          <span class="est-cell est-name">Name</span>
          <span class="est-cell est-num">Played</span>
          <span class="est-cell est-num est-win">Won</span>
          <span class="est-cell est-num est-lose">Lost</span>
          <span class="est-cell est-num">Win%</span>
        </div>`;
    sortedVoters.forEach(v => {
      const pct = v.played ? Math.round(v.won / v.played * 100) : 0;
      html += `<div class="est-row">
          <span class="est-cell est-email">${escapeHtml(v.email || '—')}</span>
          <span class="est-cell est-name">${escapeHtml(v.name)}</span>
          <span class="est-cell est-num">${v.played}</span>
          <span class="est-cell est-num est-win">${v.won}</span>
          <span class="est-cell est-num est-lose">${v.lost}</span>
          <span class="est-cell est-num">${pct}%</span>
        </div>`;
    });
    html += `</div></div>`;
  }

  mainContent.innerHTML = html;
}

// My Votes View
function renderMyVotes() {
  const votedMatches = MATCHES.filter(m => votes[m.id]);

  // Win/draw/lose calculation: a vote is Won when its outcome matches the result
  let won = 0, lost = 0, exact = 0, pending = 0;
  votedMatches.forEach(m => {
    const r = results[m.id];
    if (!r) { pending++; return; }
    const v = votes[m.id];
    const winner = r.score1 > r.score2 ? "team1" : r.score2 > r.score1 ? "team2" : "draw";
    const userChoice = v && typeof v === "object" ? (v.score1 > v.score2 ? "team1" : v.score2 > v.score1 ? "team2" : "draw") : v;
    if (userChoice === winner) {
      won++;
      if (v && typeof v === "object" && v.score1 === r.score1 && v.score2 === r.score2) exact++;
    } else {
      lost++;
    }
  });

  const profileHtml = userProfile ? `
    <div style="margin-bottom:8px;font-size:0.9rem;color:var(--text);">
      <strong>${escapeHtml(userProfile.name)}</strong>
      ${userProfile.email ? `<span style="color:var(--text-dim);font-size:0.8rem;margin-left:8px;">${escapeHtml(userProfile.email)}</span>` : ""}
    </div>
  ` : `<div style="margin-bottom:8px;font-size:0.85rem;color:var(--text-dim);">Vote on a match to set up your profile</div>`;

  let html = `
    <div class="votes-summary">
      <h2>Your Predictions</h2>
      ${profileHtml}
      <div class="votes-stats">
        <div class="vote-stat">
          <div class="vote-stat-value">${votedMatches.length}</div>
          <div class="vote-stat-label">Total Votes</div>
        </div>
        <div class="vote-stat">
          <div class="vote-stat-value correct">${won}</div>
          <div class="vote-stat-label">Won</div>
        </div>
        <div class="vote-stat">
          <div class="vote-stat-value wrong">${lost}</div>
          <div class="vote-stat-label">Lost</div>
        </div>
        <div class="vote-stat">
          <div class="vote-stat-value" style="color:var(--gold)">${exact}</div>
          <div class="vote-stat-label">Exact</div>
        </div>
        <div class="vote-stat">
          <div class="vote-stat-value pending">${pending}</div>
          <div class="vote-stat-label">Pending</div>
        </div>
      </div>
    </div>
  `;

  if (votedMatches.length === 0) {
    html += `<div class="no-results"><div class="no-results-icon">🗳️</div><p>You haven't voted on any matches yet</p></div>`;
  } else {
    votedMatches.forEach(m => {
      const matchDate = new Date(`${m.date}T${m.time}:00`);
      const canRemove = !results[m.id] && new Date() < matchDate;
      html += `<div class="my-vote-wrapper">`;
      html += renderMatchCard(m);
      if (canRemove) {
        html += `<button class="remove-vote-btn" onclick="confirmRemoveVote('${m.id}')">Remove this vote</button>`;
      }
      html += `</div>`;
    });
  }

  mainContent.innerHTML = html;
}

// Toast - type: "success" | "error" | "info" (default: "info")
function showToast(msg, type = "info") {
  toast.textContent = msg;
  toast.className = "toast show toast-" + type;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.className = "toast"; }, type === "error" ? 4000 : 2500);
}

// Admin Mode
function isAdmin() {
  return adminMode;
}

function canBeAdmin() {
  if (userProfile && CONFIG.ADMIN_EMAILS && CONFIG.ADMIN_EMAILS.includes(userProfile.email)) return true;
  return true; // anyone can try the password
}

function toggleAdminMode() {
  if (adminMode) {
    adminMode = false;
    localStorage.removeItem("wc2026_admin");
    showToast("Admin mode off", "info");
    renderUserBadge();
    render();
    return;
  }
  // Admin emails can toggle without password
  if (userProfile && CONFIG.ADMIN_EMAILS && CONFIG.ADMIN_EMAILS.includes(userProfile.email)) {
    adminMode = true;
    localStorage.setItem("wc2026_admin", "true");
    showToast("Admin mode enabled", "success");
    renderUserBadge();
    render();
    return;
  }
  const pw = prompt("Enter admin password:");
  if (pw === CONFIG.ADMIN_PASSWORD) {
    adminMode = true;
    localStorage.setItem("wc2026_admin", "true");
    showToast("Admin mode enabled", "success");
    renderUserBadge();
    render();
  } else if (pw !== null) {
    showToast("Wrong password", "error");
  }
}

function submitResult(matchId) {
  if (!isAdmin()) return;
  const s1 = parseInt(document.getElementById(`res-s1-${matchId}`).value);
  const s2 = parseInt(document.getElementById(`res-s2-${matchId}`).value);
  if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
    showToast("Enter valid scores", "error");
    return;
  }
  const match = MATCHES.find(m => m.id === matchId);
  const resolved = resolveKnockoutTeams(match);
  if (!confirm(`Set result: ${resolved.team1} ${s1} - ${s2} ${resolved.team2}?`)) return;

  results[matchId] = { score1: s1, score2: s2 };
  localStorage.setItem("wc2026_results", JSON.stringify(results));
  if (typeof fbSaveResult === "function") fbSaveResult(matchId, { score1: s1, score2: s2 });
  showToast(`Result saved: ${resolved.team1} ${s1}-${s2} ${resolved.team2}`, "success");
  render();
}

function deleteResult(matchId) {
  if (!isAdmin()) return;
  const match = MATCHES.find(m => m.id === matchId);
  const resolved = resolveKnockoutTeams(match);
  if (!confirm(`Delete result for ${resolved.team1} vs ${resolved.team2}?`)) return;

  delete results[matchId];
  localStorage.setItem("wc2026_results", JSON.stringify(results));
  if (typeof fbDeleteResult === "function") fbDeleteResult(matchId);
  showToast("Result deleted", "info");
  render();
}

// Start
init();
