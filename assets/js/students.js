/* =====================================================
   DEMO STUDENT DATA — School (Class 1 to 8)
   Demo template ke liye (no database). Real project mein
   ye data MySQL se aayega aur Student ID AUTO generate hoga.
   ===================================================== */

var DEMO_STUDENTS = [
  {
    id: 'STU-1001',
    name: 'Asad Javed',
    password: 'asad123',
    fatherName: 'Muhammad Javed',
    phone: '0301-2345678',
    email: 'asad.javed@gmail.com',
    address: 'Model Town, Lahore',
    cls: 6,
    section: 'A',
    batch: 'Session 2026',
    admission: '16 September 2026',
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Asad',
    attendance: { present: 21, total: 24, percent: 87.5, week: [1, 1, 1, 0, 1, 1, 1] },
    fee: { monthly: 2500, paid: 2500, remaining: 0, status: 'Paid', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 2500, date: '02 Sep 2026', method: 'Cash' },
      { month: 'August 2026', amount: 2500, date: '03 Aug 2026', method: 'Cash' },
      { month: 'July 2026', amount: 2500, date: '05 Jul 2026', method: 'Bank Transfer' },
      { month: 'June 2026', amount: 2500, date: '04 Jun 2026', method: 'Cash' }
    ],
    classInfo: { classTeacher: 'Ms. Ayesha Riaz', timing: 'Mon–Fri, 8:00 AM – 2:00 PM', duration: 'Academic Year 2026' }
  },
  {
    id: 'STU-1002',
    name: 'Ali Ahmed',
    password: 'ali123',
    fatherName: 'Muhammad Ahmed',
    phone: '0322-3344556',
    email: 'ali.ahmed@gmail.com',
    address: 'Gulberg, Lahore',
    cls: 5,
    section: 'B',
    batch: 'Session 2026',
    admission: '02 September 2026',
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Ali',
    attendance: { present: 22, total: 24, percent: 92, week: [1, 1, 1, 1, 1, 0, 1] },
    fee: { monthly: 2500, paid: 2500, remaining: 0, status: 'Paid', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 2500, date: '01 Sep 2026', method: 'Cash' },
      { month: 'August 2026', amount: 2500, date: '05 Aug 2026', method: 'JazzCash' },
      { month: 'July 2026', amount: 2500, date: '04 Jul 2026', method: 'Cash' }
    ],
    classInfo: { classTeacher: 'Mr. Faisal Mehmood', timing: 'Mon–Fri, 8:00 AM – 2:00 PM', duration: 'Academic Year 2026' }
  },
  {
    id: 'STU-1003',
    name: 'Hamza Khan',
    password: 'hamza123',
    fatherName: 'Imran Khan',
    phone: '0333-5566778',
    email: 'hamza.khan@gmail.com',
    address: 'Johar Town, Lahore',
    cls: 8,
    section: 'A',
    batch: 'Session 2026',
    admission: '20 August 2026',
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Hamza',
    attendance: { present: 13, total: 24, percent: 54, week: [1, 0, 0, 1, 1, 0, 0] },
    fee: { monthly: 3000, paid: 0, remaining: 3000, status: 'Unpaid', month: 'September 2026' },
    payments: [
      { month: 'August 2026', amount: 3000, date: '25 Aug 2026', method: 'Cash' }
    ],
    classInfo: { classTeacher: 'Sir Naveed Akram', timing: 'Mon–Fri, 8:00 AM – 2:00 PM', duration: 'Academic Year 2026' }
  },
  {
    id: 'STU-1004',
    name: 'Bilal Ahmed',
    password: 'bilal123',
    fatherName: 'Rashid Ahmed',
    phone: '0300-9988776',
    email: 'bilal.ahmed@gmail.com',
    address: 'DHA Phase 4, Lahore',
    cls: 6,
    section: 'A',
    batch: 'Session 2026',
    admission: '28 August 2026',
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Bilal',
    attendance: { present: 19, total: 24, percent: 78, week: [1, 1, 0, 1, 1, 1, 0] },
    fee: { monthly: 2500, paid: 2500, remaining: 0, status: 'Paid', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 2500, date: '15 Sep 2026', method: 'Cash' },
      { month: 'August 2026', amount: 2500, date: '01 Sep 2026', method: 'Easypaisa' }
    ],
    classInfo: { classTeacher: 'Ms. Ayesha Riaz', timing: 'Mon–Fri, 8:00 AM – 2:00 PM', duration: 'Academic Year 2026' }
  },
  {
    id: 'STU-1010',
    name: 'Fatima Noor',
    password: 'fatima123',
    fatherName: 'Khawar Noor',
    phone: '0345-6677889',
    email: 'fatima.noor@gmail.com',
    address: 'Cantt, Lahore',
    cls: 1,
    section: 'C',
    batch: 'Session 2026',
    admission: '14 September 2026',
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Fatima',
    attendance: { present: 6, total: 24, percent: 25, week: [1, 0, 0, 0, 0, 1, 0] },
    fee: { monthly: 2000, paid: 1000, remaining: 1000, status: 'Pending', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 1000, date: '12 Sep 2026', method: 'JazzCash' }
    ],
    classInfo: { classTeacher: 'Miss Saima Bibi', timing: 'Mon–Fri, 8:00 AM – 1:00 PM', duration: 'Academic Year 2026' }
  }
];

/* Current student selected in admin (profile/portal views) */
var CURRENT_STUDENT = DEMO_STUDENTS[0];

function clsLabel(s) {
  var num = s.cls || 0;
  var sec = s.section || '';
  return 'Class ' + num + (sec ? '-' + sec : '');
}

/* ---- Search helpers ---- */
function findStudentById(q) {
  var term = String(q).trim().toUpperCase();
  return DEMO_STUDENTS.find(function (s) {
    return s.id.toUpperCase() === term;
  });
}

function findStudents(query) {
  var term = String(query).trim().toLowerCase();
  if (!term) return DEMO_STUDENTS;
  return DEMO_STUDENTS.filter(function (s) {
    return (s.name.toLowerCase().indexOf(term) > -1) ||
           (s.id.toLowerCase().indexOf(term) > -1) ||
           (clsLabel(s).toLowerCase().indexOf(term) > -1) ||
           (String(s.cls || '').indexOf(term) > -1);
  });
}

/* ---- Auto ID generation: max suffix + 1 => STU-1011 ---- */
function nextStudentId() {
  var max = 1000;
  DEMO_STUDENTS.forEach(function (s) {
    var n = parseInt((s.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return 'STU-' + (max + 1);
}

/* ---- Register new student (demo, runtime only) ---- */
function registerNewStudent(data) {
  var stu = {
    id: nextStudentId(),
    name: data.name,
    password: String(data.name).replace(/\s+/g, '').toLowerCase() + '123',
    fatherName: data.fatherName,
    phone: data.phone,
    email: data.email,
    address: data.address,
    cls: data.cls,
    section: data.section,
    batch: 'Session 2026',
    admission: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    status: 'Active',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=' + encodeURIComponent(data.name),
    attendance: { present: 0, total: 0, percent: 0, week: [0, 0, 0, 0, 0, 0, 0] },
    fee: { monthly: 2500, paid: 0, remaining: 2500, status: 'Unpaid', month: 'September 2026' },
    payments: [],
    classInfo: { classTeacher: '—', timing: 'Mon–Fri, 8:00 AM – 2:00 PM', duration: 'Academic Year 2026' }
  };
  DEMO_STUDENTS.push(stu);
  CURRENT_STUDENT = stu;
  return stu;
}

/* ---- Student portal session ---- */
function findStudent(nameInput, passInput) {
  return DEMO_STUDENTS.find(function (s) {
    return s.name.toLowerCase() === String(nameInput).trim().toLowerCase() &&
           s.password === String(passInput);
  });
}

function getLoggedStudent() {
  try {
    var raw = localStorage.getItem('studenthub_student');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function setLoggedStudent(student) {
  localStorage.setItem('studenthub_student', JSON.stringify(student));
}

function clearLoggedStudent() {
  localStorage.removeItem('studenthub_student');
}