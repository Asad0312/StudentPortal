/* ============ VIEW SWITCHING ============ */
const viewTitles = {
  dashboard: ['Dashboard', 'Institute overview — Wednesday, 16 September 2026'],
  students: ['Students', '250 registered students • manage records'],
  scanner: ['QR Scanner', 'Scan karne par attendance automatic mark'],
  attendance: ['Attendance', 'Daily & monthly attendance records'],
  fees: ['Fee Management', 'September 2026 • monthly fees & payments'],
  profile: ['Student Profile', 'Asad Javed • STU-1001'],
  reports: ['Reports', 'Attendance, fees & backups'],
  portal: ['Student Portal', 'Student ka apna view — demo']
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link-item[data-view]').forEach(item => {
  item.addEventListener('click', () => switchView(item.dataset.view));
});

/* data-jump buttons (e.g. "View all") */
document.querySelectorAll('[data-jump]').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.jump));
});

function toggleSidebar(open) {
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('overlay').classList.toggle('show', open);
}

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

/* ============ CHARTS ============ */
const gridColor = 'rgba(148,163,184,.15)';
const fontFamily = "'Poppins', sans-serif";
Chart.defaults.font.family = fontFamily;

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
        borderRadius: 8,
        barThickness: 22
      }, {
        label: 'Absent',
        data: [52, 45, 40, 60, 35],
        backgroundColor: 'rgba(244,63,94,.75)',
        borderRadius: 8,
        barThickness: 22
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
      datasets: [{
        data: [84, 16],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0, hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.label}` } }
      }
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
      datasets: [{
        label: 'Attendance %',
        data: [88, 79, 92, 83],
        backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#0ea5e9'],
        borderRadius: 10, barThickness: 30
      }]
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
      labels: ['Web Development', 'Graphic Design', 'Digital Marketing', 'Others'],
      datasets: [{
        data: [120, 65, 45, 20],
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9'],
        borderWidth: 3, borderColor: '#fff', hoverOffset: 12
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 11 } } } }
    }
  });
}

function chartLine(ctxId) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Attendance',
        data: [1, 1, 1, 0, 1, 1, 1],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,.12)',
        fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: '#6366f1',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: gridColor }, border: { display: false }, min: 0, max: 1.2, ticks: { stepSize: 1, callback: v => v === 1 ? 'Present' : v === 0 ? 'Absent' : '' } }
      }
    }
  });
}

window.addEventListener('load', () => {
  chartBar('attChart', 250);
  chartDoughnut('feeChart');
  chartReportBar('repBar');
  chartReportDoughnut('repDoughnut');
  chartLine('stuLine');
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

function simulateScan() {
  simulate();
}

function simulate() {
  const stage = document.getElementById('scannerStage');
  if (!scanning) {
    stage.classList.add('scanning');
    setTimeout(() => {
      stage.classList.remove('scanning');
      result();
    }, 1600);
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
  const names = [['STU-1001', 'Asad Javed', '08:05 PM', 'https://api.dicebear.com/8.x/initials/svg?seed=Asad'],
                 ['STU-1002', 'Ali Ahmed', '07:35 PM', 'https://api.dicebear.com/8.x/initials/svg?seed=Ali'],
                 ['STU-1004', 'Bilal Ahmed', '07:20 PM', 'https://api.dicebear.com/8.x/initials/svg?seed=Bilal']];
  const s = names[Math.floor(Math.random() * names.length)];

  if (ok) {
    toast('success', 'Attendance Marked ✓', s[1] + ' (' + s[0] + ') — ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    addLogRow(s[1], s[0], s[3], 'Present');
  } else {
    toast('error', 'Duplicate Attendance', s[1] + ' ki attendance aaj pehle se lagi hui hai');
  }
}

function addLogRow(name, id, seed, status) {
  const log = document.querySelector('#scanResultCard .scan-log');
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
  const colors = { success: 'text-success', error: 'text-danger', info: 'text-primary' };
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