/* ============ VIEW SWITCHING ============ */
function logout() {
  clearSession();
  clearLoggedStudent();
  clearLoggedTeacher();
  window.location.href = 'index.html';
}

const viewTitles = {
  dashboard: ['Dashboard', 'School overview — Wednesday, 16 September 2026'],
  students: ['Students', 'Class 1 to 8 • manage records'],
  scanner: ['QR Scanner', 'Scan karne par attendance automatic mark'],
  attendance: ['Attendance', 'Daily & monthly attendance records'],
  fees: ['Fee Management', 'September 2026 • monthly fees & payments'],
  tests: ['Test Plan', 'Weekly & monthly tests — alert bharday jate hain'],
  marks: ['Marks', 'Test results enter karke students ke paas bhejein'],
  admissions: ['Admissions', 'Online requests — ID & password auto generated'],
  messages: ['Messages', 'Teachers aur Students dono ko message bhejein'],
  exams: ['Exams & Exam Fee', 'Exam ka month aur alag fee — students ko WhatsApp/SMS'],
  books: ['Books', 'Class-wise books upload karein'],
  profile: ['Student Profile', 'ID se student search karke dekhein'],
  reports: ['Reports', 'Attendance, fees & backups'],
  portal: ['Student Portal', 'Student ka apna view (preview)']
};

function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link-item[data-view]').forEach(n => n.classList.toggle('active', n.dataset.view === view));

  const t = viewTitles[view];
  if (t) {
    document.getElementById('pageTitle').textContent = t[0];
    document.getElementById('pageSub').textContent = t[1];
  }

  /* render dynamic views from current student */
  if (view === 'profile') renderProfileView(CURRENT_STUDENT);
  if (view === 'portal') renderPortalView(CURRENT_STUDENT);
  if (view === 'tests') renderTestsTable();
  if (view === 'marks') { fillTestsSelect(true); renderMarksTable(); }
  if (view === 'admissions') { fillStuForms(); renderAdmissions(); }
  if (view === 'attendance') renderAttendance();
  if (view === 'messages') renderAdminMessages();
  if (view === 'exams') renderExams();
  if (view === 'books') { renderBooks(); loadBookTemplate(); }
  if (view === 'fees') renderFeeTable();
  updateAdmissionBadge();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link-item[data-view]').forEach(item => {
  item.addEventListener('click', () => switchView(item.dataset.view));
});

function toggleSidebar(open) {
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('overlay').classList.toggle('show', open);
}

function selStudent() { return CURRENT_STUDENT; }
function printQR() { printIdCard(CURRENT_STUDENT); }

/* ============ ANIMATED COUNTERS ============ */
function animateCounter(el) {
  const target = +el.dataset.target;
  const dur = 1200;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    const val = Math.floor(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = val.toLocaleString('en-PK');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
document.querySelectorAll('.counter').forEach(el => {
  animateCounter(el);
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.disconnect(); } });
  }, { threshold: .5 }).observe(el);
});

/* ============ STUDENTS TABLE (dynamic) ============ */
let activeQuery = '';
function buildStudentsTable() {
  const tbody = document.getElementById('stuTableBody');
  if (!tbody) return;
  const rows = findStudents(activeQuery);
  tbody.innerHTML = '';

  rows.forEach(s => {
    const cl = clsLabel(s);
    const pct = s.attendance.percent;
    const barCls = pct >= 75 ? 'bg-grad-success' : pct >= 50 ? 'bg-grad-warning' : 'bg-grad-danger';
    const stCls = s.status === 'Active' ? 'bg-soft-success' : 'bg-soft-danger';

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td><div class="stu-cell"><img class="avatar-sm" src="' + s.avatar + '" alt=""/>' +
        '<div><b>' + s.name + '</b><span>' + s.phone + '</span></div></div></td>' +
      '<td class="fw-600">' + s.id + '</td>' +
      '<td>' + cl + '</td>' +
      '<td>' + s.phone + '</td>' +
      '<td>' + s.admission + '</td>' +
      '<td><div class="d-flex align-items-center gap-2"><div class="progress-soft flex-grow-1" style="width:70px;">' +
        '<div class="progress-bar ' + barCls + '" style="width:' + pct + '%;"></div></div>' +
        '<span class="fw-600" style="font-size:12.5px;">' + pct + '%</span></div></td>' +
      '<td><span class="badge-soft ' + stCls + '">' + s.status + '</span></td>' +
      '<td>' +
        '<button class="mini-btn btn-icon-accent view-student" data-id="' + s.id + '" title="View"><i class="fa-solid fa-eye"></i></button>' +
        '<button class="mini-btn btn-icon-success" onclick="showQR(\'' + s.id + '\',\'' + s.name + '\')" title="QR"><i class="fa-solid fa-qrcode"></i></button>' +
        '<button class="mini-btn btn-icon-warning" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
        '<button class="mini-btn btn-icon-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
      '</td>';
    tbody.appendChild(tr);
  });

  const count = document.getElementById('stuCount');
  if (count) count.textContent = rows.length;

  /* bind view-student buttons */
  tbody.querySelectorAll('.view-student').forEach(btn => {
    btn.addEventListener('click', () => openStudent(btn.dataset.id));
  });
}

function filterStudents() {
  activeQuery = document.getElementById('stuSearch').value;
  buildStudentsTable();
}

/* ============ SEARCH BY ID (global) ============ */
function doGlobalSearch() {
  const q = document.getElementById('globalSearch').value.trim();
  if (!q) { toast('info', 'Search karein', 'Student ID ya naam likhein — e.g. STU-1004'); return; }

  let stu = findStudentById(q) || findStudents(q)[0];
  if (stu) {
    CURRENT_STUDENT = stu;
    renderProfileView(stu);
    switchView('profile');
    toast('success', 'Student Found', stu.name + ' • ' + stu.id + ' • ' + clsLabel(stu));
  } else {
    toast('error', 'Student Not Found', '\u201C' + q + '\u201D ka koi record nahi mila');
  }
}

function openStudent(id) {
  const stu = findStudentById(id);
  if (!stu) return;
  CURRENT_STUDENT = stu;
  renderProfileView(stu);
  switchView('profile');
}

/* ============ PROFILE VIEW RENDER ============ */
function renderProfileView(s) {
  if (!s) return;
  const cl = clsLabel(s);
  const a = s.attendance;
  const f = s.fee;
  const get = id => document.getElementById(id);

  if (get('pAvatar'))  get('pAvatar').src = s.avatar;
  if (get('pName'))    get('pName').textContent = s.name;
  if (get('pClass'))   get('pClass').textContent = cl;
  if (get('pQR'))      get('pQR').src = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=' + s.id;
  if (get('pID'))      get('pID').textContent = s.id;
  if (get('pJoin'))    get('pJoin').textContent = s.admission;
  if (get('pFullName'))get('pFullName').textContent = s.name;
  if (get('pFather'))  get('pFather').textContent = s.fatherName;
  if (get('pPhone'))   get('pPhone').textContent = s.phone;
  if (get('pEmail'))   get('pEmail').textContent = s.email || '—';
  if (get('pClsSec'))  get('pClsSec').textContent = cl;
  if (get('pAdmission')) get('pAdmission').textContent = s.admission;

  if (get('pAttDetail')) get('pAttDetail').textContent = a.present + ' / ' + a.total + ' school days';
  if (get('pAttPct'))  get('pAttPct').textContent = a.percent + '%';
  if (get('pAttBar'))  get('pAttBar').style.width = a.percent + '%';

  if (get('pFeeMonthly')) get('pFeeMonthly').textContent = 'Rs. ' + f.monthly.toLocaleString();
  if (get('pFeePaid'))    get('pFeePaid').textContent = 'Rs. ' + f.paid.toLocaleString();
  if (get('pFeeRemaining')) get('pFeeRemaining').textContent = 'Rs. ' + f.remaining.toLocaleString();
  if (get('pFeeBox')) {
    get('pFeeBox').className = 'rounded-3 p-2 ' + (f.status === 'Paid' ? 'bg-soft-success' : 'bg-soft-warning');
    get('pFeeRemaining').className = 'fs-6 ' + (f.status === 'Paid' ? 'text-success' : 'text-warning');
  }

  /* attendance side widget */
  if (get('attStuName')) get('attStuName').textContent = s.name + ' (' + s.id + ')';
  if (get('attRecPct')) get('attRecPct').textContent = a.percent + '%';
  if (get('attRecBar')) get('attRecBar').style.width = a.percent + '%';
}

/* ============ PORTAL VIEW RENDER (admin preview) ============ */
function renderPortalView(s) {
  if (!s) return;
  const cl = clsLabel(s);
  const a = s.attendance;
  const f = s.fee;
  const ci = s.classInfo;
  const get = id => document.getElementById(id);

  if (get('ptAvatar')) get('ptAvatar').src = s.avatar;
  if (get('ptName'))   get('ptName').textContent = s.name;
  if (get('ptId'))     get('ptId').textContent = s.id;
  if (get('ptCls'))    get('ptCls').textContent = cl + ' • ' + s.batch;
  if (get('ptQR'))     get('ptQR').src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + s.id;
  if (get('ptAtt'))    get('ptAtt').textContent = a.percent + '%';
  if (get('ptFee'))    get('ptFee').textContent = feeLabel(f.status);
  if (get('ptFee'))    get('ptFee').style.color = f.status === 'Paid' ? '#047857' : f.status === 'Pending' ? '#b45309' : '#be123c';
  if (get('ptCourse')) get('ptCourse').textContent = cl;
  if (get('ptFeeAmt')) get('ptFeeAmt').textContent = 'Rs. ' + f.paid.toLocaleString();
  if (get('ptClsInfo'))get('ptClsInfo').textContent = cl;
  if (get('ptTeacher'))get('ptTeacher').textContent = ci.classTeacher;
  if (get('ptTiming')) get('ptTiming').textContent = ci.timing;
  if (get('ptDur'))    get('ptDur').textContent = ci.duration;

  const pay = document.getElementById('ptPayments');
  if (pay) {
    pay.innerHTML = '';
    if (s.payments.length === 0) {
      pay.innerHTML = '<div class="muted" style="font-size:13px;">Abhi koi payment nahi hui.</div>';
    }
    s.payments.forEach(p => {
      const div = document.createElement('div');
      div.className = 'timeline-item success';
      div.innerHTML = '<b style="font-size:13.5px;">' + p.month + ' — Paid</b>' +
        '<div class="muted" style="font-size:12.5px;">Rs. ' + p.amount.toLocaleString() + ' • ' + p.date + ' • ' + p.method + '</div>';
      pay.appendChild(div);
    });
  }

  renderPreviewLine(a.week);
}

/* ============ AUTO STUDENT ID (Add modal) ============ */
function updateNextId() {
  const el = document.getElementById('newStuId');
  if (el) el.textContent = nextStudentId();
}

function registerStudent() {
  const data = {
    name: (document.getElementById('nsName') || {}).value,
    fatherName: (document.getElementById('nsFather') || {}).value,
    phone: (document.getElementById('nsPhone') || {}).value,
    email: '', fee: +(document.getElementById('nsFee') || {}).value, stream: (document.getElementById('nsType') || {}).value || 'school', madarsaSection: (document.getElementById('nsMSec') || {}).value || 'A',
    address: (document.getElementById('nsAddress') || {}).value,
    cls: parseInt((document.getElementById('nsClass') || {}).value || '6', 10),
    section: ''
  };

  if (!data.name) {
    Swal.fire({
      icon: 'error',
      title: 'Name Required',
      text: 'Student ka full name likhein',
      confirmButtonText: 'OK',
      customClass: { popup: 'sh-swal', confirmButton: 'sh-swal-confirm' },
      buttonsStyling: false
    });
    return;
  }

  const stu = registerNewStudent(data);
  buildStudentsTable();
  updateNextId();
  renderProfileView(stu);
  switchView('profile');

  ['nsName','nsFather','nsPhone','nsEmail','nsAddress'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  Swal.fire({
    icon: 'success',
    title: 'Student Registered! ✦',
    html: '<b>' + stu.name + '</b> has been added.<br/>ID: <b>' + stu.id + '</b> — QR code auto-generated.',
    confirmButtonText: 'View Profile',
    customClass: { popup: 'sh-swal', confirmButton: 'sh-swal-confirm' },
    buttonsStyling: false
  });
}

/* ============ CHARTS ============ */
const gridColor = 'rgba(148,163,184,.15)';
Chart.defaults.font.family = "'Poppins', sans-serif";

function chartBar(ctxId, delay) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{
        label: 'Present',
        data: [198, 205, 210, 190, 215],
        backgroundColor: 'rgba(13,148,136,.85)',
        borderRadius: 8, barThickness: 22
      }, {
        label: 'Absent',
        data: [52, 45, 40, 60, 35],
        backgroundColor: 'rgba(244,63,94,.75)',
        borderRadius: 8, barThickness: 22
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { delay: delay || 0 },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 18 } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 12 } } },
        y: { grid: { color: gridColor }, border: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

function chartDoughnut(ctxId) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Paid (Rs. 450,000)', 'Pending (Rs. 85,000)'],
      datasets: [{ data: [84, 16], backgroundColor: ['#10b981', '#f59e0b'], borderWidth: 0, hoverOffset: 10 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { display: false } }
    }
  });
}

function chartReportBar(ctxId) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{ label: 'Attendance %', data: [88, 79, 92, 83],
        backgroundColor: ['#0d9488', '#f59e0b', '#10b981', '#0ea5e9'], borderRadius: 10, barThickness: 30 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: gridColor }, border: { display: false }, max: 100, ticks: { callback: v => v + '%' } }
      }
    }
  });
}

function chartReportDoughnut(ctxId) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Class 1-4', 'Class 5-6', 'Class 7-8'],
      datasets: [{ data: [60, 115, 75], backgroundColor: ['#0d9488', '#10b981', '#f59e0b'],
        borderWidth: 3, borderColor: '#fff', hoverOffset: 12 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 11 } } } }
    }
  });
}

let previewChart = null;
function renderPreviewLine(week) {
  const ctx = document.getElementById('stuLine');
  if (!ctx) return;
  if (previewChart) previewChart.destroy();
  previewChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ label: 'Attendance', data: week, borderColor: '#0d9488',
        backgroundColor: 'rgba(13,148,136,.12)', fill: true, tension: .4,
        pointRadius: 4, pointBackgroundColor: '#0d9488', borderWidth: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: gridColor }, border: { display: false }, min: 0, max: 1.2,
             ticks: { stepSize: 1, callback: v => v === 1 ? 'Present' : v === 0 ? 'Absent' : '' } }
      }
    }
  });
}

window.addEventListener('load', () => {
  chartBar('attChart', 250);
  chartDoughnut('feeChart');
  chartReportBar('repBar');
  chartReportDoughnut('repDoughnut');
  buildStudentsTable();
  renderProfileView(CURRENT_STUDENT);
  renderPortalView(CURRENT_STUDENT);
  initTestForm();
  renderTestsTable();
  fillTestsSelect(false);
  renderAdmissions();
  updateAdmissionBadge();
  renderAdminMessages();
  renderFeeTable();
  renderExams();
  renderBooks();
  renderAttLog();
  fillStuForms();
});

/* ============ QR SCANNER ============ */
let scanning = false;
function startScan(btn) {
  const stage = document.getElementById('scannerStage');
  if (!scanning) {
    scanning = true;
    stage.classList.add('scanning');
    btn.innerHTML = '<i class="fa-solid fa-square me-1"></i> Stop Scanner';
    toast('info', 'Camera Scanner On', 'Student QR ko frame ke andar rakhein');
  } else {
    scanning = false;
    stage.classList.remove('scanning');
    btn.innerHTML = '<i class="fa-solid fa-video me-1"></i> Start Scanner';
  }
}

function simulateScan() { simulate(); }

function simulate() {
  const stage = document.getElementById('scannerStage');
  if (!scanning) {
    stage.classList.add('scanning');
    setTimeout(() => { stage.classList.remove('scanning'); result(); }, 1600);
  } else {
    stage.classList.remove('scanning');
    result();
  }
  scanning = false;
  const btn = document.querySelector('#view-scanner .btn-grad');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-video me-1"></i> Start Scanner';
}

function result() {
  const ok = Math.random() > 0.18;
  const s = DEMO_STUDENTS[Math.floor(Math.random() * 3)];
  if (ok) {
    toast('success', 'Attendance Marked ✓', s.name + ' (' + s.id + ') — ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    addLogRow(s.name, s.id, s.avatar, 'Present');
  } else {
    toast('error', 'Duplicate Attendance', s.name + ' ki attendance aaj pehle se lagi hui hai');
  }
}

function addLogRow(name, id, seed, status) {
  const log = document.querySelector('#scanResultCard .scan-log');
  if (!log) return;
  const div = document.createElement('div');
  div.className = 'd-flex justify-content-between align-items-center border-bottom py-2 anim-fade-up';
  div.style.borderColor = '#f1f5f9!important';
  div.innerHTML =
    '<div class="stu-cell"><img class="avatar-sm" src="' + seed + '" alt=""/><div><b style="font-size:13.5px;">' + name + '</b><span>' + id + '</span></div></div>' +
    '<span class="badge-soft bg-soft-success">' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '</span>';
  log.prepend(div);
}

/* ============ QR MODAL ============ */
function showQR(id, name) {
  window._qrId = id;
  document.getElementById('qrTitle').textContent = id + ' • ' + name;
  document.getElementById('qrSub').textContent = name + ' ka unique QR Code — attendance scan ke liye';
  document.getElementById('qrImage').src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + id;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('qrModal')).show();
}

/* ============ TOASTS ============ */
function toast(type, title, msg) {
  const wrap = document.getElementById('toastWrap');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = 'toast-msg ' + type;
  el.innerHTML =
    '<div class="toast-ic"><i class="fa-solid ' + icons[type] + '"></i></div>' +
    '<div class="toast-txt"><b>' + title + '</b><span>' + msg + '</span></div>';
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = '.4s'; setTimeout(() => el.remove(), 400); }, 3200);
}

/* ============ FILTER CHIPS ============ */
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.parentElement;
    group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

/* ============ TEST PLAN (weekly / monthly) ============ */
let testsFilter = 'All';
let testType = 'Weekly';
let editingTestId = null;

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function initTestForm() {
  const sel = document.getElementById('tClass');
  if (sel) {
    for (let i = 1; i <= 8; i++) sel.insertAdjacentHTML('beforeend', '<option value="' + i + '">Class ' + i + '</option>');
  }
  const d = document.getElementById('tDate');
  if (d) d.value = new Date().toISOString().slice(0, 10);
  setTestType('Weekly');
}

function setTestType(t) {
  testType = t;
  const w = document.getElementById('typeWeekly');
  const m = document.getElementById('typeMonthly');
  if (w && m) {
    const act = 'active';
    [w, m].forEach(b => b.classList.remove(act));
    (t === 'Weekly' ? w : m).classList.add(act);
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-t]');
  if (b) setTestType(b.dataset.t);
});

function createTest() {
  const cls = +document.getElementById('tClass').value;
  const section = document.getElementById('tSection').value;
  const subject = document.getElementById('tSubject').value.trim();
  const date = document.getElementById('tDate').value;
  const time = document.getElementById('tTime').value;
  const totalMarks = +document.getElementById('tTotal').value;

  if (!subject) { toast('error', 'Subject required', 'Test ka subject/name likhein'); return; }
  if (!date) { toast('error', 'Date required', 'Test ki date select karein'); return; }
  if (!totalMarks || totalMarks < 1) { toast('error', 'Invalid marks', 'Total marks 1 se zyada hona chahiye'); return; }

  if (editingTestId) {
    const upd = updateTestRec({ id: editingTestId, type: testType, cls: cls, section: section, subject: subject, date: date, time: time, totalMarks: totalMarks });
    resetTestForm();
    renderTestsTable();
    fillTestsSelect(false);
    toast('success', 'Test Updated', upd.type + ' — ' + upd.subject + ' (Class ' + upd.cls + '-' + upd.section + '). Students ko update alert bhej diya gaya.');
  } else {
    const t = addTestRec({ type: testType, cls: cls, section: section, subject: subject, date: date, time: time, totalMarks: totalMarks });
    renderTestsTable();
    fillTestsSelect(false);
    toast('success', 'Test Uploaded', testType + ' — ' + subject + ' (Class ' + cls + '-' + section + '). Alert students ko bhej diya gaya.');
  }
}

function resetTestForm() {
  editingTestId = null;
  document.getElementById('tClass').value = 1;
  document.getElementById('tSection').value = 'A';
  document.getElementById('tSubject').value = '';
  document.getElementById('tDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('tTime').value = '10:00';
  document.getElementById('tTotal').value = 50;
  setTestType('Weekly');
  const btn = document.querySelector('#view-tests [onclick="createTest()"]');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-paper-plane me-1"></i> Upload Test &amp; Send Alert';
}

function editTest(id) {
  const t = getTests().find(x => x.id === id);
  if (!t) return;
  editingTestId = t.id;
  document.getElementById('tClass').value = t.cls;
  document.getElementById('tSection').value = t.section;
  document.getElementById('tSubject').value = t.subject;
  document.getElementById('tDate').value = t.date;
  document.getElementById('tTime').value = t.time;
  document.getElementById('tTotal').value = t.totalMarks;
  setTestType(t.type);
  const btn = document.querySelector('#view-tests [onclick="createTest()"]');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-pen-to-square me-1"></i> Update Test';
  const form = document.querySelector('#view-tests .card');
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('info', 'Editing: ' + t.id, t.type + ' — ' + t.subject + ' (Class ' + t.cls + '-' + t.section + '). Changes karke "Update Test" dabayen.');
}

function renderTestsTable() {
  const tbody = document.getElementById('testsTable');
  const empty = document.getElementById('testsEmpty');
  if (!tbody) return;

  const rows = getTests().filter(t => testsFilter === 'All' || t.type === testsFilter);
  tbody.innerHTML = '';
  if (empty) empty.style.display = rows.length ? 'none' : 'block';

  rows.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td><span class="obj-badge ' + (t.type === 'Weekly' ? 'week' : 'month') + '">' + esc(t.type) + '</span></td>' +
      '<td><b>Class ' + t.cls + '-' + t.section + '</b></td>' +
      '<td>' + esc(t.subject) + '</td>' +
      '<td>' + weekdayShort(t.date) + ' ' + fmtDate(t.date) + '</td>' +
      '<td>' + esc(t.time) + '</td>' +
      '<td class="fw-600">' + t.totalMarks + '</td>' +
      '<td class="text-end">' +
        '<button class="mini-btn btn-icon-info" onclick="fillTestsSelect(true);document.getElementById(\'marksTestSelect\').value=\'' + t.id + '\';switchView(\'marks\');renderMarksTable();" title="Enter Marks"><i class="fa-solid fa-square-poll-vertical"></i></button>' +
        '<button class="mini-btn btn-icon-warning" onclick="editTest(\'' + t.id + '\')" title="Edit Test"><i class="fa-solid fa-pen"></i></button>' +
        '<button class="mini-btn btn-icon-danger" onclick="deleteTest(\'' + t.id + '\')" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

function filterTests(type) {
  testsFilter = type;
  ['tfAll', 'tfWeekly', 'tfMonthly'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', id === ('tf' + type));
  });
  renderTestsTable();
}

function deleteTest(id) {
  if (!confirm('Is test ko delete karein? Us ke marks bhi hata liye jayenge.')) return;
  deleteTestRec(id);
  renderTestsTable();
  fillTestsSelect(false);
  toast('info', 'Test Deleted', 'Test plan se remove ho gaya.');
}

/* ============ MARKS ENTRY ============ */
function fillTestsSelect(keep) {
  const sel = document.getElementById('marksTestSelect');
  if (!sel) return;
  const prev = keep && sel.value ? sel.value : '';
  const tests = getTests();
  sel.innerHTML = tests.length
    ? '<option value="">Select test...</option>' + tests.map(t =>
        '<option value="' + t.id + '">' + esc(t.type) + ' — ' + esc(t.subject) + ' (Class ' + t.cls + '-' + t.section + ') • ' + fmtDate(t.date) + '</option>').join('')
    : '<option value="">Koi test nahi schedule hai</option>';
  if (prev && tests.some(t => t.id === prev)) sel.value = prev;
}

function renderMarksTable() {
  const sel = document.getElementById('marksTestSelect');
  const info = document.getElementById('marksTestInfo');
  const tbody = document.getElementById('marksTable');
  if (!sel || !tbody) return;
  const t = getTests().find(x => x.id === sel.value);
  if (!t) {
    tbody.innerHTML = '';
    info.style.display = 'none';
    return;
  }
  const mks = getMarks();
  info.style.display = 'block';
  info.innerHTML = '<i class="fa-solid fa-info-circle me-1"></i><b>' + esc(t.type) + '</b> — <b>' + esc(t.subject) + '</b>, Class ' + t.cls + '-' + t.section + ' • ' + weekdayShort(t.date) + ' ' + fmtDate(t.date) + ' • Total: ' + t.totalMarks + ' marks. Jitne marks hue hain unhe niche enter karein.';

  const students = DEMO_STUDENTS.filter(s => s.cls === t.cls && s.stream !== 'madarsa' && (!s.section || s.section === t.section));
  tbody.innerHTML = '';
  students.forEach(s => {
    const r = mks.find(m => m.testId === t.id && m.studentId === s.id);
    const pct = r ? Math.round(r.obtained / t.totalMarks * 100) : 0;
    const grad = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="fw-600">' + s.id + '</td>' +
      '<td><div class="stu-cell"><img class="avatar-sm" src="' + s.avatar + '" alt=""/><div><b>' + esc(s.name) + '</b></div></div></td>' +
      '<td>' + clsLabel(s) + '</td>' +
      '<td><div class="input-group input-group-sm">' +
        '<input type="number" class="form-control mark-inp" data-test="' + t.id + '" data-sid="' + s.id + '" min="0" max="' + t.totalMarks + '" placeholder="—" value="' + (r ? r.obtained : '') + '"' + (r ? '' : '') + ' />' +
        '<span class="input-group-text" style="background:#fff;border-left:0;">/ ' + t.totalMarks + '</span>' +
      '</div></td>' +
      '<td class="text-end fw-600" style="color:' + grad + ';">' + (r ? pct + '%' : '—') + '</td>';
    tbody.appendChild(tr);
  });
  if (!students.length) tbody.innerHTML = '<tr><td colspan="5" class="text-center muted py-3">Is class ka koi student nahi mila.</td></tr>';
}

function saveMarksEntry() {
  const t = getTests().find(x => x.id === document.getElementById('marksTestSelect').value);
  if (!t) { toast('error', 'Koi test select karein', 'Pehle test choose karein'); return; }
  let saved = 0;
  document.querySelectorAll('.mark-inp').forEach(inp => {
    if (inp.value !== '' && inp.value !== null) {
      saveMark(inp.dataset.test, inp.dataset.sid, +inp.value, t.totalMarks);
      saved++;
    }
  });
  saveArr('sh_marks', getMarks());
  renderMarksTable();
  const msg = saved
    ? saved + ' student ke marks save ho gaye. Students ke portal par foran updated.'
    : 'Koi marks enter nahi the. Sirf bhari hui entries save hui.';
  toast('success', 'Results Saved', msg);
}

/* ============ ADMISSIONS ============ */
function updateAdmissionBadge() {
  const b = document.getElementById('admissionBadge');
  if (!b) return;
  const pend = getAdmissions().filter(a => a.status === 'Pending' || a.status === 'Pending').length;
  b.style.display = pend ? 'inline-block' : 'none';
  b.textContent = pend;
}

function renderAdmissions() {
  const list = document.getElementById('admissionsList');
  const empty = document.getElementById('admissionsEmpty');
  if (!list) return;
  const ads = getAdmissions();
  if (empty) empty.style.display = ads.length ? 'none' : 'block';
  list.innerHTML = '';

  ads.forEach(a => {
    const approved = a.status === 'Approved';
    const card = document.createElement('div');
    card.className = 'card card-soft p-3 mb-3';
    card.innerHTML =
      '<div class="d-flex flex-wrap gap-3 align-items-start">' +
        '<img class="avatar" style="width:52px;height:52px;" src="https://api.dicebear.com/8.x/initials/svg?seed=' + encodeURIComponent(a.name) + '" alt=""/>' +
        '<div class="flex-grow-1" style="min-width:200px;">' +
          '<div class="d-flex flex-wrap align-items-center gap-2">' +
            '<b style="font-size:15px;">' + esc(a.name) + '</b>' +
            '<span class="badge-soft ' + (approved ? 'bg-soft-success' : 'bg-soft-warning') + '">' + esc(a.status) + '</span>' +
            '<span class="badge-soft bg-soft-info">' + esc(a.appId) + '</span>' +
          '</div>' +
          '<div class="small muted mt-1" style="line-height:1.8;">' +
            'Father: <b>' + esc(a.fatherName) + '</b> • Phone: <b>' + esc(a.phone) + '</b> • Class: <b>' + clsLabel(a) + '</b><br/>' +
            esc(a.address || '') + ' • ' + esc(a.stream || 'school') + '<br/>' +
            'Submitted: ' + a.date +
          '</div>' +
          '<div class="mt-1 row g-2">' + (approved ? '' : '<div class="col-md-3"><label class="form-label-sm">Mahana Fee (Rs.) — aap tay karein</label><input type="number" class="form-control form-control-sm" id="fee_' + a.appId + '" placeholder="e.g. 2500"/></div>') +
            '<div class="col-md-2"><label class="form-label-sm">Auto Student ID</label><input class="form-control form-control-sm" readonly value="' + esc(a.studentId) + '" onclick="this.select()"/></div>' +
            '<div class="col-md-2"><label class="form-label-sm">Login Password</label><input class="form-control form-control-sm" readonly value="' + esc(a.password) + '" onclick="this.select()"/></div>' +
          '</div>' +
        '</div>' +
        '<div class="d-flex gap-2">' +
(approved
            ? '<a class="btn-sm grad-btn text-decoration-none" target="_blank" href="' + waLink(a.phone, 'Admission approve! ID: ' + a.studentId + ' Password: ' + a.password) + '"><i class="fa-brands fa-whatsapp me-1"></i> WhatsApp par bhejein</a>'
            : '<button class="btn-sm grad-btn" onclick="approveAd(\'' + a.appId + '\',this)"><i class="fa-solid fa-check me-1"></i> Approve</button>' +
              '<button class="btn-sm btn-soft-danger" onclick="rejectAd(\'' + a.appId + '\')"><i class="fa-solid fa-xmark me-1"></i> Reject</button>') +
        '</div>' +
      '</div>';
    list.appendChild(card);
  });
}

function approveAd(appId, btn) {
  const fee = +(document.getElementById('fee_' + appId) || {}).value;
  if (!fee) { toast('error', 'Fee likhein', 'Approve se pehle mahana fee enter karein'); return; }
  const ad = approveAdmission(appId, fee);
  if (!ad) return;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Approved'; }
  renderAdmissions();
  buildStudentsTable();
  updateAdmissionBadge();
  toast('success', 'Admission Approved', ad.name + ' ab registered hai. Student ID: ' + ad.studentId + ' • Password: ' + ad.password + ' — student ko ID/Password den.');
}

function rejectAd(appId) {
  if (!confirm('Is admission request ko reject karein?')) return;
  rejectAdmission(appId);
  renderAdmissions();
  updateAdmissionBadge();
  toast('info', 'Request Rejected', 'Admission request remove ho gayi.');
}

/* ============ LIVE SYNC (cross-tab) ============ */
/* smartphone ya dosre tab se koi admission form bhar de to
   admin ko turant (bina refresh) update mil jata hai */
window.addEventListener('storage', e => {
  if (!e || !e.key) return;
  if (e.key === 'sh_ads') {
    const pend = getAdmissions().filter(a => a.status === 'Pending');
    renderAdmissions();
    updateAdmissionBadge();
    if (pend.length) {
      toast('success', 'New Admission Request!', pend[0].name + ' (' + pend[0].appId + ') ne form submit kiya hai. Approve/Reject kar sakte hain.');
      const badge = document.getElementById('admissionBadge');
      if (badge && badge.style.display !== 'none') { badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = ''; }
    }
  }
  if (e.key === 'sh_tests') {
    renderTestsTable();
    fillTestsSelect(false);
  }
  if (e.key === 'sh_marks') {
    renderTestsTable();
  }
  if (e.key === 'sh_messages') {
    renderAdminMessages();
  }
});

/* ============ MESSAGES (Admin -> Teachers / Students) ============ */
function sendAdminMessage() {
  const toRole = document.getElementById('msgToRole').value;
  const subject = document.getElementById('msgSubject').value.trim();
  const body = document.getElementById('msgBody').value.trim();

  if (!subject) { toast('error', 'Subject required', 'Message ka subject likhein'); return; }
  if (!body) { toast('error', 'Message required', 'Message ka text likhein'); return; }

  sendMessage({ toRole: toRole, toClass: null, subject: subject, body: body });

  document.getElementById('msgSubject').value = '';
  document.getElementById('msgBody').value = '';
  renderAdminMessages();

  const label = toRole === 'both' ? 'Teachers & Students' : toRole === 'teachers' ? 'Teachers' : 'Students';
  toast('success', 'Message Sent', '"' + subject + '" ' + label + ' ko bhej diya gaya.');
}

const roleLabels = { both: 'Teachers & Students', teachers: 'Teachers', students: 'Students' };

function renderAdminMessages() {
  const list = document.getElementById('adminMsgList');
  const empty = document.getElementById('adminMsgEmpty');
  if (!list) return;
  const msgs = getMessages();
  list.innerHTML = '';
  if (empty) empty.style.display = msgs.length ? 'none' : 'block';

  msgs.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card card-soft p-3 mb-3';
    card.innerHTML =
      '<div class="d-flex flex-wrap align-items-center gap-2 mb-1">' +
        '<span class="badge-soft ' + (m.toRole === 'students' ? 'bg-soft-info' : m.toRole === 'teachers' ? 'bg-soft-warning' : 'bg-soft-success') + '">' + esc(roleLabels[m.toRole] || m.from) + '</span>' +
        '<span class="muted ms-auto" style="font-size:11.5px;">' + esc(m.at) + '</span>' +
      '</div>' +
      '<b style="font-size:14.5px;">' + esc(m.subject) + '</b>' +
      '<div class="muted mt-1" style="font-size:13px;line-height:1.6;">' + esc(m.body) + '</div>';
    list.appendChild(card);
  });
  updateMsgNavBadge();
}

function updateMsgNavBadge() {
  const b = document.getElementById('msgNavBadge');
  if (!b) return;
  const n = getMessages().length;
  b.style.display = n ? 'inline-block' : 'none';
  b.textContent = n;
}

/* ============ TEACHERS LIST ============ */
function renderTeachers() {
  const grid = document.getElementById('teachersGrid');
  if (!grid) return;
  grid.innerHTML = '';
  allTeachers().forEach(t => {
    grid.insertAdjacentHTML('beforeend',
      '<div class="col-lg-4 col-md-6 anim-fade-up">' +
        '<div class="card card-soft p-3 h-100">' +
          '<div class="d-flex align-items-center gap-3">' +
            '<img class="avatar" style="width:52px;height:52px;" src="' + t.avatar + '" alt=""/>' +
            '<div class="flex-grow-1">' +
              '<b style="font-size:15px;">' + esc(t.name) + '</b><br/>' +
              '<span class="badge-soft bg-soft-primary mt-1">' + esc(t.subject) + '</span>' +
            '</div>' +
            '<span class="badge-soft ' + (t.status === 'Active' ? 'bg-soft-success' : 'bg-soft-danger') + '">' + esc(t.status) + '</span>' +
          '</div>' +
          '<div class="mt-3" style="font-size:12.5px;">' +
            '<div class="d-flex justify-content-between border-bottom py-2" style="border-color:#f1f5f9!important;"><span class="muted">Teacher ID</span><b>' + esc(t.id) + '</b></div>' +
            '<div class="d-flex justify-content-between border-bottom py-2" style="border-color:#f1f5f9!important;"><span class="muted">Email</span><b>' + esc(t.email) + '</b></div>' +
            '<div class="d-flex justify-content-between border-bottom py-2" style="border-color:#f1f5f9!important;"><span class="muted">Phone</span><b>' + esc(t.phone) + '</b></div>' +
            '<div class="d-flex justify-content-between py-2"><span class="muted">Classes</span><b class="text-end" style="max-width:60%;">' + esc(teacherClassesLabel(t)) + '</b></div>' +
          '</div>' +
          '<button class="btn-grad btn-sm w-100 mt-2" onclick="messageTeacher(\'' + t.id + '\')"><i class="fa-solid fa-envelope me-1"></i> Message Bhejein</button>' +
        '</div>' +
      '</div>');
  });
}

function messageTeacher(id) {
  const t = findTeacherById(id);
  if (!t) return;
  switchView('messages');
  document.getElementById('msgToRole').value = 'teachers';
  document.getElementById('msgSubject').value = 'Message for ' + t.name;
  document.getElementById('msgBody').focus();
}

/* ============ MANAGE USERS ============ */
function initUserForm() {
  const cls = document.getElementById('nuClass');
  const stuCls = document.getElementById('nuStuClass');
  if (cls && !cls.options.length) {
    for (let i = 1; i <= 8; i++) cls.insertAdjacentHTML('beforeend', '<option value="' + i + '">Class ' + i + '</option>');
  }
  if (stuCls && !stuCls.options.length) {
    for (let i = 1; i <= 8; i++) stuCls.insertAdjacentHTML('beforeend', '<option value="' + i + '">Class ' + i + '</option>');
  }
}

function toggleUserFields() {
  const isTeacher = document.getElementById('nuRole').value === 'teacher';
  document.querySelectorAll('.teacher-fields').forEach(el => el.style.display = isTeacher ? '' : 'none');
  document.querySelectorAll('.student-fields').forEach(el => el.style.display = isTeacher ? 'none' : '');
}

function createUser() {
  const role = document.getElementById('nuRole').value;
  const name = document.getElementById('nuName').value.trim();
  const email = document.getElementById('nuEmail').value.trim();
  const password = document.getElementById('nuPassword').value.trim();
  const phone = document.getElementById('nuPhone').value.trim();

  let data = { role: role, name: name, email: email, password: password, phone: phone };
  if (role === 'teacher') {
    data.subject = document.getElementById('nuSubject').value.trim();
    data.classes = [{ cls: +document.getElementById('nuClass').value, section: document.getElementById('nuSection').value }];
  } else {
    data.cls = +document.getElementById('nuStuClass').value;
    data.section = document.getElementById('nuStuSection').value;
  }

  const res = addUser(data);
  if (res.error) { toast('error', 'Could not add', res.error); return; }

  toast('success', 'User Added', res.user.name + ' (' + (role === 'teacher' ? 'Teacher' : 'Student') + ') — login: ' + res.user.email + ' / ' + res.user.password);
  document.getElementById('nuName').value = '';
  document.getElementById('nuEmail').value = '';
  document.getElementById('nuPassword').value = '';
  document.getElementById('nuPhone').value = '';
  const sub = document.getElementById('nuSubject'); if (sub) sub.value = '';
  renderUsers();
  renderTeachers();
}

function renderUsers() {
  const body = document.getElementById('usersBody');
  if (!body) return;
  const customIds = getCustomUsers().map(u => u.id);
  const rows = []
    .concat([{ name: ADMIN_USER.name + ' (Headmaster)', email: ADMIN_USER.email, role: 'admin', password: ADMIN_USER.password, custom: false, id: ADMIN_USER.id }])
    .concat(allTeachers().map(t => ({ name: t.name, email: t.email, role: 'teacher', password: t.password, custom: customIds.indexOf(t.id) > -1, id: t.id })))
    .concat(allStudents().map(s => ({ name: s.name, email: s.email, role: 'student', password: s.password, custom: customIds.indexOf(s.id) > -1, id: s.id })));

  body.innerHTML = '';
  rows.forEach(r => {
    const rCls = r.role === 'admin' ? 'bg-soft-danger' : r.role === 'teacher' ? 'bg-soft-warning' : 'bg-soft-info';
    body.insertAdjacentHTML('beforeend',
      '<tr>' +
        '<td class="fw-600">' + esc(r.name) + '</td>' +
        '<td>' + esc(r.email) + '</td>' +
        '<td><span class="badge-soft ' + rCls + '">' + esc(r.role) + '</span></td>' +
        '<td><code>' + esc(r.password) + '</code></td>' +
        '<td class="text-end">' + (r.custom
          ? '<button class="mini-btn btn-icon-danger" title="Delete" onclick="removeUser(\'' + r.id + '\')"><i class="fa-solid fa-trash"></i></button>'
          : '<span class="muted" style="font-size:11.5px;">default</span>') + '</td>' +
      '</tr>');
  });
}

function removeUser(id) {
  const u = getCustomUsers().find(x => x.id === id);
  if (!u) return;
  if (!confirm(u.name + ' ko delete karein? Iska login khatam ho jayega.')) return;
  deleteUser(id);
  renderUsers();
  renderTeachers();
  toast('info', 'User Deleted', u.name + ' ka account remove kar diya gaya.');
}