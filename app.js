/* ================================================================
   SPORTS LEAGUE MANAGEMENT SYSTEM (SLMS)  —  app.js
   PS No: 55
   Pure vanilla JavaScript. All data lives in the browser's
   Local Storage — there is no backend/server/database.
   ================================================================ */

/* ---------------------------------------------------------------
   1. LOCAL STORAGE KEYS
   Every piece of application data is kept under its own key so it
   is easy to find in DevTools -> Application -> Local Storage.
   --------------------------------------------------------------- */
const KEYS = {
  users: "slms_users",
  teams: "slms_teams",
  players: "slms_players",
  matches: "slms_matches",
  activity: "slms_activity",
  currentUser: "slms_current_user",
  seeded: "slms_seeded_v2"
};

/* ---------------------------------------------------------------
   2. GENERIC LOCAL STORAGE HELPERS
   --------------------------------------------------------------- */
function read(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; } // if the JSON is ever corrupted, fail safely
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// Escape user text before it is inserted as HTML (basic safety)
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------------------------------------------------------
   3. SEED DATA
   Runs once only (guarded by KEYS.seeded) so the app looks fully
   populated the first time it is opened, without ever overwriting
   data the user has already created/changed.
   --------------------------------------------------------------- */
function seedData() {
  if (localStorage.getItem(KEYS.seeded)) return;

  write(KEYS.users, [
    { id: 1, name: "Administrator", email: "admin@slms.com", password: "admin123", role: "admin" }
  ]);

  write(KEYS.teams, [
    { id: 1, name: "Falcons FC", code: "FAL", city: "Hyderabad", coach: "Rajesh Kumar", captain: "Arjun Reddy" },
    { id: 2, name: "Titans United", code: "TIT", city: "Vijayawada", coach: "Suresh Rao", captain: "Vikram Singh" },
    { id: 3, name: "Warriors Club", code: "WAR", city: "Guntur", coach: "Kiran Das", captain: "Naveen Babu" },
    { id: 4, name: "Rising Stars", code: "RIS", city: "Visakhapatnam", coach: "Mohan Rao", captain: "Vivek Sharma" }
  ]);

  write(KEYS.players, [
    // Falcons FC (teamId 1)
    { id: 101, name: "Arjun Reddy", sport: "Football", teamId: 1, age: 23, jersey: 10, position: "Forward", matchesPlayed: 3, goals: 4, assists: 2 },
    { id: 102, name: "Kishore Babu", sport: "Football", teamId: 1, age: 25, jersey: 1, position: "Goalkeeper", matchesPlayed: 3, goals: 0, assists: 0 },
    { id: 103, name: "Ramesh Chandra", sport: "Football", teamId: 1, age: 22, jersey: 4, position: "Defender", matchesPlayed: 3, goals: 0, assists: 1 },
    { id: 104, name: "Siva Prasad", sport: "Football", teamId: 1, age: 21, jersey: 8, position: "Midfielder", matchesPlayed: 3, goals: 1, assists: 3 },
    // Titans United (teamId 2)
    { id: 201, name: "Vikram Singh", sport: "Football", teamId: 2, age: 24, jersey: 5, position: "Defender", matchesPlayed: 3, goals: 1, assists: 0 },
    { id: 202, name: "Manoj Kumar", sport: "Football", teamId: 2, age: 22, jersey: 9, position: "Forward", matchesPlayed: 3, goals: 3, assists: 1 },
    { id: 203, name: "Deepak Verma", sport: "Football", teamId: 2, age: 26, jersey: 1, position: "Goalkeeper", matchesPlayed: 3, goals: 0, assists: 0 },
    { id: 204, name: "Sandeep Reddy", sport: "Football", teamId: 2, age: 23, jersey: 7, position: "Midfielder", matchesPlayed: 3, goals: 2, assists: 2 },
    // Warriors Club (teamId 3)
    { id: 301, name: "Naveen Babu", sport: "Football", teamId: 3, age: 24, jersey: 11, position: "Forward", matchesPlayed: 3, goals: 2, assists: 1 },
    { id: 302, name: "Kiran Das", sport: "Football", teamId: 3, age: 25, jersey: 6, position: "Midfielder", matchesPlayed: 3, goals: 1, assists: 2 },
    { id: 303, name: "Ajay Nair", sport: "Football", teamId: 3, age: 22, jersey: 3, position: "Defender", matchesPlayed: 3, goals: 0, assists: 0 },
    { id: 304, name: "Ravi Teja", sport: "Football", teamId: 3, age: 27, jersey: 1, position: "Goalkeeper", matchesPlayed: 3, goals: 0, assists: 0 },
    // Rising Stars (teamId 4)
    { id: 401, name: "Vivek Sharma", sport: "Football", teamId: 4, age: 23, jersey: 8, position: "Midfielder", matchesPlayed: 3, goals: 1, assists: 1 },
    { id: 402, name: "Harika Chowdary", sport: "Football", teamId: 4, age: 21, jersey: 10, position: "Forward", matchesPlayed: 3, goals: 2, assists: 0 },
    { id: 403, name: "Suman Reddy", sport: "Football", teamId: 4, age: 24, jersey: 2, position: "Defender", matchesPlayed: 3, goals: 0, assists: 1 },
    { id: 404, name: "Bharat Kumar", sport: "Football", teamId: 4, age: 26, jersey: 1, position: "Goalkeeper", matchesPlayed: 3, goals: 0, assists: 0 }
  ]);

  // Build a mix of past (completed) and future (upcoming) fixture dates
  const today = new Date();
  const past = (days) => { const d = new Date(today); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10); };
  const future = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

  write(KEYS.matches, [
    { id: 1001, homeId: 1, awayId: 2, date: past(10), time: "16:00", venue: "City Sports Ground", referee: "R. Prasad", status: "completed", homeScore: 3, awayScore: 1 },
    { id: 1002, homeId: 3, awayId: 4, date: past(8), time: "18:30", venue: "College Stadium", referee: "S. Kumar", status: "completed", homeScore: 2, awayScore: 2 },
    { id: 1003, homeId: 2, awayId: 3, date: past(4), time: "17:00", venue: "District Stadium", referee: "A. Naidu", status: "completed", homeScore: 2, awayScore: 1 },
    { id: 1004, homeId: 4, awayId: 1, date: future(2), time: "16:30", venue: "Main Sports Ground", referee: "T. Rao", status: "upcoming", homeScore: null, awayScore: null },
    { id: 1005, homeId: 1, awayId: 3, date: future(5), time: "17:00", venue: "City Sports Ground", referee: "R. Prasad", status: "upcoming", homeScore: null, awayScore: null },
    { id: 1006, homeId: 2, awayId: 4, date: future(9), time: "18:00", venue: "College Stadium", referee: "S. Kumar", status: "upcoming", homeScore: null, awayScore: null }
  ]);

  write(KEYS.activity, [
    { id: Date.now() - 4000, text: "League season initialised with 4 teams", date: new Date().toLocaleString("en-IN") },
    { id: Date.now() - 3000, text: "Result entered: Falcons FC 3-1 Titans United", date: new Date().toLocaleString("en-IN") },
    { id: Date.now() - 2000, text: "Result entered: Warriors Club 2-2 Rising Stars", date: new Date().toLocaleString("en-IN") },
    { id: Date.now() - 1000, text: "Result entered: Titans United 2-1 Warriors Club", date: new Date().toLocaleString("en-IN") }
  ]);

  localStorage.setItem(KEYS.seeded, "true");
}

// Backfills fields that might be missing if data was created by an older
// version of this app, so the UI never breaks on "undefined".
function upgradeData() {
  const teams = read(KEYS.teams);
  teams.forEach(t => { t.code ??= t.name.slice(0, 3).toUpperCase(); t.coach ??= "Not assigned"; t.captain ??= "Not assigned"; });
  write(KEYS.teams, teams);

  const players = read(KEYS.players);
  players.forEach(p => { p.age ??= ""; p.jersey ??= ""; p.position ??= ""; p.matchesPlayed ??= 0; p.goals ??= 0; p.assists ??= 0; });
  write(KEYS.players, players);

  const matches = read(KEYS.matches);
  matches.forEach(m => { m.venue ??= "Main Sports Ground"; m.referee ??= "Not assigned"; });
  write(KEYS.matches, matches);

  if (!localStorage.getItem(KEYS.activity)) write(KEYS.activity, []);
}

/* ---------------------------------------------------------------
   4. SESSION / SMALL UTILITY HELPERS
   --------------------------------------------------------------- */
function currentUser() { return read(KEYS.currentUser, null); }

// Sends the visitor back to the login page if they do not hold the
// required role. Used at the top of every protected page.
function requireRole(role) {
  const u = currentUser();
  if (!u || u.role !== role) { location.href = "index.html"; return null; }
  return u;
}

function teamById(id) { return read(KEYS.teams).find(t => t.id === Number(id)); }
function teamName(id) { return teamById(id)?.name || "Unknown Team"; }

function formatDate(date) {
  if (!date) return "-";
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function setMessage(id, msg, ok = false) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = msg;
  el.style.color = ok ? "#5f6847" : "#b56348";
}

// Keeps the last 30 admin actions, newest first, for the Activity page.
function logActivity(text) {
  const a = read(KEYS.activity);
  a.unshift({ id: Date.now(), text, date: new Date().toLocaleString("en-IN") });
  write(KEYS.activity, a.slice(0, 30));
}

/* ---------------------------------------------------------------
   5. NAVIGATION
   One function drives both the Admin and User dashboards: it shows
   the requested section and calls whichever render function that
   section needs. Sections that don't exist on the current page are
   simply skipped (the optional-chaining/getElementById checks).
   --------------------------------------------------------------- */
function go(section) {
  document.querySelectorAll(".dashboard-section").forEach(s => s.classList.add("hidden"));
  const target = document.getElementById(section + "Section");
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === section));

  const title = document.getElementById("sectionTitle") || document.getElementById("userSectionTitle");
  const labels = {
    overview: "Dashboard", teams: "Teams", players: "Players", matches: "Matches",
    results: "Match Results", standings: "Standings", activity: "Activity", profile: "Profile",
    home: "League Home", statistics: "Statistics"
  };
  if (title) title.textContent = labels[section] || section;

  // --- Admin-only sections ---
  if (section === "overview") renderAdminOverview();
  if (section === "teams") { renderTeamsTable(); populateTeamSelects(); }
  if (section === "players") { renderPlayersTable(); populateTeamSelects(); }
  if (section === "matches") { renderMatchesTable(); populateTeamSelects(); }
  if (section === "results" && document.getElementById("resultsTable")) renderResultsTable();
  if (section === "standings") renderStandings("standingsTable");
  if (section === "activity") renderActivity();
  if (section === "profile" && document.getElementById("adminProfileName")) renderAdminProfile();

  // --- User-only sections ---
  if (section === "home") renderUserHome();
  if (section === "teams" && document.getElementById("userTeams")) renderUserTeams();
  if (section === "players" && document.getElementById("userPlayers")) renderUserPlayers();
  if (section === "matches" && document.getElementById("userMatches")) renderUserMatches();
  if (section === "standings" && document.getElementById("userStandings")) renderStandings("userStandings");
  if (section === "statistics") renderUserStatistics();
  if (section === "profile" && document.getElementById("userProfileName")) renderUserProfile();
}

/* ---------------------------------------------------------------
   6. PAGE INITIALISERS (called once from each HTML page)
   --------------------------------------------------------------- */
function initLoginPage() {
  seedData(); upgradeData();
  // Already logged in? Skip straight to the right dashboard.
  if (currentUser()) { location.href = currentUser().role === "admin" ? "admin.html" : "user.html"; return; }

  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const user = read(KEYS.users).find(u => u.email.toLowerCase() === email && u.password === password);
    if (!user) { setMessage("loginMessage", "Invalid email or password."); return; }
    write(KEYS.currentUser, user);
    location.href = user.role === "admin" ? "admin.html" : "user.html";
  });
}

function initSignupPage() {
  seedData(); upgradeData();
  document.getElementById("signupForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;
    const users = read(KEYS.users);

    if (name.length < 3) { setMessage("signupMessage", "Please enter your full name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage("signupMessage", "Please enter a valid email address."); return; }
    if (password.length < 6) { setMessage("signupMessage", "Password must contain at least 6 characters."); return; }
    if (password !== confirm) { setMessage("signupMessage", "Passwords do not match."); return; }
    if (users.some(u => u.email.toLowerCase() === email)) { setMessage("signupMessage", "An account with this email already exists."); return; }

    // Signup can only ever create a normal "user" account — Admin is
    // never selectable here, matching the project's access-control rule.
    const user = { id: Date.now(), name, email, password, role: "user" };
    users.push(user); write(KEYS.users, users); write(KEYS.currentUser, user);
    setMessage("signupMessage", "Account created. Redirecting...", true);
    setTimeout(() => location.href = "user.html", 500);
  });
}

function initAdminPage() {
  seedData(); upgradeData();
  if (!requireRole("admin")) return;

  document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => go(b.dataset.section)));
  document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  document.getElementById("adminLogout").addEventListener("click", logout);

  document.getElementById("teamForm").addEventListener("submit", addTeam);
  document.getElementById("playerForm").addEventListener("submit", addPlayer);
  document.getElementById("matchForm").addEventListener("submit", addMatch);
  document.getElementById("adminProfileForm")?.addEventListener("submit", saveAdminProfile);

  document.getElementById("teamSearch")?.addEventListener("input", renderTeamsTable);
  document.getElementById("playerSearch")?.addEventListener("input", renderPlayersTable);
  document.getElementById("matchFilter")?.addEventListener("change", renderMatchesTable);

  go("overview");
}

function initUserPage() {
  seedData(); upgradeData();
  const u = requireRole("user"); if (!u) return;

  document.getElementById("userName").textContent = u.name;
  document.getElementById("userAvatar").textContent = u.name.charAt(0).toUpperCase();

  document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => go(b.dataset.section)));
  document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  document.getElementById("userLogout").addEventListener("click", logout);

  document.getElementById("userProfileForm")?.addEventListener("submit", saveUserProfile);
  document.getElementById("userTeamSearch")?.addEventListener("input", renderUserTeams);
  document.getElementById("userPlayerSearch")?.addEventListener("input", renderUserPlayers);
  document.getElementById("userMatchFilter")?.addEventListener("change", renderUserMatches);

  go("home");
}

function logout() {
  // Only the active session is cleared — all league data stays in Local Storage.
  localStorage.removeItem(KEYS.currentUser);
  location.href = "index.html";
}

/* ---------------------------------------------------------------
   7. TEAM MANAGEMENT (Admin)
   --------------------------------------------------------------- */
function addTeam(e) {
  e.preventDefault();
  const name = document.getElementById("teamName").value.trim();
  const code = document.getElementById("teamCode").value.trim().toUpperCase();
  const city = document.getElementById("teamCity").value.trim();
  const coach = document.getElementById("teamCoach").value.trim();
  const captain = document.getElementById("teamCaptain").value.trim();

  if (!name || !code || !city || !coach || !captain) { alert("All team fields are required."); return; }

  const teams = read(KEYS.teams);
  if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) { alert("A team with this name already exists."); return; }
  if (teams.some(t => t.code.toLowerCase() === code.toLowerCase())) { alert("A team with this short code already exists."); return; }

  teams.push({ id: Date.now(), name, code, city, coach, captain });
  write(KEYS.teams, teams);
  logActivity(`New team added: ${name} (${code})`);
  e.target.reset();
  renderTeamsTable(); populateTeamSelects(); renderAdminOverview();
}

function editTeam(id) {
  const teams = read(KEYS.teams);
  const t = teams.find(x => x.id === Number(id));
  if (!t) return;

  const name = prompt("Team name:", t.name);
  if (!name) return;
  const code = (prompt("Short code:", t.code) || t.code).trim().toUpperCase();

  const clash = teams.find(x => x.id !== t.id && (x.name.toLowerCase() === name.trim().toLowerCase() || x.code.toLowerCase() === code.toLowerCase()));
  if (clash) { alert("Another team already uses this name or short code."); return; }

  t.name = name.trim();
  t.code = code;
  t.city = prompt("City:", t.city) || t.city;
  t.coach = prompt("Coach:", t.coach) || t.coach;
  t.captain = prompt("Captain:", t.captain) || t.captain;
  write(KEYS.teams, teams);
  logActivity(`Team updated: ${t.name}`);
  renderTeamsTable(); populateTeamSelects();
}

// Deleting a team safely removes the players and matches that
// reference it, after warning the admin what will be removed.
function deleteTeam(id) {
  id = Number(id);
  const teams = read(KEYS.teams);
  const team = teams.find(t => t.id === id);
  if (!team) return;

  const players = read(KEYS.players);
  const matches = read(KEYS.matches);
  const linkedPlayers = players.filter(p => p.teamId === id).length;
  const linkedMatches = matches.filter(m => m.homeId === id || m.awayId === id).length;

  let warning = `Remove ${team.name}?`;
  if (linkedPlayers || linkedMatches) {
    warning += ` This will also remove ${linkedPlayers} player(s) and ${linkedMatches} match(es) linked to this team.`;
  }
  if (!confirm(warning)) return;

  write(KEYS.teams, teams.filter(t => t.id !== id));
  write(KEYS.players, players.filter(p => p.teamId !== id));
  write(KEYS.matches, matches.filter(m => m.homeId !== id && m.awayId !== id));
  logActivity(`Team removed: ${team.name} (and any related players/matches)`);
  renderTeamsTable(); populateTeamSelects(); renderAdminOverview();
}

/* ---------------------------------------------------------------
   8. PLAYER MANAGEMENT (Admin)
   --------------------------------------------------------------- */
function addPlayer(e) {
  e.preventDefault();
  const name = document.getElementById("playerName").value.trim();
  const teamId = Number(document.getElementById("playerTeam").value);
  const jersey = Number(document.getElementById("playerJersey").value);
  const position = document.getElementById("playerPosition").value;

  if (!name || !teamId || !position) { alert("Player name, team and position are required."); return; }

  const players = read(KEYS.players);
  if (players.some(p => p.teamId === teamId && Number(p.jersey) === jersey)) {
    alert("Jersey number already exists for this team."); return;
  }

  players.push({
    id: Date.now(),
    name,
    sport: document.getElementById("playerSport").value.trim() || "Football",
    teamId,
    age: Number(document.getElementById("playerAge").value) || "",
    jersey,
    position,
    matchesPlayed: Number(document.getElementById("playerMatches")?.value) || 0,
    goals: Number(document.getElementById("playerGoals").value) || 0,
    assists: Number(document.getElementById("playerAssists").value) || 0
  });
  write(KEYS.players, players);
  logActivity(`New player added: ${name} (${teamName(teamId)})`);
  e.target.reset();
  document.getElementById("playerSport").value = "Football";
  renderPlayersTable(); renderAdminOverview();
}

function editPlayer(id) {
  const players = read(KEYS.players);
  const p = players.find(x => x.id === Number(id));
  if (!p) return;

  p.name = prompt("Player name:", p.name) || p.name;

  const jerseyInput = prompt("Jersey number:", p.jersey);
  const jersey = (jerseyInput === null || jerseyInput === "") ? p.jersey : Number(jerseyInput);
  if (players.some(x => x.id !== p.id && x.teamId === p.teamId && Number(x.jersey) === jersey)) {
    alert("Jersey number already exists for this team."); return;
  }
  p.jersey = jersey;

  p.position = prompt("Position (Goalkeeper / Defender / Midfielder / Forward):", p.position) || p.position;
  const mp = prompt("Matches played:", p.matchesPlayed || 0);
  if (mp !== null && mp !== "" && !isNaN(mp)) p.matchesPlayed = Number(mp);
  p.goals = Number(prompt("Goals:", p.goals));
  p.assists = Number(prompt("Assists:", p.assists));

  write(KEYS.players, players);
  logActivity(`Player updated: ${p.name}`);
  renderPlayersTable(); renderAdminOverview();
}

// Generic remove used by Players and Matches (Teams use deleteTeam, above,
// because deleting a team needs extra cascade logic).
function deleteItem(key, id) {
  if (!confirm("Remove this item?")) return;
  id = Number(id);
  const list = read(key);
  const item = list.find(x => x.id === id);
  write(key, list.filter(x => x.id !== id));

  if (item) {
    const label = item.name || `${teamName(item.homeId)} vs ${teamName(item.awayId)}`;
    logActivity(`Removed ${key.replace("slms_", "")}: ${label}`);
  }
  if (key === KEYS.players) renderPlayersTable();
  if (key === KEYS.matches) { renderMatchesTable(); renderResultsTable(); renderStandings("standingsTable"); }
  renderAdminOverview();
}

/* ---------------------------------------------------------------
   9. MATCH MANAGEMENT (Admin)
   --------------------------------------------------------------- */
function populateTeamSelects() {
  const teams = read(KEYS.teams);
  const opts = teams.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  ["playerTeam", "homeTeam", "awayTeam"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
}

function addMatch(e) {
  e.preventDefault();
  const home = Number(document.getElementById("homeTeam").value);
  const away = Number(document.getElementById("awayTeam").value);
  if (!home || !away) { alert("Please select both teams."); return; }
  if (home === away) { alert("Home and away teams cannot be the same."); return; }

  const date = document.getElementById("matchDate").value;
  const time = document.getElementById("matchTime").value;
  const venue = document.getElementById("matchVenue").value.trim();
  const referee = document.getElementById("matchReferee").value.trim();
  if (!date || !time || !venue || !referee) { alert("All match fields are required."); return; }

  const matches = read(KEYS.matches);
  matches.push({ id: Date.now(), homeId: home, awayId: away, date, time, venue, referee, status: "upcoming", homeScore: null, awayScore: null });
  write(KEYS.matches, matches);
  logActivity(`Match created: ${teamName(home)} vs ${teamName(away)}`);
  e.target.reset();
  renderMatchesTable(); renderAdminOverview();
}

/* ---------------------------------------------------------------
   10. MATCH RESULTS (Admin)
   Entering a result marks the match Completed; standings, the
   dashboard and Activity all update automatically from this single
   source of truth (the matches array) — nothing is hard-coded.
   --------------------------------------------------------------- */
function updateResult(id) {
  const matches = read(KEYS.matches);
  const m = matches.find(x => x.id === Number(id));
  if (!m) return;

  const hs = prompt(`Enter ${teamName(m.homeId)} score:`, m.homeScore ?? "");
  const as = prompt(`Enter ${teamName(m.awayId)} score:`, m.awayScore ?? "");
  if (hs === null || as === null || hs === "" || as === "" || isNaN(hs) || isNaN(as) || Number(hs) < 0 || Number(as) < 0) {
    alert("Please enter valid numeric scores."); return;
  }

  const wasCompleted = m.status === "completed";
  m.homeScore = Number(hs);
  m.awayScore = Number(as);
  m.status = "completed";
  write(KEYS.matches, matches);
  logActivity(`${wasCompleted ? "Result updated" : "Result entered"}: ${teamName(m.homeId)} ${m.homeScore}-${m.awayScore} ${teamName(m.awayId)}`);

  renderMatchesTable(); renderResultsTable(); renderStandings("standingsTable"); renderAdminOverview();
}

function deleteResult(id) {
  const matches = read(KEYS.matches);
  const m = matches.find(x => x.id === Number(id));
  if (!m) return;
  if (!confirm("Remove this result? The match will return to Upcoming.")) return;

  m.homeScore = null; m.awayScore = null; m.status = "upcoming";
  write(KEYS.matches, matches);
  logActivity(`Result removed: ${teamName(m.homeId)} vs ${teamName(m.awayId)}`);

  renderMatchesTable(); renderResultsTable(); renderStandings("standingsTable"); renderAdminOverview();
}

/* ---------------------------------------------------------------
   11. RENDER: ADMIN TABLES
   --------------------------------------------------------------- */
function renderTeamsTable() {
  const teams = read(KEYS.teams);
  const el = document.getElementById("teamsTable"); if (!el) return;
  const q = (document.getElementById("teamSearch")?.value || "").toLowerCase();
  const filtered = teams.filter(t => (t.name + " " + t.code + " " + t.city + " " + t.coach + " " + t.captain).toLowerCase().includes(q));

  el.innerHTML = filtered.length
    ? `<table class="data-table"><thead><tr><th>#</th><th>Team</th><th>Code</th><th>City</th><th>Coach</th><th>Captain</th><th>Action</th></tr></thead><tbody>${filtered.map((t, i) =>
        `<tr><td>${i + 1}</td><td><strong>${esc(t.name)}</strong></td><td>${esc(t.code)}</td><td>${esc(t.city)}</td><td>${esc(t.coach)}</td><td>${esc(t.captain)}</td><td><button class="edit-btn" onclick="editTeam(${t.id})">Edit</button> <button class="danger-btn" onclick="deleteTeam(${t.id})">Remove</button></td></tr>`
      ).join("")}</tbody></table>`
    : '<div class="empty">No teams found.</div>';
}

function renderPlayersTable() {
  const players = read(KEYS.players);
  const el = document.getElementById("playersTable"); if (!el) return;
  const q = (document.getElementById("playerSearch")?.value || "").toLowerCase();
  const filtered = players.filter(p => (p.name + " " + p.position + " " + teamName(p.teamId)).toLowerCase().includes(q));

  el.innerHTML = filtered.length
    ? `<table class="data-table"><thead><tr><th>#</th><th>Player</th><th>Team</th><th>Jersey</th><th>Position</th><th>MP</th><th>Goals</th><th>Assists</th><th>Action</th></tr></thead><tbody>${filtered.map((p, i) =>
        `<tr><td>${i + 1}</td><td><strong>${esc(p.name)}</strong><br><small>${p.age ? esc(p.age) + " yrs" : ""}</small></td><td>${esc(teamName(p.teamId))}</td><td>${esc(p.jersey)}</td><td>${esc(p.position)}</td><td>${p.matchesPlayed || 0}</td><td>${p.goals}</td><td>${p.assists}</td><td><button class="edit-btn" onclick="editPlayer(${p.id})">Edit</button> <button class="danger-btn" onclick="deleteItem(KEYS.players,${p.id})">Remove</button></td></tr>`
      ).join("")}</tbody></table>`
    : '<div class="empty">No players found.</div>';
}

function renderMatchesTable() {
  const matches = read(KEYS.matches).slice().sort((a, b) => a.date.localeCompare(b.date));
  const el = document.getElementById("matchesTable"); if (!el) return;
  const filter = document.getElementById("matchFilter")?.value || "all";
  const filtered = matches.filter(m => filter === "all" || m.status === filter);

  el.innerHTML = filtered.length
    ? `<table class="data-table"><thead><tr><th>Fixture</th><th>Date / Time</th><th>Venue</th><th>Status</th><th>Score / Action</th><th>Action</th></tr></thead><tbody>${filtered.map(m => {
        const score = m.status === "completed"
          ? `<strong>${m.homeScore} - ${m.awayScore}</strong> <button class="edit-btn" onclick="updateResult(${m.id})">Edit</button>`
          : `<button class="result-btn" onclick="updateResult(${m.id})">Enter Result</button>`;
        return `<tr><td><strong>${esc(teamName(m.homeId))}</strong> vs <strong>${esc(teamName(m.awayId))}</strong><br><small>Referee: ${esc(m.referee)}</small></td><td>${formatDate(m.date)}<br><small>${esc(m.time)}</small></td><td>${esc(m.venue)}</td><td><span class="status-pill ${m.status === "upcoming" ? "status-upcoming" : "status-completed"}">${m.status}</span></td><td>${score}</td><td><button class="danger-btn" onclick="deleteItem(KEYS.matches,${m.id})">Remove</button></td></tr>`;
      }).join("")}</tbody></table>`
    : '<div class="empty">No matches found.</div>';
}

function renderResultsTable() {
  const el = document.getElementById("resultsTable"); if (!el) return;
  const matches = read(KEYS.matches).filter(m => m.status === "completed").sort((a, b) => b.date.localeCompare(a.date));

  el.innerHTML = matches.length
    ? `<table class="data-table"><thead><tr><th>Fixture</th><th>Date</th><th>Score</th><th>Action</th></tr></thead><tbody>${matches.map(m =>
        `<tr><td><strong>${esc(teamName(m.homeId))}</strong> vs <strong>${esc(teamName(m.awayId))}</strong></td><td>${formatDate(m.date)}</td><td><strong>${m.homeScore} - ${m.awayScore}</strong></td><td><button class="edit-btn" onclick="updateResult(${m.id})">Edit</button> <button class="danger-btn" onclick="deleteResult(${m.id})">Delete Result</button></td></tr>`
      ).join("")}</tbody></table>`
    : '<div class="empty">No results entered yet.</div>';
}

/* ---------------------------------------------------------------
   12. LEAGUE STANDINGS
   Fully calculated from completed matches every time it is
   rendered — nothing about the table is ever hard-coded.
   --------------------------------------------------------------- */
function calculateStandings() {
  const teams = read(KEYS.teams).map(t => ({ team: t.name, teamId: t.id, played: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0 }));
  const map = Object.fromEntries(teams.map(t => [t.teamId, t]));

  read(KEYS.matches).filter(m => m.status === "completed").forEach(m => {
    const h = map[m.homeId], a = map[m.awayId];
    if (!h || !a) return;
    h.played++; a.played++;
    h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) { h.wins++; h.points += 3; a.losses++; }
    else if (m.homeScore < m.awayScore) { a.wins++; a.points += 3; h.losses++; }
    else { h.draws++; a.draws++; h.points++; a.points++; }
  });

  // Sort by Points, then Goal Difference, then Goals For
  return teams.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
}

function renderStandings(targetId) {
  const el = document.getElementById(targetId); if (!el) return;
  const rows = calculateStandings();
  el.innerHTML = `<table class="data-table"><thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>${rows.map((r, i) =>
    `<tr><td class="table-rank">${i + 1}</td><td><strong>${esc(r.team)}</strong></td><td>${r.played}</td><td>${r.wins}</td><td>${r.draws}</td><td>${r.losses}</td><td>${r.goalsFor}</td><td>${r.goalsAgainst}</td><td>${r.goalsFor - r.goalsAgainst}</td><td><strong>${r.points}</strong></td></tr>`
  ).join("")}</tbody></table>`;
}

/* ---------------------------------------------------------------
   13. ADMIN DASHBOARD / ACTIVITY / PROFILE
   --------------------------------------------------------------- */
function renderAdminOverview() {
  const teams = read(KEYS.teams), players = read(KEYS.players), matches = read(KEYS.matches);
  const completed = matches.filter(m => m.status === "completed");
  const upcomingCount = matches.filter(m => m.status === "upcoming").length;
  const totalGoals = completed.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
  const standings = calculateStandings();

  const stats = [["Teams", teams.length], ["Players", players.length], ["Matches", matches.length], ["Completed", completed.length], ["Upcoming", upcomingCount], ["Total Goals", totalGoals]];
  document.getElementById("adminStats").innerHTML = stats.map(([l, v]) => `<div class="stat-card"><div class="label">${l}</div><div class="value">${v}</div></div>`).join("");

  const upcoming = matches.filter(m => m.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  document.getElementById("adminUpcoming").innerHTML = upcoming.length
    ? `<div class="match-list">${upcoming.map(m => `<div class="match-item"><div><strong>${esc(teamName(m.homeId))} vs ${esc(teamName(m.awayId))}</strong><br><small>${formatDate(m.date)} • ${esc(m.time)} • ${esc(m.venue)}</small></div><span class="status-pill status-upcoming">Upcoming</span></div>`).join("")}</div>`
    : '<div class="empty">No upcoming matches.</div>';

  const top = players.slice().sort((a, b) => b.goals - a.goals)[0];
  document.getElementById("adminTopScorer").innerHTML = top
    ? `<div class="highlight-card"><strong>${esc(top.name)}</strong><span>${esc(teamName(top.teamId))}</span><b>${top.goals} goals</b></div>`
    : '<div class="empty">No player data.</div>';

  const leader = standings[0];
  document.getElementById("adminLeader").innerHTML = (leader && leader.played > 0)
    ? `<div class="highlight-card"><strong>${esc(leader.team)}</strong><span>Current league leader</span><b>${leader.points} points</b></div>`
    : '<div class="empty">No standings data yet.</div>';
}

function renderActivity() {
  const el = document.getElementById("activityList"); if (!el) return;
  const a = read(KEYS.activity);
  el.innerHTML = a.length
    ? a.map(x => `<div class="activity-item"><span class="activity-dot">✓</span><div><strong>${esc(x.text)}</strong><small>${esc(x.date)}</small></div></div>`).join("")
    : '<div class="empty">No activity recorded yet.</div>';
}

function renderAdminProfile() {
  const u = currentUser(); if (!u) return;
  document.getElementById("adminProfileName").value = u.name;
  document.getElementById("adminProfileEmail").value = u.email;
  document.getElementById("adminProfileRole").value = u.role;
}

function saveAdminProfile(e) {
  e.preventDefault();
  const newName = document.getElementById("adminProfileName").value.trim();
  if (!newName) { alert("Name cannot be empty."); return; }
  updateCurrentUserName(newName);
  setMessage("adminProfileMessage", "Profile updated.", true);
}

// Shared by both dashboards: updates the name on the users list AND on
// the active session, without ever touching or exposing the password.
function updateCurrentUserName(newName) {
  const users = read(KEYS.users);
  const u = currentUser();
  const match = users.find(x => x.id === u.id);
  if (match) match.name = newName;
  write(KEYS.users, users);
  u.name = newName;
  write(KEYS.currentUser, u);
  logActivity(`Profile name updated to: ${newName}`);
}

/* ---------------------------------------------------------------
   14. USER MODULE — VIEW-ONLY PAGES
   --------------------------------------------------------------- */
function renderUserHome() {
  const matches = read(KEYS.matches), teams = read(KEYS.teams), players = read(KEYS.players);
  const completed = matches.filter(m => m.status === "completed");

  const stats = [["Teams", teams.length], ["Players", players.length], ["Upcoming", matches.length - completed.length], ["Completed", completed.length]];
  document.getElementById("userStats").innerHTML = stats.map(([l, v]) => `<div class="stat-card"><div class="label">${l}</div><div class="value">${v}</div></div>`).join("");

  const u = currentUser();
  document.getElementById("welcomeUser").textContent = `Welcome, ${u.name}`;

  const upcoming = matches.filter(m => m.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  document.getElementById("userUpcoming").innerHTML = upcoming.length
    ? `<div class="match-list">${upcoming.map(m => `<div class="match-item"><div><strong>${esc(teamName(m.homeId))} vs ${esc(teamName(m.awayId))}</strong><br><small>${formatDate(m.date)} • ${esc(m.time)} • ${esc(m.venue)}</small></div><span class="status-pill status-upcoming">Upcoming</span></div>`).join("")}</div>`
    : '<div class="empty">No upcoming matches.</div>';

  const top = calculateStandings().slice(0, 3);
  document.getElementById("userTopStandings").innerHTML = top.some(r => r.played > 0)
    ? `<table class="data-table"><tbody>${top.map((r, i) => `<tr><td class="table-rank">${i + 1}</td><td>${esc(r.team)}</td><td><strong>${r.points} pts</strong></td></tr>`).join("")}</tbody></table>`
    : '<div class="empty">No standings yet.</div>';

  const scorer = players.slice().sort((a, b) => b.goals - a.goals)[0];
  document.getElementById("userTopScorer").innerHTML = scorer
    ? `<div class="highlight-card"><strong>${esc(scorer.name)}</strong><span>${esc(teamName(scorer.teamId))}</span><b>${scorer.goals} goals</b></div>`
    : '<div class="empty">No player statistics yet.</div>';

  const recent = completed.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const recentEl = document.getElementById("userRecentResults");
  if (recentEl) {
    recentEl.innerHTML = recent.length
      ? `<div class="match-list">${recent.map(m => `<div class="match-item"><div><strong>${esc(teamName(m.homeId))} ${m.homeScore} - ${m.awayScore} ${esc(teamName(m.awayId))}</strong><br><small>${formatDate(m.date)} • ${esc(m.venue)}</small></div><span class="status-pill status-completed">Completed</span></div>`).join("")}</div>`
      : '<div class="empty">No results yet.</div>';
  }
}

// Tracks which team's detail panel (if any) is currently open on the
// User -> Teams page.
let selectedTeamId = null;

function renderUserTeams() {
  const teams = read(KEYS.teams);
  const el = document.getElementById("userTeams"); if (!el) return;
  const q = (document.getElementById("userTeamSearch")?.value || "").toLowerCase();
  const players = read(KEYS.players);
  const filtered = teams.filter(t => (t.name + " " + t.city + " " + t.coach).toLowerCase().includes(q));

  el.innerHTML = filtered.length ? filtered.map(t => {
    const count = players.filter(p => p.teamId === t.id).length;
    return `<div class="team-card"><div class="team-icon">${esc(t.name.charAt(0))}</div><h3>${esc(t.name)}</h3><p>${esc(t.city)}</p><div class="team-meta"><span>Coach</span><strong>${esc(t.coach)}</strong><span>Captain</span><strong>${esc(t.captain)}</strong><span>Players</span><strong>${count}</strong></div><button class="small-btn" style="margin-top:12px" onclick="showTeamDetails(${t.id})">View Details</button></div>`;
  }).join("") : '<div class="empty">No teams found.</div>';

  renderTeamDetails();
}

function showTeamDetails(id) { selectedTeamId = Number(id); renderTeamDetails(); }
function closeTeamDetails() { selectedTeamId = null; renderTeamDetails(); }

// Shows team info + its players + its upcoming matches + its recent
// results, all pulled live from Local Storage.
function renderTeamDetails() {
  const el = document.getElementById("userTeamDetails"); if (!el) return;
  const team = selectedTeamId ? teamById(selectedTeamId) : null;

  if (!team) { el.innerHTML = ""; el.classList.add("hidden"); return; }
  el.classList.remove("hidden");

  const players = read(KEYS.players).filter(p => p.teamId === team.id);
  const matches = read(KEYS.matches).filter(m => m.homeId === team.id || m.awayId === team.id);
  const upcoming = matches.filter(m => m.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const results = matches.filter(m => m.status === "completed").sort((a, b) => b.date.localeCompare(a.date));

  el.innerHTML = `
    <div class="panel-heading"><h3>${esc(team.name)} — Team Details</h3><button class="small-btn" onclick="closeTeamDetails()">Close</button></div>
    <p><strong>City:</strong> ${esc(team.city)} &nbsp; <strong>Coach:</strong> ${esc(team.coach)} &nbsp; <strong>Captain:</strong> ${esc(team.captain)}</p>
    <h4>Players</h4>
    ${players.length ? `<table class="data-table"><thead><tr><th>Name</th><th>Position</th><th>Goals</th><th>Assists</th></tr></thead><tbody>${players.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(p.position)}</td><td>${p.goals}</td><td>${p.assists}</td></tr>`).join("")}</tbody></table>` : '<div class="empty">No players yet.</div>'}
    <h4>Upcoming Matches</h4>
    ${upcoming.length ? `<div class="match-list">${upcoming.map(m => `<div class="match-item"><div><strong>${esc(teamName(m.homeId))} vs ${esc(teamName(m.awayId))}</strong><br><small>${formatDate(m.date)} • ${esc(m.venue)}</small></div></div>`).join("")}</div>` : '<div class="empty">None scheduled.</div>'}
    <h4>Recent Results</h4>
    ${results.length ? `<div class="match-list">${results.map(m => `<div class="match-item"><div><strong>${esc(teamName(m.homeId))} ${m.homeScore} - ${m.awayScore} ${esc(teamName(m.awayId))}</strong><br><small>${formatDate(m.date)}</small></div></div>`).join("")}</div>` : '<div class="empty">No results yet.</div>'}
  `;
}

function renderUserPlayers() {
  const players = read(KEYS.players);
  const el = document.getElementById("userPlayers"); if (!el) return;
  const q = (document.getElementById("userPlayerSearch")?.value || "").toLowerCase();
  const f = players.filter(p => (p.name + " " + p.position + " " + teamName(p.teamId)).toLowerCase().includes(q));

  el.innerHTML = f.length ? f.map(p =>
    `<div class="player-card"><div class="player-avatar">${esc(p.name.charAt(0))}</div><div><h3>${esc(p.name)}</h3><p>${esc(teamName(p.teamId))} • ${esc(p.position)}</p><div class="player-stats"><span><b>${p.goals}</b> Goals</span><span><b>${p.assists}</b> Assists</span><span><b>#${esc(p.jersey)}</b> Jersey</span></div></div></div>`
  ).join("") : '<div class="empty">No players found.</div>';
}

function renderUserMatches() {
  const matches = read(KEYS.matches).slice().sort((a, b) => a.date.localeCompare(b.date));
  const el = document.getElementById("userMatches"); if (!el) return;
  const filter = document.getElementById("userMatchFilter")?.value || "all";
  const f = matches.filter(m => filter === "all" || m.status === filter);

  el.innerHTML = f.length
    ? `<table class="data-table"><thead><tr><th>Match</th><th>Date</th><th>Venue</th><th>Status</th><th>Score</th></tr></thead><tbody>${f.map(m =>
        `<tr><td><strong>${esc(teamName(m.homeId))}</strong> vs <strong>${esc(teamName(m.awayId))}</strong><br><small>Referee: ${esc(m.referee)}</small></td><td>${formatDate(m.date)}<br><small>${esc(m.time)}</small></td><td>${esc(m.venue)}</td><td><span class="status-pill ${m.status === "upcoming" ? "status-upcoming" : "status-completed"}">${m.status}</span></td><td>${m.status === "completed" ? `${m.homeScore} - ${m.awayScore}` : "—"}</td></tr>`
      ).join("")}</tbody></table>`
    : '<div class="empty">No matches found.</div>';
}

function renderUserStatistics() {
  const el = document.getElementById("userStatistics"); if (!el) return;
  const players = read(KEYS.players);
  const standings = calculateStandings();

  const topScorer = players.slice().sort((a, b) => b.goals - a.goals)[0];
  const topAssist = players.slice().sort((a, b) => b.assists - a.assists)[0];
  const mostPlayed = players.slice().sort((a, b) => (b.matchesPlayed || 0) - (a.matchesPlayed || 0))[0];
  const leader = standings.find(r => r.played > 0);

  el.innerHTML = `
    <div class="two-column">
      <div class="panel"><h4>Top Scorer</h4>${topScorer ? `<div class="highlight-card"><strong>${esc(topScorer.name)}</strong><span>${esc(teamName(topScorer.teamId))}</span><b>${topScorer.goals} goals</b></div>` : '<div class="empty">No data.</div>'}</div>
      <div class="panel"><h4>Most Assists</h4>${topAssist ? `<div class="highlight-card"><strong>${esc(topAssist.name)}</strong><span>${esc(teamName(topAssist.teamId))}</span><b>${topAssist.assists} assists</b></div>` : '<div class="empty">No data.</div>'}</div>
    </div>
    <div class="two-column lower-gap">
      <div class="panel"><h4>Most Matches Played</h4>${mostPlayed ? `<div class="highlight-card"><strong>${esc(mostPlayed.name)}</strong><span>${esc(teamName(mostPlayed.teamId))}</span><b>${mostPlayed.matchesPlayed || 0} matches</b></div>` : '<div class="empty">No data.</div>'}</div>
      <div class="panel"><h4>Current League Leader</h4>${leader ? `<div class="highlight-card"><strong>${esc(leader.team)}</strong><span>Current league leader</span><b>${leader.points} points</b></div>` : '<div class="empty">No data.</div>'}</div>
    </div>
    <div class="panel lower-gap"><h4>Player Statistics</h4>
      <table class="data-table"><thead><tr><th>Player</th><th>Team</th><th>Position</th><th>MP</th><th>Goals</th><th>Assists</th></tr></thead>
      <tbody>${players.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(teamName(p.teamId))}</td><td>${esc(p.position)}</td><td>${p.matchesPlayed || 0}</td><td>${p.goals}</td><td>${p.assists}</td></tr>`).join("")}</tbody></table>
    </div>
  `;
}

function renderUserProfile() {
  const u = currentUser(); if (!u) return;
  document.getElementById("userProfileName").value = u.name;
  document.getElementById("userProfileEmail").value = u.email;
  document.getElementById("userProfileRole").value = u.role;
}

function saveUserProfile(e) {
  e.preventDefault();
  const newName = document.getElementById("userProfileName").value.trim();
  if (!newName) { alert("Name cannot be empty."); return; }
  updateCurrentUserName(newName);
  document.getElementById("userName").textContent = newName;
  document.getElementById("userAvatar").textContent = newName.charAt(0).toUpperCase();
  setMessage("userProfileMessage", "Profile updated.", true);
}
