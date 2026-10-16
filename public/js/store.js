const ROADWORTHY_VALID_DAYS = 60;

const CHECKLIST_LABELS = {
  headlights: "Headlights and taillights",
  brakes: "Brakes",
  horn: "Horn",
  mirrors: "Side mirrors",
  tires: "Tires",
  muffler: "Muffler / exhaust noise",
  plateVisible: "Number plate visibility",
  sidecar: "Sidecar frame and seating",
};

const SEED_USERS = [
  {
    username: "rico.manalo", password: "demo1234", fullName: "Rico Manalo",
    role: "driver", joinDate: "2025-09-10",
    tricycle: {
      id: "BT-0001", plateNumber: "TRC-1234", tricycleModel: "Honda TMX 155",
      address: "123 Rizal St., Caloocan City", contactNumber: "0917-123-4567",
      registeredDate: "2025-09-10", expiryDate: "2026-09-10",
      roadworthy: true, lastInspectionDate: "2025-09-10",
    },
  },
  {
    username: "elena.cruz", password: "demo1234", fullName: "Elena Cruz",
    role: "driver", joinDate: "2024-06-01",
    tricycle: {
      id: "BT-0002", plateNumber: "TRC-5678", tricycleModel: "Kawasaki Bajaj",
      address: "45 Bonifacio Ave., Quezon City", contactNumber: "0918-765-4321",
      registeredDate: "2024-06-01", expiryDate: "2025-06-01",
      roadworthy: false, lastInspectionDate: "2024-06-01",
    },
  },

  { username: "demo", password: "demo", fullName: "Demo Driver", role: "driver", joinDate: "2026-09-01", tricycle: null },

  { username: "admin", password: "admin123", fullName: "System Admin", role: "admin", joinDate: "2026-01-01", tricycle: null },
];
















const KEYS = { users: "bantrike-users", session: "bantrike-session", adminLog: "bantrike-admin-log" };

function readList(key, seed) {
  const raw = localStorage.getItem(key);
  if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return JSON.parse(JSON.stringify(seed)); }
  return JSON.parse(raw);
}
function writeList(key, list) { localStorage.setItem(key, JSON.stringify(list)); }

function getSession() { return localStorage.getItem(KEYS.session); }
function setSession(username) { localStorage.setItem(KEYS.session, username); }
function clearSession() { localStorage.removeItem(KEYS.session); }

function requireAuth() {
  const username = getSession();
  if (!username) { window.location.href = "index.html"; throw new Error("Not logged in."); }
  return username;
}

function requireAdmin() {
  const username = requireAuth();
  const user = findUser(username);
  if (!user || user.role !== "admin") { window.location.href = "dashboard.html"; throw new Error("Not an admin."); }
  return username;
}

function paintNavUser() {
  const el = document.getElementById("nav-username");
  if (el) { const u = findUser(getSession()); if (u) el.textContent = u.fullName.split(" ")[0]; }

  const slot = document.getElementById("admin-nav-slot");
  if (slot) {
    const u = findUser(getSession());
    if (u && u.role === "admin") slot.innerHTML = `<a href="admin.html">Admin</a>`;
  }
}

function todayString() { return new Date().toISOString().split("T")[0]; }

function oneYearFrom(dateString) {
  const d = new Date(dateString);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

function daysSince(dateString) {
  if (!dateString) return Infinity;
  const ms = new Date(todayString()) - new Date(dateString);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function tricycleStatus(tricycle) {
  return tricycle.expiryDate < todayString() ? "expired" : "active";
}


function isRoadworthyValid(tricycle) {
  return tricycle.roadworthy === true && daysSince(tricycle.lastInspectionDate) <= ROADWORTHY_VALID_DAYS;
}

function getUsers() { return readList(KEYS.users, SEED_USERS); }
function saveUsers(users) { writeList(KEYS.users, users); }
function findUser(username) {
  if (!username) return null;
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

function createUser({ username, fullName, password }) {
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return null;
  const user = { username, fullName, password, role: "driver", joinDate: todayString(), tricycle: null };
  users.push(user);
  saveUsers(users);
  return user;
}

function nextTricycleId() {
  const count = getUsers().filter(u => u.tricycle).length;
  return "BT-" + String(count + 1).padStart(4, "0");
}

function registerTricycle(username, fields) {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user) return { error: "Account not found." };
  if (user.tricycle) return { error: "You already have a registered unit." };

  const tricycle = {
    id: nextTricycleId(),
    plateNumber: fields.plateNumber,
    tricycleModel: fields.tricycleModel || "",
    address: fields.address || "",
    contactNumber: fields.contactNumber,
    registeredDate: todayString(),
    expiryDate: oneYearFrom(todayString()),
    roadworthy: null,
    lastInspectionDate: null,
  };
  user.tricycle = tricycle;
  saveUsers(users);
  return { tricycle };
}


function recordRoadworthyCheck(username, checklist) {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user || !user.tricycle) return null;

  const failedItems = Object.keys(checklist).filter(k => !checklist[k]);
  const passed = failedItems.length === 0;

  user.tricycle.roadworthy = passed;
  user.tricycle.lastInspectionDate = todayString();
  saveUsers(users);
  return { passed, failedItems, tricycle: user.tricycle };
}


function renewTricycle(username) {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user || !user.tricycle) return { error: "No registered unit found." };
  if (!isRoadworthyValid(user.tricycle)) {
    return { error: "A passing roadworthiness check (within the last " + ROADWORTHY_VALID_DAYS + " days) is required before you can renew." };
  }
  const base = user.tricycle.expiryDate > todayString() ? user.tricycle.expiryDate : todayString();
  user.tricycle.expiryDate = oneYearFrom(base);
  saveUsers(users);
  return { tricycle: user.tricycle };
}


function getAllTricycles() {
  return getUsers()
    .filter(u => u.tricycle)
    .map(u => ({ owner: u.username, ownerName: u.fullName, ...u.tricycle }));
}

function logAdminAction(adminUsername, action) {
  const log = readList(KEYS.adminLog, []);
  log.unshift({ admin: adminUsername, action, date: todayString() });
  writeList(KEYS.adminLog, log.slice(0, 100));
}
function getAdminLog() { return readList(KEYS.adminLog, []); }



function flagForReinspection(adminUsername, targetUsername) {
  const users = getUsers();
  const user = users.find(u => u.username === targetUsername);
  if (!user || !user.tricycle) return;
  user.tricycle.roadworthy = null;
  saveUsers(users);
  logAdminAction(adminUsername, `Flagged ${user.tricycle.id} (${user.fullName}) for re-inspection`);
}
