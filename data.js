const MATCHES = [
  // GROUP A: Mexico, South Africa, South Korea, Czechia
  { id: "A1", group: "A", date: "2026-06-11", time: "12:00", team1: "Mexico", team2: "South Africa", flag1: "🇲🇽", flag2: "🇿🇦" },
  { id: "A2", group: "A", date: "2026-06-11", time: "15:00", team1: "South Korea", team2: "Czechia", flag1: "🇰🇷", flag2: "🇨🇿" },
  { id: "A3", group: "A", date: "2026-06-17", time: "12:00", team1: "Mexico", team2: "South Korea", flag1: "🇲🇽", flag2: "🇰🇷" },
  { id: "A4", group: "A", date: "2026-06-17", time: "15:00", team1: "South Africa", team2: "Czechia", flag1: "🇿🇦", flag2: "🇨🇿" },
  { id: "A5", group: "A", date: "2026-06-23", time: "18:00", team1: "Czechia", team2: "Mexico", flag1: "🇨🇿", flag2: "🇲🇽" },
  { id: "A6", group: "A", date: "2026-06-23", time: "18:00", team1: "South Africa", team2: "South Korea", flag1: "🇿🇦", flag2: "🇰🇷" },

  // GROUP B: Canada, Bosnia & Herzegovina, Qatar, Switzerland
  { id: "B1", group: "B", date: "2026-06-11", time: "18:00", team1: "Canada", team2: "Bosnia & Herzegovina", flag1: "🇨🇦", flag2: "🇧🇦" },
  { id: "B2", group: "B", date: "2026-06-11", time: "21:00", team1: "Qatar", team2: "Switzerland", flag1: "🇶🇦", flag2: "🇨🇭" },
  { id: "B3", group: "B", date: "2026-06-17", time: "18:00", team1: "Canada", team2: "Qatar", flag1: "🇨🇦", flag2: "🇶🇦" },
  { id: "B4", group: "B", date: "2026-06-17", time: "21:00", team1: "Bosnia & Herzegovina", team2: "Switzerland", flag1: "🇧🇦", flag2: "🇨🇭" },
  { id: "B5", group: "B", date: "2026-06-23", time: "21:00", team1: "Switzerland", team2: "Canada", flag1: "🇨🇭", flag2: "🇨🇦" },
  { id: "B6", group: "B", date: "2026-06-23", time: "21:00", team1: "Bosnia & Herzegovina", team2: "Qatar", flag1: "🇧🇦", flag2: "🇶🇦" },

  // GROUP C: Brazil, Morocco, Haiti, Scotland
  { id: "C1", group: "C", date: "2026-06-12", time: "12:00", team1: "Brazil", team2: "Morocco", flag1: "🇧🇷", flag2: "🇲🇦" },
  { id: "C2", group: "C", date: "2026-06-12", time: "15:00", team1: "Haiti", team2: "Scotland", flag1: "🇭🇹", flag2: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "C3", group: "C", date: "2026-06-18", time: "12:00", team1: "Brazil", team2: "Haiti", flag1: "🇧🇷", flag2: "🇭🇹" },
  { id: "C4", group: "C", date: "2026-06-18", time: "15:00", team1: "Morocco", team2: "Scotland", flag1: "🇲🇦", flag2: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "C5", group: "C", date: "2026-06-24", time: "18:00", team1: "Scotland", team2: "Brazil", flag1: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", flag2: "🇧🇷" },
  { id: "C6", group: "C", date: "2026-06-24", time: "18:00", team1: "Morocco", team2: "Haiti", flag1: "🇲🇦", flag2: "🇭🇹" },

  // GROUP D: United States, Paraguay, Australia, Turkiye
  { id: "D1", group: "D", date: "2026-06-12", time: "18:00", team1: "United States", team2: "Paraguay", flag1: "🇺🇸", flag2: "🇵🇾" },
  { id: "D2", group: "D", date: "2026-06-12", time: "21:00", team1: "Australia", team2: "Turkiye", flag1: "🇦🇺", flag2: "🇹🇷" },
  { id: "D3", group: "D", date: "2026-06-18", time: "18:00", team1: "United States", team2: "Australia", flag1: "🇺🇸", flag2: "🇦🇺" },
  { id: "D4", group: "D", date: "2026-06-18", time: "21:00", team1: "Paraguay", team2: "Turkiye", flag1: "🇵🇾", flag2: "🇹🇷" },
  { id: "D5", group: "D", date: "2026-06-24", time: "21:00", team1: "Turkiye", team2: "United States", flag1: "🇹🇷", flag2: "🇺🇸" },
  { id: "D6", group: "D", date: "2026-06-24", time: "21:00", team1: "Paraguay", team2: "Australia", flag1: "🇵🇾", flag2: "🇦🇺" },

  // GROUP E: Germany, Curacao, Ivory Coast, Ecuador
  { id: "E1", group: "E", date: "2026-06-13", time: "12:00", team1: "Germany", team2: "Curacao", flag1: "🇩🇪", flag2: "🇨🇼" },
  { id: "E2", group: "E", date: "2026-06-13", time: "15:00", team1: "Ivory Coast", team2: "Ecuador", flag1: "🇨🇮", flag2: "🇪🇨" },
  { id: "E3", group: "E", date: "2026-06-19", time: "12:00", team1: "Germany", team2: "Ivory Coast", flag1: "🇩🇪", flag2: "🇨🇮" },
  { id: "E4", group: "E", date: "2026-06-19", time: "15:00", team1: "Curacao", team2: "Ecuador", flag1: "🇨🇼", flag2: "🇪🇨" },
  { id: "E5", group: "E", date: "2026-06-25", time: "18:00", team1: "Ecuador", team2: "Germany", flag1: "🇪🇨", flag2: "🇩🇪" },
  { id: "E6", group: "E", date: "2026-06-25", time: "18:00", team1: "Curacao", team2: "Ivory Coast", flag1: "🇨🇼", flag2: "🇨🇮" },

  // GROUP F: Netherlands, Japan, Sweden, Tunisia
  { id: "F1", group: "F", date: "2026-06-13", time: "18:00", team1: "Netherlands", team2: "Japan", flag1: "🇳🇱", flag2: "🇯🇵" },
  { id: "F2", group: "F", date: "2026-06-13", time: "21:00", team1: "Sweden", team2: "Tunisia", flag1: "🇸🇪", flag2: "🇹🇳" },
  { id: "F3", group: "F", date: "2026-06-19", time: "18:00", team1: "Netherlands", team2: "Sweden", flag1: "🇳🇱", flag2: "🇸🇪" },
  { id: "F4", group: "F", date: "2026-06-19", time: "21:00", team1: "Japan", team2: "Tunisia", flag1: "🇯🇵", flag2: "🇹🇳" },
  { id: "F5", group: "F", date: "2026-06-25", time: "21:00", team1: "Tunisia", team2: "Netherlands", flag1: "🇹🇳", flag2: "🇳🇱" },
  { id: "F6", group: "F", date: "2026-06-25", time: "21:00", team1: "Japan", team2: "Sweden", flag1: "🇯🇵", flag2: "🇸🇪" },

  // GROUP G: Belgium, Egypt, Iran, New Zealand
  { id: "G1", group: "G", date: "2026-06-14", time: "12:00", team1: "Belgium", team2: "Egypt", flag1: "🇧🇪", flag2: "🇪🇬" },
  { id: "G2", group: "G", date: "2026-06-14", time: "15:00", team1: "Iran", team2: "New Zealand", flag1: "🇮🇷", flag2: "🇳🇿" },
  { id: "G3", group: "G", date: "2026-06-20", time: "12:00", team1: "Belgium", team2: "Iran", flag1: "🇧🇪", flag2: "🇮🇷" },
  { id: "G4", group: "G", date: "2026-06-20", time: "15:00", team1: "Egypt", team2: "New Zealand", flag1: "🇪🇬", flag2: "🇳🇿" },
  { id: "G5", group: "G", date: "2026-06-26", time: "18:00", team1: "New Zealand", team2: "Belgium", flag1: "🇳🇿", flag2: "🇧🇪" },
  { id: "G6", group: "G", date: "2026-06-26", time: "18:00", team1: "Egypt", team2: "Iran", flag1: "🇪🇬", flag2: "🇮🇷" },

  // GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay
  { id: "H1", group: "H", date: "2026-06-14", time: "18:00", team1: "Spain", team2: "Cape Verde", flag1: "🇪🇸", flag2: "🇨🇻" },
  { id: "H2", group: "H", date: "2026-06-14", time: "21:00", team1: "Saudi Arabia", team2: "Uruguay", flag1: "🇸🇦", flag2: "🇺🇾" },
  { id: "H3", group: "H", date: "2026-06-20", time: "18:00", team1: "Spain", team2: "Saudi Arabia", flag1: "🇪🇸", flag2: "🇸🇦" },
  { id: "H4", group: "H", date: "2026-06-20", time: "21:00", team1: "Cape Verde", team2: "Uruguay", flag1: "🇨🇻", flag2: "🇺🇾" },
  { id: "H5", group: "H", date: "2026-06-26", time: "21:00", team1: "Uruguay", team2: "Spain", flag1: "🇺🇾", flag2: "🇪🇸" },
  { id: "H6", group: "H", date: "2026-06-26", time: "21:00", team1: "Cape Verde", team2: "Saudi Arabia", flag1: "🇨🇻", flag2: "🇸🇦" },

  // GROUP I: France, Senegal, Iraq, Norway
  { id: "I1", group: "I", date: "2026-06-15", time: "12:00", team1: "France", team2: "Senegal", flag1: "🇫🇷", flag2: "🇸🇳" },
  { id: "I2", group: "I", date: "2026-06-15", time: "15:00", team1: "Iraq", team2: "Norway", flag1: "🇮🇶", flag2: "🇳🇴" },
  { id: "I3", group: "I", date: "2026-06-21", time: "12:00", team1: "France", team2: "Iraq", flag1: "🇫🇷", flag2: "🇮🇶" },
  { id: "I4", group: "I", date: "2026-06-21", time: "15:00", team1: "Senegal", team2: "Norway", flag1: "🇸🇳", flag2: "🇳🇴" },
  { id: "I5", group: "I", date: "2026-06-27", time: "18:00", team1: "Norway", team2: "France", flag1: "🇳🇴", flag2: "🇫🇷" },
  { id: "I6", group: "I", date: "2026-06-27", time: "18:00", team1: "Senegal", team2: "Iraq", flag1: "🇸🇳", flag2: "🇮🇶" },

  // GROUP J: Argentina, Algeria, Austria, Jordan
  { id: "J1", group: "J", date: "2026-06-15", time: "18:00", team1: "Argentina", team2: "Algeria", flag1: "🇦🇷", flag2: "🇩🇿" },
  { id: "J2", group: "J", date: "2026-06-15", time: "21:00", team1: "Austria", team2: "Jordan", flag1: "🇦🇹", flag2: "🇯🇴" },
  { id: "J3", group: "J", date: "2026-06-21", time: "18:00", team1: "Argentina", team2: "Austria", flag1: "🇦🇷", flag2: "🇦🇹" },
  { id: "J4", group: "J", date: "2026-06-21", time: "21:00", team1: "Algeria", team2: "Jordan", flag1: "🇩🇿", flag2: "🇯🇴" },
  { id: "J5", group: "J", date: "2026-06-27", time: "21:00", team1: "Jordan", team2: "Argentina", flag1: "🇯🇴", flag2: "🇦🇷" },
  { id: "J6", group: "J", date: "2026-06-27", time: "21:00", team1: "Algeria", team2: "Austria", flag1: "🇩🇿", flag2: "🇦🇹" },

  // GROUP K: Portugal, Congo DR, Uzbekistan, Colombia
  { id: "K1", group: "K", date: "2026-06-16", time: "12:00", team1: "Portugal", team2: "Congo DR", flag1: "🇵🇹", flag2: "🇨🇩" },
  { id: "K2", group: "K", date: "2026-06-16", time: "15:00", team1: "Uzbekistan", team2: "Colombia", flag1: "🇺🇿", flag2: "🇨🇴" },
  { id: "K3", group: "K", date: "2026-06-22", time: "12:00", team1: "Portugal", team2: "Uzbekistan", flag1: "🇵🇹", flag2: "🇺🇿" },
  { id: "K4", group: "K", date: "2026-06-22", time: "15:00", team1: "Congo DR", team2: "Colombia", flag1: "🇨🇩", flag2: "🇨🇴" },
  { id: "K5", group: "K", date: "2026-06-28", time: "18:00", team1: "Colombia", team2: "Portugal", flag1: "🇨🇴", flag2: "🇵🇹" },
  { id: "K6", group: "K", date: "2026-06-28", time: "18:00", team1: "Congo DR", team2: "Uzbekistan", flag1: "🇨🇩", flag2: "🇺🇿" },

  // GROUP L: England, Croatia, Ghana, Panama
  { id: "L1", group: "L", date: "2026-06-16", time: "18:00", team1: "England", team2: "Croatia", flag1: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flag2: "🇭🇷" },
  { id: "L2", group: "L", date: "2026-06-16", time: "21:00", team1: "Ghana", team2: "Panama", flag1: "🇬🇭", flag2: "🇵🇦" },
  { id: "L3", group: "L", date: "2026-06-22", time: "18:00", team1: "England", team2: "Ghana", flag1: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flag2: "🇬🇭" },
  { id: "L4", group: "L", date: "2026-06-22", time: "21:00", team1: "Croatia", team2: "Panama", flag1: "🇭🇷", flag2: "🇵🇦" },
  { id: "L5", group: "L", date: "2026-06-28", time: "21:00", team1: "Panama", team2: "England", flag1: "🇵🇦", flag2: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "L6", group: "L", date: "2026-06-28", time: "21:00", team1: "Croatia", team2: "Ghana", flag1: "🇭🇷", flag2: "🇬🇭" },

  // ROUND OF 32 (June 30 - July 3)
  { id: "R32-L1", round: "R32", date: "2026-06-30", time: "12:00", team1: "1A", team2: "2B", flag1: "", flag2: "", slot1: "1A", slot2: "2B" },
  { id: "R32-L2", round: "R32", date: "2026-06-30", time: "16:00", team1: "1C", team2: "2D", flag1: "", flag2: "", slot1: "1C", slot2: "2D" },
  { id: "R32-R1", round: "R32", date: "2026-06-30", time: "20:00", team1: "1B", team2: "2A", flag1: "", flag2: "", slot1: "1B", slot2: "2A" },
  { id: "R32-R2", round: "R32", date: "2026-07-01", time: "12:00", team1: "1D", team2: "2C", flag1: "", flag2: "", slot1: "1D", slot2: "2C" },
  { id: "R32-L3", round: "R32", date: "2026-07-01", time: "16:00", team1: "1E", team2: "2F", flag1: "", flag2: "", slot1: "1E", slot2: "2F" },
  { id: "R32-L4", round: "R32", date: "2026-07-01", time: "20:00", team1: "1G", team2: "2H", flag1: "", flag2: "", slot1: "1G", slot2: "2H" },
  { id: "R32-R3", round: "R32", date: "2026-07-02", time: "12:00", team1: "1F", team2: "2E", flag1: "", flag2: "", slot1: "1F", slot2: "2E" },
  { id: "R32-R4", round: "R32", date: "2026-07-02", time: "16:00", team1: "1H", team2: "2G", flag1: "", flag2: "", slot1: "1H", slot2: "2G" },
  { id: "R32-L5", round: "R32", date: "2026-07-02", time: "20:00", team1: "1I", team2: "2J", flag1: "", flag2: "", slot1: "1I", slot2: "2J" },
  { id: "R32-R5", round: "R32", date: "2026-07-03", time: "12:00", team1: "1J", team2: "2I", flag1: "", flag2: "", slot1: "1J", slot2: "2I" },
  { id: "R32-L6", round: "R32", date: "2026-07-03", time: "16:00", team1: "1K", team2: "2L", flag1: "", flag2: "", slot1: "1K", slot2: "2L" },
  { id: "R32-R6", round: "R32", date: "2026-07-03", time: "20:00", team1: "1L", team2: "2K", flag1: "", flag2: "", slot1: "1L", slot2: "2K" },
  { id: "R32-L7", round: "R32", date: "2026-07-04", time: "16:00", team1: "2A", team2: "2B*", flag1: "", flag2: "", slot1: "2A", slot2: "2B*" },
  { id: "R32-L8", round: "R32", date: "2026-07-04", time: "20:00", team1: "2C", team2: "1D", flag1: "", flag2: "", slot1: "2C", slot2: "1D" },
  { id: "R32-R7", round: "R32", date: "2026-07-04", time: "12:00", team1: "2B", team2: "1A*", flag1: "", flag2: "", slot1: "2B", slot2: "1A*" },
  { id: "R32-R8", round: "R32", date: "2026-07-04", time: "20:00", team1: "2D", team2: "1C", flag1: "", flag2: "", slot1: "2D", slot2: "1C" },

  // ROUND OF 16 (July 5-8)
  { id: "R16-L1", round: "R16", date: "2026-07-05", time: "14:00", team1: "W R32-L1", team2: "W R32-L2", flag1: "", flag2: "", from: ["R32-L1", "R32-L2"] },
  { id: "R16-L2", round: "R16", date: "2026-07-05", time: "18:00", team1: "W R32-L3", team2: "W R32-L4", flag1: "", flag2: "", from: ["R32-L3", "R32-L4"] },
  { id: "R16-R1", round: "R16", date: "2026-07-06", time: "14:00", team1: "W R32-R1", team2: "W R32-R2", flag1: "", flag2: "", from: ["R32-R1", "R32-R2"] },
  { id: "R16-R2", round: "R16", date: "2026-07-06", time: "18:00", team1: "W R32-R3", team2: "W R32-R4", flag1: "", flag2: "", from: ["R32-R3", "R32-R4"] },
  { id: "R16-L3", round: "R16", date: "2026-07-07", time: "14:00", team1: "W R32-L5", team2: "W R32-L6", flag1: "", flag2: "", from: ["R32-L5", "R32-L6"] },
  { id: "R16-L4", round: "R16", date: "2026-07-07", time: "18:00", team1: "W R32-L7", team2: "W R32-L8", flag1: "", flag2: "", from: ["R32-L7", "R32-L8"] },
  { id: "R16-R3", round: "R16", date: "2026-07-08", time: "14:00", team1: "W R32-R5", team2: "W R32-R6", flag1: "", flag2: "", from: ["R32-R5", "R32-R6"] },
  { id: "R16-R4", round: "R16", date: "2026-07-08", time: "18:00", team1: "W R32-R7", team2: "W R32-R8", flag1: "", flag2: "", from: ["R32-R7", "R32-R8"] },

  // QUARTER FINALS (July 10-11)
  { id: "QF-L1", round: "QF", date: "2026-07-10", time: "14:00", team1: "W R16-L1", team2: "W R16-L2", flag1: "", flag2: "", from: ["R16-L1", "R16-L2"] },
  { id: "QF-L2", round: "QF", date: "2026-07-10", time: "18:00", team1: "W R16-L3", team2: "W R16-L4", flag1: "", flag2: "", from: ["R16-L3", "R16-L4"] },
  { id: "QF-R1", round: "QF", date: "2026-07-11", time: "14:00", team1: "W R16-R1", team2: "W R16-R2", flag1: "", flag2: "", from: ["R16-R1", "R16-R2"] },
  { id: "QF-R2", round: "QF", date: "2026-07-11", time: "18:00", team1: "W R16-R3", team2: "W R16-R4", flag1: "", flag2: "", from: ["R16-R3", "R16-R4"] },

  // SEMI FINALS (July 14-15)
  { id: "SF-L", round: "SF", date: "2026-07-14", time: "18:00", team1: "W QF-L1", team2: "W QF-L2", flag1: "", flag2: "", from: ["QF-L1", "QF-L2"] },
  { id: "SF-R", round: "SF", date: "2026-07-15", time: "18:00", team1: "W QF-R1", team2: "W QF-R2", flag1: "", flag2: "", from: ["QF-R1", "QF-R2"] },

  // 3RD PLACE (July 18)
  { id: "3P", round: "3P", date: "2026-07-18", time: "16:00", team1: "L SF-L", team2: "L SF-R", flag1: "", flag2: "", from: ["SF-L", "SF-R"], loser: true },

  // FINAL (July 19)
  { id: "FINAL", round: "FINAL", date: "2026-07-19", time: "16:00", team1: "W SF-L", team2: "W SF-R", flag1: "", flag2: "", from: ["SF-L", "SF-R"] },
];

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Teams per group from map.webp (12-group format, seeded order: 1st seed, 2nd, 3rd, 4th)
const BRACKET_GROUPS = {
  A: [
    { name: "Mexico", flag: "🇲🇽" },
    { name: "South Africa", flag: "🇿🇦" },
    { name: "Korea Republic", flag: "🇰🇷" },
    { name: "Czechia", flag: "🇨🇿" },
  ],
  B: [
    { name: "Canada", flag: "🇨🇦" },
    { name: "Bosnia-Herzegovina", flag: "🇧🇦" },
    { name: "Qatar", flag: "🇶🇦" },
    { name: "Switzerland", flag: "🇨🇭" },
  ],
  C: [
    { name: "Brazil", flag: "🇧🇷" },
    { name: "Morocco", flag: "🇲🇦" },
    { name: "Haiti", flag: "🇭🇹" },
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  ],
  D: [
    { name: "USA", flag: "🇺🇸" },
    { name: "Paraguay", flag: "🇵🇾" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "Turkiye", flag: "🇹🇷" },
  ],
  E: [
    { name: "Germany", flag: "🇩🇪" },
    { name: "Curacao", flag: "🇨🇼" },
    { name: "Cote d'Ivoire", flag: "🇨🇮" },
    { name: "Ecuador", flag: "🇪🇨" },
  ],
  F: [
    { name: "Netherlands", flag: "🇳🇱" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "Sweden", flag: "🇸🇪" },
    { name: "Tunisia", flag: "🇹🇳" },
  ],
  G: [
    { name: "Belgium", flag: "🇧🇪" },
    { name: "Egypt", flag: "🇪🇬" },
    { name: "Iran", flag: "🇮🇷" },
    { name: "New Zealand", flag: "🇳🇿" },
  ],
  H: [
    { name: "Spain", flag: "🇪🇸" },
    { name: "Cabo Verde", flag: "🇨🇻" },
    { name: "Saudi Arabia", flag: "🇸🇦" },
    { name: "Uruguay", flag: "🇺🇾" },
  ],
  I: [
    { name: "France", flag: "🇫🇷" },
    { name: "Senegal", flag: "🇸🇳" },
    { name: "Iraq", flag: "🇮🇶" },
    { name: "Norway", flag: "🇳🇴" },
  ],
  J: [
    { name: "Argentina", flag: "🇦🇷" },
    { name: "Algeria", flag: "🇩🇿" },
    { name: "Austria", flag: "🇦🇹" },
    { name: "Jordan", flag: "🇯🇴" },
  ],
  K: [
    { name: "Portugal", flag: "🇵🇹" },
    { name: "Congo DR", flag: "🇨🇩" },
    { name: "Uzbekistan", flag: "🇺🇿" },
    { name: "Colombia", flag: "🇨🇴" },
  ],
  L: [
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "Croatia", flag: "🇭🇷" },
    { name: "Ghana", flag: "🇬🇭" },
    { name: "Panama", flag: "🇵🇦" },
  ],
};

// Knockout bracket following map.webp structure (FIFA World Cup 2026 - 48 teams, 12 groups A-L)
// Slot format: "1A" = 1st place Group A, "2B" = 2nd place Group B, etc.
// Groups I-L are from the extended 12-group format shown in map.webp
const BRACKET = {
  // LEFT HALF - Round of 32
  "R32-L1": { id: "R32-L1", slot1: "1A", slot2: "2B", round: "R32", side: "left", pos: 0 },
  "R32-L2": { id: "R32-L2", slot1: "1C", slot2: "2D", round: "R32", side: "left", pos: 1 },
  "R32-L3": { id: "R32-L3", slot1: "1E", slot2: "2F", round: "R32", side: "left", pos: 2 },
  "R32-L4": { id: "R32-L4", slot1: "1G", slot2: "2H", round: "R32", side: "left", pos: 3 },
  "R32-L5": { id: "R32-L5", slot1: "1I", slot2: "2J", round: "R32", side: "left", pos: 4 },
  "R32-L6": { id: "R32-L6", slot1: "1K", slot2: "2L", round: "R32", side: "left", pos: 5 },
  "R32-L7": { id: "R32-L7", slot1: "2A", slot2: "2B*", round: "R32", side: "left", pos: 6 },
  "R32-L8": { id: "R32-L8", slot1: "2C", slot2: "1D", round: "R32", side: "left", pos: 7 },

  // RIGHT HALF - Round of 32
  "R32-R1": { id: "R32-R1", slot1: "1B", slot2: "2A", round: "R32", side: "right", pos: 0 },
  "R32-R2": { id: "R32-R2", slot1: "1D", slot2: "2C", round: "R32", side: "right", pos: 1 },
  "R32-R3": { id: "R32-R3", slot1: "1F", slot2: "2E", round: "R32", side: "right", pos: 2 },
  "R32-R4": { id: "R32-R4", slot1: "1H", slot2: "2G", round: "R32", side: "right", pos: 3 },
  "R32-R5": { id: "R32-R5", slot1: "1J", slot2: "2I", round: "R32", side: "right", pos: 4 },
  "R32-R6": { id: "R32-R6", slot1: "1L", slot2: "2K", round: "R32", side: "right", pos: 5 },
  "R32-R7": { id: "R32-R7", slot1: "2B", slot2: "1A*", round: "R32", side: "right", pos: 6 },
  "R32-R8": { id: "R32-R8", slot1: "2D", slot2: "1C", round: "R32", side: "right", pos: 7 },

  // LEFT HALF - Round of 16
  "R16-L1": { id: "R16-L1", from: ["R32-L1", "R32-L2"], round: "R16", side: "left", pos: 0 },
  "R16-L2": { id: "R16-L2", from: ["R32-L3", "R32-L4"], round: "R16", side: "left", pos: 1 },
  "R16-L3": { id: "R16-L3", from: ["R32-L5", "R32-L6"], round: "R16", side: "left", pos: 2 },
  "R16-L4": { id: "R16-L4", from: ["R32-L7", "R32-L8"], round: "R16", side: "left", pos: 3 },

  // RIGHT HALF - Round of 16
  "R16-R1": { id: "R16-R1", from: ["R32-R1", "R32-R2"], round: "R16", side: "right", pos: 0 },
  "R16-R2": { id: "R16-R2", from: ["R32-R3", "R32-R4"], round: "R16", side: "right", pos: 1 },
  "R16-R3": { id: "R16-R3", from: ["R32-R5", "R32-R6"], round: "R16", side: "right", pos: 2 },
  "R16-R4": { id: "R16-R4", from: ["R32-R7", "R32-R8"], round: "R16", side: "right", pos: 3 },

  // Quarter Finals
  "QF-L1": { id: "QF-L1", from: ["R16-L1", "R16-L2"], round: "QF", side: "left", pos: 0 },
  "QF-L2": { id: "QF-L2", from: ["R16-L3", "R16-L4"], round: "QF", side: "left", pos: 1 },
  "QF-R1": { id: "QF-R1", from: ["R16-R1", "R16-R2"], round: "QF", side: "right", pos: 0 },
  "QF-R2": { id: "QF-R2", from: ["R16-R3", "R16-R4"], round: "QF", side: "right", pos: 1 },

  // Semi Finals
  "SF-L": { id: "SF-L", from: ["QF-L1", "QF-L2"], round: "SF", side: "left", pos: 0 },
  "SF-R": { id: "SF-R", from: ["QF-R1", "QF-R2"], round: "SF", side: "right", pos: 0 },

  // Final
  "FINAL": { id: "FINAL", from: ["SF-L", "SF-R"], round: "FINAL", side: "center", pos: 0 },
};

const BRACKET_ROUNDS = [
  { key: "R32", label: "Round of 32", left: ["R32-L1","R32-L2","R32-L3","R32-L4","R32-L5","R32-L6","R32-L7","R32-L8"], right: ["R32-R1","R32-R2","R32-R3","R32-R4","R32-R5","R32-R6","R32-R7","R32-R8"] },
  { key: "R16", label: "Round of 16", left: ["R16-L1","R16-L2","R16-L3","R16-L4"], right: ["R16-R1","R16-R2","R16-R3","R16-R4"] },
  { key: "QF", label: "Quarter Finals", left: ["QF-L1","QF-L2"], right: ["QF-R1","QF-R2"] },
  { key: "SF", label: "Semi Finals", left: ["SF-L"], right: ["SF-R"] },
  { key: "FINAL", label: "Final", center: ["FINAL"] },
];
