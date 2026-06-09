// Configuration - edit these values for development
const CONFIG = {
  // Hours before match kickoff that voting opens (e.g., 24 = 24h before, 0.5 = 30min before)
  VOTE_OPEN_BEFORE_HOURS: 24,  // Voting opens 24h before kickoff (set to 9999 for always-open)

  // Football API settings
  // Get a free key at: https://www.football-data.org/client/register
  FOOTBALL_API_KEY: "demo",
  FOOTBALL_API_URL: "https://api.football-data.org/v4/competitions/WC/matches",

  // Auto-refresh interval in minutes (0 to disable)
  AUTO_REFRESH_MINUTES: 15,

  // Google Sheets live sync — paste the Apps Script web app URL here.
  // See google-sheets-sync.gs for setup. Leave empty ("") to disable.
  SHEETS_WEBHOOK_URL: "",

  // Firebase config — get from Firebase Console > Project Settings
  // Set FIREBASE_ENABLED to true after filling in the config
  FIREBASE_ENABLED: true,
  FIREBASE: {
    apiKey: "AIzaSyAGlSXA5ci3emDeYoptIOx8Ye9Ma7LVXC8",
    authDomain: "worldcup2026-30d8a.firebaseapp.com",
    projectId: "worldcup2026-30d8a",
    storageBucket: "worldcup2026-30d8a.firebasestorage.app",
    messagingSenderId: "647056398495",
    appId: "1:647056398495:web:3d637eae7da19815a4aaaa",
  },
  // Admin password for entering match results (simple protection)
  ADMIN_PASSWORD: "Test1234",

  // Admin emails that can enter results (leave empty to use password only)
  ADMIN_EMAILS: ["xuanhavcdn@gmail.com"],

  // One-time data reset — bump this string to force every browser to clear its
  // locally cached votes/voterLog/results once on next load. Set to "" to disable.
  DATA_RESET_TOKEN: "2026-06-09-reset",

  // Test mode — set to true to load fake results & voter data for development
  TEST_MODE: false,
  TEST_DATA: {
    // Finished matches with results
    results: {
      // Group A: 1st Mexico (7pts), 2nd South Korea (6pts)
      "A1": { score1: 2, score2: 1 },  // Mexico 2-1 South Africa
      "A2": { score1: 1, score2: 0 },  // South Korea 1-0 Czechia
      "A3": { score1: 1, score2: 1 },  // Mexico 1-1 South Korea
      "A4": { score1: 2, score2: 0 },  // South Africa 2-0 Czechia
      "A5": { score1: 0, score2: 3 },  // Czechia 0-3 Mexico
      "A6": { score1: 1, score2: 2 },  // South Africa 1-2 South Korea

      // Group B: 1st Canada (7pts), 2nd Switzerland (6pts)
      "B1": { score1: 3, score2: 1 },  // Canada 3-1 Bosnia
      "B2": { score1: 0, score2: 2 },  // Qatar 0-2 Switzerland
      "B3": { score1: 2, score2: 0 },  // Canada 2-0 Qatar
      "B4": { score1: 1, score2: 1 },  // Bosnia 1-1 Switzerland
      "B5": { score1: 0, score2: 1 },  // Switzerland 0-1 Canada
      "B6": { score1: 2, score2: 0 },  // Bosnia 2-0 Qatar

      // Group C: 1st Brazil (9pts), 2nd Morocco (6pts)
      "C1": { score1: 2, score2: 0 },  // Brazil 2-0 Morocco
      "C2": { score1: 0, score2: 1 },  // Haiti 0-1 Scotland
      "C3": { score1: 4, score2: 0 },  // Brazil 4-0 Haiti
      "C4": { score1: 2, score2: 1 },  // Morocco 2-1 Scotland
      "C5": { score1: 0, score2: 2 },  // Scotland 0-2 Brazil
      "C6": { score1: 3, score2: 0 },  // Morocco 3-0 Haiti

      // Group D: 1st United States (7pts), 2nd Turkiye (5pts)
      "D1": { score1: 3, score2: 1 },  // USA 3-1 Paraguay
      "D2": { score1: 1, score2: 2 },  // Australia 1-2 Turkiye
      "D3": { score1: 2, score2: 0 },  // USA 2-0 Australia
      "D4": { score1: 1, score2: 1 },  // Paraguay 1-1 Turkiye
      "D5": { score1: 0, score2: 0 },  // Turkiye 0-0 USA
      "D6": { score1: 2, score2: 1 },  // Paraguay 2-1 Australia

      // Group E: 1st Germany (9pts), 2nd Ecuador (4pts)
      "E1": { score1: 4, score2: 0 },  // Germany 4-0 Curacao
      "E2": { score1: 1, score2: 1 },  // Ivory Coast 1-1 Ecuador
      "E3": { score1: 2, score2: 1 },  // Germany 2-1 Ivory Coast
      "E4": { score1: 0, score2: 2 },  // Curacao 0-2 Ecuador
      "E5": { score1: 0, score2: 3 },  // Ecuador 0-3 Germany
      "E6": { score1: 1, score2: 0 },  // Curacao 1-0 Ivory Coast

      // Group F: 1st Netherlands (7pts), 2nd Japan (6pts)
      "F1": { score1: 1, score2: 1 },  // Netherlands 1-1 Japan
      "F2": { score1: 2, score2: 0 },  // Sweden 2-0 Tunisia
      "F3": { score1: 3, score2: 1 },  // Netherlands 3-1 Sweden
      "F4": { score1: 2, score2: 0 },  // Japan 2-0 Tunisia
      "F5": { score1: 0, score2: 2 },  // Tunisia 0-2 Netherlands
      "F6": { score1: 1, score2: 0 },  // Japan 1-0 Sweden

      // Group G: 1st Belgium (7pts), 2nd Egypt (5pts)
      "G1": { score1: 2, score2: 1 },  // Belgium 2-1 Egypt
      "G2": { score1: 3, score2: 0 },  // Iran 3-0 New Zealand
      "G3": { score1: 1, score2: 0 },  // Belgium 1-0 Iran
      "G4": { score1: 2, score2: 1 },  // Egypt 2-1 New Zealand
      "G5": { score1: 0, score2: 2 },  // New Zealand 0-2 Belgium
      "G6": { score1: 1, score2: 1 },  // Egypt 1-1 Iran

      // Group H: 1st Spain (9pts), 2nd Uruguay (6pts)
      "H1": { score1: 3, score2: 0 },  // Spain 3-0 Cape Verde
      "H2": { score1: 0, score2: 2 },  // Saudi Arabia 0-2 Uruguay
      "H3": { score1: 2, score2: 0 },  // Spain 2-0 Saudi Arabia
      "H4": { score1: 1, score2: 3 },  // Cape Verde 1-3 Uruguay
      "H5": { score1: 0, score2: 1 },  // Uruguay 0-1 Spain
      "H6": { score1: 2, score2: 1 },  // Cape Verde 2-1 Saudi Arabia

      // Group I: 1st France (7pts), 2nd Senegal (5pts)
      "I1": { score1: 2, score2: 0 },  // France 2-0 Senegal
      "I2": { score1: 1, score2: 1 },  // Iraq 1-1 Norway
      "I3": { score1: 3, score2: 0 },  // France 3-0 Iraq
      "I4": { score1: 0, score2: 0 },  // Senegal 0-0 Norway
      "I5": { score1: 1, score2: 1 },  // Norway 1-1 France
      "I6": { score1: 2, score2: 0 },  // Senegal 2-0 Iraq

      // Group J: 1st Argentina (9pts), 2nd Austria (4pts)
      "J1": { score1: 3, score2: 1 },  // Argentina 3-1 Algeria
      "J2": { score1: 2, score2: 0 },  // Austria 2-0 Jordan
      "J3": { score1: 2, score2: 0 },  // Argentina 2-0 Austria
      "J4": { score1: 1, score2: 1 },  // Algeria 1-1 Jordan
      "J5": { score1: 0, score2: 2 },  // Jordan 0-2 Argentina
      "J6": { score1: 0, score2: 1 },  // Algeria 0-1 Austria

      // Group K: 1st Portugal (7pts), 2nd Colombia (6pts)
      "K1": { score1: 2, score2: 0 },  // Portugal 2-0 Congo DR
      "K2": { score1: 0, score2: 1 },  // Uzbekistan 0-1 Colombia
      "K3": { score1: 1, score2: 0 },  // Portugal 1-0 Uzbekistan
      "K4": { score1: 1, score2: 2 },  // Congo DR 1-2 Colombia
      "K5": { score1: 1, score2: 1 },  // Colombia 1-1 Portugal
      "K6": { score1: 2, score2: 0 },  // Congo DR 2-0 Uzbekistan

      // Group L: 1st England (7pts), 2nd Croatia (5pts)
      "L1": { score1: 2, score2: 1 },  // England 2-1 Croatia
      "L2": { score1: 1, score2: 0 },  // Ghana 1-0 Panama
      "L3": { score1: 3, score2: 0 },  // England 3-0 Ghana
      "L4": { score1: 2, score2: 1 },  // Croatia 2-1 Panama
      "L5": { score1: 0, score2: 1 },  // Panama 0-1 England
      "L6": { score1: 1, score2: 0 },  // Croatia 1-0 Ghana

      // R32 — all 16 matches
      "R32-L1": { score1: 2, score2: 0 },  // Mexico (1A) 2-0 Switzerland (2B)
      "R32-L2": { score1: 3, score2: 1 },  // Brazil (1C) 3-1 Turkiye (2D)
      "R32-L3": { score1: 3, score2: 0 },  // Germany (1E) 3-0 Japan (2F)
      "R32-L4": { score1: 1, score2: 0 },  // Belgium (1G) 1-0 Uruguay (2H)
      "R32-L5": { score1: 2, score2: 1 },  // France (1I) 2-1 Austria (2J)
      "R32-L6": { score1: 1, score2: 0 },  // Portugal (1K) 1-0 Croatia (2L)
      "R32-L7": { score1: 1, score2: 2 },  // South Korea (2A) 1-2 Switzerland (2B*)
      "R32-L8": { score1: 0, score2: 1 },  // Morocco (2C) 0-1 United States (1D)
      "R32-R1": { score1: 1, score2: 0 },  // Canada (1B) 1-0 South Korea (2A)
      "R32-R2": { score1: 0, score2: 2 },  // United States (1D) 0-2 Morocco (2C)
      "R32-R3": { score1: 2, score2: 1 },  // Netherlands (1F) 2-1 Ecuador (2E)
      "R32-R4": { score1: 0, score2: 1 },  // Spain (1H) 0-1 Egypt (2G)
      "R32-R5": { score1: 3, score2: 0 },  // Argentina (1J) 3-0 Senegal (2I)
      "R32-R6": { score1: 2, score2: 0 },  // England (1L) 2-0 Colombia (2K)
      "R32-R7": { score1: 1, score2: 0 },  // Switzerland (2B) 1-0 Mexico (1A*)
      "R32-R8": { score1: 1, score2: 3 },  // Turkiye (2D) 1-3 Brazil (1C)

      // R16 — 4 matches finished, 4 upcoming
      "R16-L1": { score1: 1, score2: 0 },  // Mexico 1-0 Brazil
      "R16-L2": { score1: 2, score2: 1 },  // Germany 2-1 Belgium
      "R16-R1": { score1: 0, score2: 1 },  // Canada 0-1 Morocco
      "R16-R2": { score1: 3, score2: 2 },  // Netherlands 3-2 Egypt

      // QF — 2 finished
      "QF-L1": { score1: 2, score2: 1 },   // Mexico 2-1 Germany
      "QF-R1": { score1: 1, score2: 0 },   // Morocco 1-0 Netherlands
    },
    // Test voters with score predictions
    voterLog: {
      // Group A
      "A1": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 2, score2: 1, timestamp: "2026-06-11T10:00:00Z" },  // exact
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team1", score1: 3, score2: 0, timestamp: "2026-06-11T09:00:00Z" },    // correct winner
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team2", score1: 0, score2: 2, timestamp: "2026-06-11T08:00:00Z" },         // wrong
      ],
      "A2": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 1, score2: 0, timestamp: "2026-06-11T13:00:00Z" }, // exact
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "draw", score1: 1, score2: 1, timestamp: "2026-06-11T12:00:00Z" },      // wrong
      ],
      "A3": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "draw", score1: 1, score2: 1, timestamp: "2026-06-16T10:00:00Z" },  // exact
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team2", score1: 0, score2: 2, timestamp: "2026-06-16T08:00:00Z" },         // wrong
      ],
      // Group B
      "B1": [
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team1", score1: 3, score2: 1, timestamp: "2026-06-11T16:00:00Z" },    // exact
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team1", score1: 2, score2: 0, timestamp: "2026-06-11T15:00:00Z" },         // correct winner
      ],
      "B2": [
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team2", score1: 0, score2: 2, timestamp: "2026-06-11T19:00:00Z" },    // exact
        { name: "Le Van C", email: "levanc@gmail.com", choice: "draw", score1: 0, score2: 0, timestamp: "2026-06-11T18:00:00Z" },          // wrong
      ],
      // Group C
      "C1": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 2, score2: 0, timestamp: "2026-06-12T10:00:00Z" }, // exact
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team1", score1: 1, score2: 0, timestamp: "2026-06-12T09:00:00Z" },         // correct winner
      ],
      // Group D
      "D1": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 3, score2: 1, timestamp: "2026-06-12T16:00:00Z" }, // exact
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team1", score1: 2, score2: 0, timestamp: "2026-06-12T15:00:00Z" },    // correct winner
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team2", score1: 1, score2: 3, timestamp: "2026-06-12T14:00:00Z" },         // wrong
      ],
      // R32
      "R32-L1": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 2, score2: 0, timestamp: "2026-06-29T10:00:00Z" }, // exact
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team1", score1: 1, score2: 0, timestamp: "2026-06-29T09:00:00Z" },    // correct winner
      ],
      "R32-L2": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 3, score2: 1, timestamp: "2026-06-29T14:00:00Z" }, // exact
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team2", score1: 0, score2: 1, timestamp: "2026-06-29T13:00:00Z" },         // wrong
      ],
      // R16
      "R16-L1": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 1, score2: 0, timestamp: "2026-07-04T12:00:00Z" }, // exact
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team2", score1: 0, score2: 2, timestamp: "2026-07-04T11:00:00Z" },    // wrong
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team1", score1: 2, score2: 1, timestamp: "2026-07-04T10:00:00Z" },         // correct winner
      ],
      // Votes on upcoming knockout matches
      "R32-L3": [
        { name: "Nguyen Van A", email: "nguyenvana@gmail.com", choice: "team1", score1: 2, score2: 1, timestamp: "2026-07-01T10:00:00Z" },
        { name: "Tran Thi B", email: "tranthib@gmail.com", choice: "team2", score1: 1, score2: 3, timestamp: "2026-07-01T09:00:00Z" },
      ],
      "R32-R3": [
        { name: "Le Van C", email: "levanc@gmail.com", choice: "team1", score1: 1, score2: 0, timestamp: "2026-07-01T14:00:00Z" },
      ],
    },
  },
};
