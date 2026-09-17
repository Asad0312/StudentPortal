/* ============ VIEW SWITCHING ============ */
const viewTitles = {
  dashboard: ['Dashboard', 'School overview — Wednesday, 16 September 2026'],
  students: ['Students', 'Class 1 to 8 • manage records'],
  scanner: ['QR Scanner', 'Scan karne par attendance automatic mark'],
  attendance: ['Attendance', 'Daily & monthly attendance records'],
  fees: ['Fee Management', 'September 2026 • monthly fees & payments'],
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
function printQR() { window.print(); }

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
        '<div><b>' + s.name + '</b><span>' + s.email + '</span></div></div></td>' +
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
  if (get('pEmail'))   get('pEmail').textContent = s.email;
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
  if (get('ptFee'))    get('ptFee').textContent = f.status;
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
    email: (document.getElementById('nsEmail') || {}).value,
    address: (document.getElementById('nsAddress') || {}).value,
    cls: parseInt((document.getElementById('nsClass') || {}).value || '6', 10),
    section: (document.getElementById('nsSection') || {}).value || 'A'
  };

  if (!data.name) { toast('error', 'Naam Required', 'Student ka full name likhein'); return; }

  const stu = registerNewStudent(data);
  buildStudentsTable();
  updateNextId();
  toast('success', 'Student Registered ✦', stu.id + ' • Auto QR Code generate ho gaya');
  renderProfileView(stu);
  switchView('profile');

  ['nsName','nsFather','nsPhone','nsEmail','nsAddress'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
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
        backgroundColor: 'rgba(99,102,241,.85)',
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
        backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#0ea5e9'], borderRadius: 10, barThickness: 30 }]
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
      datasets: [{ data: [60, 115, 75], backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
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
      datasets: [{ label: 'Attendance', data: week, borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,.12)', fill: true, tension: .4,
        pointRadius: 4, pointBackgroundColor: '#6366f1', borderWidth: 3 }]
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