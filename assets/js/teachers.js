/* =====================================================
   TEACHER DATA + MESSAGES (demo - localStorage)
   Admin -> Teachers / Students messaging
   Teacher -> apne subject ka test upload
   Real project mein ye MySQL se aayega.
   ===================================================== */

var DEMO_TEACHERS = [
  {
    id: 'TCH-001',
    name: 'Sir Naveed Akram',
    email: 'naveed@studenthub.com',
    password: 'naveed123',
    subject: 'Mathematics',
    phone: '0300-1122334',
    classes: [{ cls: 6, section: 'A' }, { cls: 5, section: 'B' }, { cls: 8, section: 'A' }],
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Naveed',
    status: 'Active'
  },
  {
    id: 'TCH-002',
    name: 'Ms. Ayesha Riaz',
    email: 'ayesha@studenthub.com',
    password: 'ayesha123',
    subject: 'English',
    phone: '0301-5566778',
    classes: [{ cls: 6, section: 'A' }, { cls: 5, section: 'A' }, { cls: 1, section: 'C' }],
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Ayesha',
    status: 'Active'
  },
  {
    id: 'TCH-003',
    name: 'Mr. Faisal Mehmood',
    email: 'faisal@studenthub.com',
    password: 'faisal123',
    subject: 'Science',
    phone: '0322-9988776',
    classes: [{ cls: 5, section: 'B' }, { cls: 8, section: 'A' }],
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Faisal',
    status: 'Active'
  },
  {
    id: 'TCH-004',
    name: 'Miss Saima Bibi',
    email: 'saima@studenthub.com',
    password: 'saima123',
    subject: 'Islamiat',
    phone: '0345-2233445',
    classes: [{ cls: 6, section: 'A' }, { cls: 1, section: 'C' }],
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Saima',
    status: 'Active'
  }
];

/* ---------- Teacher session ---------- */
function setLoggedTeacher(t) { localStorage.setItem('studenthub_teacher', JSON.stringify(t)); }

function getLoggedTeacher() {
  try {
    var raw = localStorage.getItem('studenthub_teacher');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearLoggedTeacher() { localStorage.removeItem('studenthub_teacher'); }

function findTeacher(nameInput, passInput) {
  return DEMO_TEACHERS.find(function (t) {
    return t.name.toLowerCase() === String(nameInput).trim().toLowerCase() &&
           t.password === String(passInput);
  });
}

function findTeacherById(id) {
  var all = (typeof allTeachers === 'function') ? allTeachers() : DEMO_TEACHERS;
  return all.find(function (t) { return t.id === id; }) || null;
}

function teacherClassesLabel(t) {
  if (!t || !t.classes || !t.classes.length) return '-';
  return t.classes.map(function (c) { return 'Class ' + c.cls + '-' + c.section; }).join(', ');
}

/* ---------- MESSAGES (Admin -> Teachers / Students) ---------- */
/* toRole: 'teachers' | 'students' | 'both'
   toClass: optional { cls, section } - agar sirf ek class ko bhejna ho */

function seedMessages() {
  return [
    {
      id: 'MSG-1',
      from: 'Admin',
      toRole: 'both',
      toClass: null,
      subject: 'Staff Meeting Friday',
      body: 'Friday 2:00 PM sab staff members ki meeting hai - conference room mein attend karein.',
      at: '15 Sep 2026, 09:30 AM',
      seenBy: []
    },
    {
      id: 'MSG-2',
      from: 'Admin',
      toRole: 'students',
      toClass: null,
      subject: 'Fee Submission Reminder',
      body: 'September ki fee jald jama karein - warning 75% se kam attendance wale students ki parent meeting bhi hogi.',
      at: '16 Sep 2026, 10:15 AM',
      seenBy: []
    }
  ];
}

function getMessages() { return loadArr('sh_messages', null) || seedMessages(); }
function saveMessages() { saveArr('sh_messages', getMessages()); }

function sendMessage(data) {
  var all = getMessages();
  var msg = {
    id: 'MSG-' + (all.length + 101),
    from: 'Admin',
    toRole: data.toRole,           /* 'teachers' | 'students' | 'both' */
    toClass: data.toClass || null, /* optional specific class */
    subject: data.subject,
    body: data.body,
    at: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    seenBy: []
  };
  all.unshift(msg);
  saveMessages();
  return msg;
}

/* role: 'teacher' | 'student' - us role ke liye aaye messages */
function messagesForRole(role, classInfo) {
  return getMessages().filter(function (m) {
    if (m.toRole !== role && m.toRole !== 'both') return false;
    if (m.toClass && classInfo) {
      if (+m.toClass.cls !== +classInfo.cls || m.toClass.section !== classInfo.section) return false;
    }
    return true;
  });
}

function markMessageSeen(msgId, readerId) {
  var all = getMessages();
  var m = all.find(function (x) { return x.id === msgId; });
  if (!m) return;
  if (!m.seenBy) m.seenBy = [];
  if (m.seenBy.indexOf(readerId) === -1) m.seenBy.push(readerId);
  saveMessages();
}
