/* =====================================================
   DEMO STUDENT DATA — Demo template ke liye (no database)
   Real project mein ye data MySQL se aayega.
   ===================================================== */
const DEMO_STUDENTS = [
  {
    id: 'STU-1001',
    name: 'Asad Javed',
    password: 'asad123',
    fatherName: 'Muhammad Javed',
    phone: '0301-2345678',
    email: 'asad.javed@gmail.com',
    address: 'Model Town, Lahore',
    course: 'Web Development',
    batch: 'Batch 2026',
    admission: '16 September 2026',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Asad',
    attendance: { present: 21, total: 24, percent: 87.5, week: [1, 1, 1, 0, 1, 1, 1] },
    fee: { monthly: 5000, paid: 5000, remaining: 0, status: 'Paid', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 5000, date: '02 Sep 2026', method: 'Cash' },
      { month: 'August 2026', amount: 5000, date: '03 Aug 2026', method: 'Cash' },
      { month: 'July 2026', amount: 5000, date: '05 Jul 2026', method: 'Bank Transfer' },
      { month: 'June 2026', amount: 5000, date: '04 Jun 2026', method: 'Cash' }
    ],
    courseInfo: { timing: 'Mon–Fri, 6:00–8:00 PM', teacher: 'Sir Ahmed Raza', duration: '6 Months' }
  },
  {
    id: 'STU-1002',
    name: 'Ali Ahmed',
    password: 'ali123',
    fatherName: 'Muhammad Ahmed',
    phone: '0322-3344556',
    email: 'ali.ahmed@gmail.com',
    address: 'Gulberg, Lahore',
    course: 'Graphic Design',
    batch: 'Batch 2026',
    admission: '02 September 2026',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Ali',
    attendance: { present: 22, total: 24, percent: 92, week: [1, 1, 1, 1, 1, 0, 1] },
    fee: { monthly: 6000, paid: 6000, remaining: 0, status: 'Paid', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 6000, date: '01 Sep 2026', method: 'Cash' },
      { month: 'August 2026', amount: 6000, date: '05 Aug 2026', method: 'JazzCash' },
      { month: 'July 2026', amount: 6000, date: '04 Jul 2026', method: 'Cash' }
    ],
    courseInfo: { timing: 'Mon & Wed, 4:00–6:00 PM', teacher: 'Miss Sara Anwar', duration: '4 Months' }
  },
  {
    id: 'STU-1003',
    name: 'Hamza Khan',
    password: 'hamza123',
    fatherName: 'Imran Khan',
    phone: '0333-5566778',
    email: 'hamza.khan@gmail.com',
    address: 'Johar Town, Lahore',
    course: 'Digital Marketing',
    batch: 'Batch 2026',
    admission: '20 August 2026',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Hamza',
    attendance: { present: 13, total: 24, percent: 54, week: [1, 0, 0, 1, 1, 0, 0] },
    fee: { monthly: 4500, paid: 0, remaining: 4500, status: 'Unpaid', month: 'September 2026' },
    payments: [
      { month: 'August 2026', amount: 4500, date: '25 Aug 2026', method: 'Cash' }
    ],
    courseInfo: { timing: 'Tue & Thu, 6:00–8:00 PM', teacher: 'Sir Fahad Malik', duration: '3 Months' }
  },
  {
    id: 'STU-1004',
    name: 'Bilal Ahmed',
    password: 'bilal123',
    fatherName: 'Rashid Ahmed',
    phone: '0300-9988776',
    email: 'bilal.ahmed@gmail.com',
    address: 'DHA Phase 4, Lahore',
    course: 'Web Development',
    batch: 'Batch 2026',
    admission: '28 August 2026',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Bilal',
    attendance: { present: 19, total: 24, percent: 78, week: [1, 1, 0, 1, 1, 1, 0] },
    fee: { monthly: 5000, paid: 5000, remaining: 0, status: 'Paid', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 5000, date: '15 Sep 2026', method: 'Cash' },
      { month: 'August 2026', amount: 5000, date: '01 Sep 2026', method: 'Easypaisa' }
    ],
    courseInfo: { timing: 'Mon–Fri, 6:00–8:00 PM', teacher: 'Sir Ahmed Raza', duration: '6 Months' }
  },
  {
    id: 'STU-1010',
    name: 'Fatima Noor',
    password: 'fatima123',
    fatherName: 'Khawar Noor',
    phone: '0345-6677889',
    email: 'fatima.noor@gmail.com',
    address: 'Cantt, Lahore',
    course: 'Web Development',
    batch: 'Batch 2026',
    admission: '14 September 2026',
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Fatima',
    attendance: { present: 6, total: 24, percent: 25, week: [1, 0, 0, 0, 0, 1, 0] },
    fee: { monthly: 5000, paid: 3000, remaining: 2000, status: 'Pending', month: 'September 2026' },
    payments: [
      { month: 'September 2026', amount: 3000, date: '12 Sep 2026', method: 'JazzCash' }
    ],
    courseInfo: { timing: 'Mon–Fri, 6:00–8:00 PM', teacher: 'Sir Ahmed Raza', duration: '6 Months' }
  }
];

function findStudent(nameInput, passInput) {
  return DEMO_STUDENTS.find(s =>
    s.name.toLowerCase() === String(nameInput).trim().toLowerCase() &&
    s.password === String(passInput)
  );
}

function getLoggedStudent() {
  try {
    const raw = localStorage.getItem('studenthub_student');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLoggedStudent(student) {
  localStorage.setItem('studenthub_student', JSON.stringify(student));
}

function clearLoggedStudent() {
  localStorage.removeItem('studenthub_student');
}