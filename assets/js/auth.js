/* =====================================================
   AUTH — Unified email + password login (role auto-detect)
   Admin, Teacher, Student sab ek hi form se login karte hain.
   Admin dashboard se naye users (teacher/student) add kar sakta hai.
   Demo mein localStorage (no backend). Real project mein Laravel auth.
   ===================================================== */

var ADMIN_USER = {
  id: 'ADM-001',
  role: 'admin',
  name: 'Admin',
  email: 'admin@studenthub.com',
  password: 'admin123',
  avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Admin'
};

/* ---------- Custom users (admin ne add kiye) ---------- */
function getCustomUsers() { return loadArr('sh_users', []) || []; }
function saveCustomUsers(u) { saveArr('sh_users', u); }

function customTeachers() { return getCustomUsers().filter(function (u) { return u.role === 'teacher'; }); }
function customStudents() { return getCustomUsers().filter(function (u) { return u.role === 'student'; }); }

function allTeachers() { return DEMO_TEACHERS.concat(customTeachers()); }
function allStudents() { return DEMO_STUDENTS.concat(customStudents()); }

/* ---------- Object factories ---------- */
function makeTeacher(data) {
  return {
    id: data.id,
    role: 'teacher',
    name: data.name,
    email: data.email,
    password: data.password,
    subject: data.subject || 'General',
    phone: data.phone || '-',
    classes: (data.classes && data.classes.length) ? data.classes : [{ cls: 6, section: 'A' }],
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=' + encodeURIComponent(data.name),
    status: 'Active'
  };
}

function makeStudent(data) {
  return {
    id: data.id,
    role: 'student',
    name: data.name,
    password: data.password,
    fatherName: data.fatherName || '-',
    phone: data.phone || '-',
    email: data.email,
    address: data.address || '-',
    cls: data.cls || 1,
    section: data.section || 'A',
    batch: 'Session 2026',
    admission: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=' + encodeURIComponent(data.name),
    attendance: { present: 0, total: 0, percent: 0, week: [0, 0, 0, 0, 0, 0, 0] },
    fee: { monthly: 2500, paid: 0, remaining: 2500, status: 'Unpaid', month: 'September 2026' },
    payments: [],
    classInfo: { classTeacher: '-', timing: 'Mon-Fri, 8:00 AM - 2:00 PM', duration: 'Academic Year 2026' }
  };
}

/* ---------- ID generation ---------- */
function nextUserId(role) {
  var max = 0;
  if (role === 'teacher') {
    allTeachers().forEach(function (u) { var n = parseInt((u.id || '').replace(/\D/g, ''), 10); if (n > max) max = n; });
    return 'TCH-' + String(max + 1).padStart(3, '0');
  }
  allStudents().forEach(function (u) { var n = parseInt((u.id || '').replace(/\D/g, ''), 10); if (n > max) max = n; });
  return 'STU-' + (max + 1);
}

function emailExists(email) {
  email = String(email || '').trim().toLowerCase();
  if (email === ADMIN_USER.email) return true;
  return allTeachers().concat(allStudents()).some(function (u) { return (u.email || '').toLowerCase() === email; });
}

/* ---------- Add user (admin) ---------- */
function addUser(data) {
  if (!data.name) return { error: 'Name zaroori hai' };
  if (!data.email) return { error: 'Email zaroori hai' };
  if (!data.password) return { error: 'Password zaroori hai' };
  if (emailExists(data.email)) return { error: 'Yeh email already maujood hai' };

  var id = nextUserId(data.role);
  var obj = data.role === 'teacher'
    ? makeTeacher({ id: id, name: data.name, email: data.email, password: data.password, subject: data.subject, classes: data.classes, phone: data.phone })
    : makeStudent({ id: id, name: data.name, email: data.email, password: data.password, cls: data.cls, section: data.section, phone: data.phone });

  var users = getCustomUsers();
  obj.custom = true;
  users.push(obj);
  saveCustomUsers(users);
  return { user: obj };
}

function deleteUser(id) {
  saveCustomUsers(getCustomUsers().filter(function (u) { return u.id !== id; }));
}

/* ---------- Authenticate ---------- */
function authenticate(email, pass) {
  email = String(email || '').trim().toLowerCase();
  pass = String(pass || '');

  if (email === ADMIN_USER.email && pass === ADMIN_USER.password) {
    return { role: 'admin', user: ADMIN_USER };
  }
  var t = allTeachers().find(function (x) { return (x.email || '').toLowerCase() === email && x.password === pass; });
  if (t) return { role: 'teacher', user: t };

  var s = allStudents().find(function (x) { return (x.email || '').toLowerCase() === email && x.password === pass; });
  if (s) return { role: 'student', user: s };

  return null;
}

/* ---------- Session ---------- */
function setSession(s) { localStorage.setItem('studenthub_session', JSON.stringify(s)); }

function getSession() {
  try { var r = localStorage.getItem('studenthub_session'); return r ? JSON.parse(r) : null; }
  catch (e) { return null; }
}

function clearSession() { localStorage.removeItem('studenthub_session'); }
