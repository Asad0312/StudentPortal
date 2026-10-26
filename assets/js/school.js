/* school.js — fees (admin tay kare), exams, books, madarsa, WhatsApp/SMS. Teacher role hata diya gaya. */
function esc(s) { var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }; return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return m[c]; }); }
var SEED_IDS = ['STU-1001','STU-1002','STU-1003','STU-1004','STU-1010'];
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function nowCycle() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1); }
function monthLabel() { var d = new Date(); return MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function isLate() { return new Date().getDate() > 15; }
function rollFee(s) {
  var f = s.fee, c = nowCycle();
  if (!f.cycle) f.cycle = c;
  else if (f.cycle !== c) { f.remaining = (f.remaining || 0) + f.monthly; f.paid = 0; f.fineTotal = 0; f.cycle = c; f.status = f.remaining > 0 ? 'Unpaid' : 'Paid'; }
  f.month = monthLabel();
}
var NOTIFY_ENDPOINT = ''; /* backend URL (Twilio/WhatsApp Cloud API/SMS gateway) — khali ho to sirf outbox + wa.me link */
function allTeachers() { return []; }
function intl(p) { var d = String(p || '').replace(/\D/g, ''); return d.charAt(0) === '0' ? '92' + d.slice(1) : d; }
function notify(phone, text) {
  var log = loadArr('sh_outbox', []) || [];
  log.unshift({ to: phone, text: text, at: new Date().toLocaleString('en-GB'), via: 'WhatsApp + SMS' });
  saveArr('sh_outbox', log.slice(0, 200));
  if (NOTIFY_ENDPOINT) fetch(NOTIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: intl(phone), text: text, channels: ['whatsapp', 'sms'] }) }).catch(function () {});
}
function waLink(phone, text) { return 'https://wa.me/' + intl(phone) + '?text=' + encodeURIComponent(text); }
var STREAMS = { school: 'School', madarsa: 'Madarsa', both: 'School + Madarsa' };
function clsLabel(s) {
  var st = s.stream || 'school', m = s.madarsaSection || s.section || 'A';
  if (st === 'madarsa') return 'Madarsa Section ' + m;
  if (st === 'both') return 'Class ' + s.cls + ' + Madarsa ' + m;
  return 'Class ' + s.cls;
}
function persist() {
  saveArr('sh_approved', DEMO_STUDENTS.filter(function (s) { return SEED_IDS.indexOf(s.id) < 0; }));
  var m = {}; DEMO_STUDENTS.forEach(function (s) { m[s.id] = { fee: s.fee, payments: s.payments, examPaid: s.examPaid || {}, attendance: s.attendance }; });
  saveArr('sh_state', m);
}
(function applyState() { var m = loadArr('sh_state', {}) || {}; DEMO_STUDENTS.forEach(function (s) { if (m[s.id]) { s.fee = m[s.id].fee; s.payments = m[s.id].payments; s.examPaid = m[s.id].examPaid; if (m[s.id].attendance) s.attendance = m[s.id].attendance; } }); DEMO_STUDENTS.forEach(rollFee); })();

function authenticate(u, pass) {
  u = String(u || '').trim().toLowerCase(); pass = String(pass || '');
  if (u === ADMIN_USER.email && pass === ADMIN_USER.password) return { role: 'admin', user: ADMIN_USER };
  var s = DEMO_STUDENTS.find(function (x) { return (x.id.toLowerCase() === u || (intl(x.phone) && intl(x.phone) === intl(u))) && x.password === pass; });
  return s ? { role: 'student', user: s } : null;
}

function registerNewStudent(data, opts) {
  opts = opts || {};
  var fee = +data.fee || 0, st = data.stream || 'school';
  var stu = {
    id: opts.id || nextStudentId(), name: data.name,
    password: opts.password || String(data.name).replace(/\s+/g, '').toLowerCase() + '123',
    fatherName: data.fatherName, phone: data.phone, email: '', address: data.address,
    cls: st === 'madarsa' ? 0 : +data.cls, section: st === 'madarsa' ? (data.madarsaSection || 'A') : '',
    stream: st, madarsaSection: data.madarsaSection || 'A', batch: 'Session 2026',
    admission: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    status: 'Active', avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=' + encodeURIComponent(data.name),
    attendance: { present: 0, total: 0, percent: 0, week: [0, 0, 0, 0, 0, 0, 0] },
    fee: { monthly: fee, paid: 0, remaining: fee, status: 'Unpaid', month: monthLabel(), cycle: nowCycle(), fineTotal: 0 },
    payments: [], examPaid: {}, classInfo: { classTeacher: '—', timing: 'Mon–Fri', duration: 'Academic Year 2026' }
  };
  DEMO_STUDENTS.push(stu); CURRENT_STUDENT = stu; persist(); return stu;
}
function submitAdmission(d) {
  var all = getAdmissions();
  var ad = { appId: nextAppId(), name: d.name, fatherName: d.fatherName, phone: d.phone, email: '', address: d.address, cls: d.stream === 'madarsa' ? 0 : +d.cls,
    section: (d.stream === 'madarsa') ? (d.madarsaSection || 'A') : '', stream: d.stream || 'school', madarsaSection: d.madarsaSection || 'A', studentId: nextStudentId(),
    password: String(d.name).replace(/\s+/g, '').toLowerCase() + '123', status: 'Pending',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
  all.unshift(ad); saveArr('sh_ads', all); return ad;
}
function approveAdmission(appId, fee) {
  var ad = findAdmission(appId); if (!ad) return null;
  ad.status = 'Approved'; ad.fee = fee; saveAdmissions();
  var stu = registerNewStudent(ad, { id: ad.studentId, password: ad.password });
  addAlert({ cls: ad.cls, section: stu.section, msg: 'New student registered: ' + ad.name + ' — ID ' + ad.studentId });
  notify(ad.phone, 'Assalam o Alaikum! ' + ad.name + ' ka admission approve ho gaya. Login ID: ' + ad.studentId + ', Password: ' + ad.password + ', Mahana fee: Rs. ' + fee + '.');
  return ad;
}

/* ---------- FEES: simple aur detail wala layout ---------- */
function $v(i) { var e = document.getElementById(i); return e ? e.value : ''; }
function feeLabel(st) { return { Paid: 'Paid', Pending: 'Partial (aadhi)', Unpaid: 'Unpaid' }[st] || st; }
function feeBadge(f) { return f.status === 'Paid' ? 'bg-soft-success' : f.status === 'Pending' ? 'bg-soft-warning' : 'bg-soft-danger'; }
var feeTab = '';
function setFeeTab(v) { feeTab = v; renderFeeTable(); }
function rs(n) { return 'Rs. ' + (+n || 0).toLocaleString(); }
function renderFeeTable() {
  var box = document.getElementById('feeBody'); if (!box) return;
  var q = $v('fSearch').trim().toLowerCase(), cl = $v('fClass');
  var base = DEMO_STUDENTS.filter(function (s) {
    var st = s.stream || 'school';
    return (!q || s.name.toLowerCase().indexOf(q) >= 0 || s.id.toLowerCase().indexOf(q) >= 0) && (!cl || (cl === 'M' ? st !== 'school' : (st !== 'madarsa' && String(s.cls) === cl)));
  });
  var late = function (s) { return isLate() && s.fee.remaining > 0; };
  var tabs = [['', 'Sab', base.length], ['Unpaid', 'Unpaid', base.filter(function (s) { return s.fee.status === 'Unpaid'; }).length], ['Pending', 'Partial', base.filter(function (s) { return s.fee.status === 'Pending'; }).length],
    ['Paid', 'Paid', base.filter(function (s) { return s.fee.status === 'Paid'; }).length], ['Late', 'Late', base.filter(late).length]];
  document.getElementById('feeTabs').innerHTML = tabs.map(function (t) { return '<button class="filter-chip' + (feeTab === t[0] ? ' active' : '') + '" onclick="setFeeTab(\'' + t[0] + '\')">' + t[1] + ' <b>' + t[2] + '</b></button>'; }).join('');
  var list = base.filter(function (s) { return !feeTab || (feeTab === 'Late' ? late(s) : s.fee.status === feeTab); });
  box.innerHTML = list.length ? list.map(function (s) {
    var f = s.fee, tot = f.paid + f.remaining, pct = tot ? Math.round(f.paid * 100 / tot) : 0, col = f.status === 'Paid' ? '#10b981' : pct > 0 ? '#f59e0b' : '#ef4444';
    return '<div class="fee-row"><div class="stu-cell"><img class="avatar-sm" src="' + s.avatar + '"/><div><b>' + esc(s.name) + '</b><span>' + s.id + ' • ' + esc(clsLabel(s)) + '</span></div></div>' +
      '<div class="fr-fee"><small class="muted">Mahana fee</small><b>' + rs(f.monthly) + '</b></div>' +
      '<div class="fr-bal"><div class="d-flex justify-content-between small"><span>Jama <b class="text-success">' + rs(f.paid) + '</b></span><span>Baqi <b style="color:' + (f.remaining > 0 ? '#b45309' : '#047857') + '">' + rs(f.remaining) + '</b></span></div>' +
      '<div style="height:7px;background:#e8f0ef;border-radius:6px;margin-top:6px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + col + '"></div></div></div>' +
      '<div class="fr-act"><span class="badge-soft ' + feeBadge(f) + '">' + feeLabel(f.status) + '</span>' + (late(s) ? ' <span class="badge-soft bg-soft-danger">Late</span>' : '') +
      '<div class="mt-2 d-flex gap-2">' + (f.remaining > 0 ? '<button class="btn-grad" style="padding:6px 14px;font-size:13px" onclick="recvFee(\'' + s.id + '\')">Fee lein</button>' : '') +
      '<button class="btn-ghost" style="padding:6px 14px;font-size:13px" onclick="feeDetail(\'' + s.id + '\')">Detail</button></div></div></div>';
  }).join('') : '<div class="text-center muted py-4">Koi student nahi mila</div>';
  var rec = 0, bal = 0, fine = 0; DEMO_STUDENTS.forEach(function (s) { rec += s.fee.paid; bal += s.fee.remaining; fine += s.fee.fineTotal || 0; });
  var r = rec + bal ? Math.round(rec * 100 / (rec + bal)) : 0;
  document.getElementById('feeStats').innerHTML = attStat('wallet', rs(rec + bal), 'Kul Fee (is mahine)', 'bg-soft-primary') + attStat('circle-check', rs(rec), 'Mil chuki', 'bg-grad-success') + attStat('hourglass-half', rs(bal), 'Baqi (balance)', 'bg-soft-warning') + attStat('chart-pie', r + '%', 'Collection', 'bg-soft-info');
  document.getElementById('feeTitle').textContent = 'Fee — ' + monthLabel();
  document.getElementById('feeSub').textContent = 'Last date: 15 ' + monthLabel() + (fine ? ' • Late fine mili: ' + rs(fine) : '');
}
function feeDetail(id) {
  var s = findStudentById(id), f = s.fee, row = function (k, v) { return '<tr><td class="text-muted">' + k + '</td><td class="text-end"><b>' + v + '</b></td></tr>'; };
  var hist = (s.payments || []).slice(0, 8).map(function (p) { return '<tr><td>' + esc(p.date || '') + '</td><td>' + esc(p.month || '') + '</td><td class="text-end"><b>' + rs(p.amount) + '</b>' + (p.penalty ? '<br><small class="text-danger">+ fine ' + rs(p.penalty) + '</small>' : '') + '</td></tr>'; }).join('');
  Swal.fire({ title: s.name, width: 520, showCancelButton: true, showDenyButton: true, showConfirmButton: f.remaining > 0, confirmButtonText: 'Fee lein', denyButtonText: 'Mahana fee badlein', cancelButtonText: 'Band karein',
    html: '<div class="text-muted mb-2">' + s.id + ' • ' + esc(clsLabel(s)) + '</div><table class="table table-sm text-start mb-3">' + row('Mahana fee', rs(f.monthly)) + row('Is mahine jama', rs(f.paid)) + row('Baqi (balance)', rs(f.remaining)) +
      row('Status', feeLabel(f.status)) + row('Last date', '15 ' + monthLabel()) + row('Late fine lagi', rs(f.fineTotal || 0)) + '</table><div class="text-start fw-600 mb-1">Payment history</div>' +
      (hist ? '<table class="table table-sm text-start mb-0"><thead><tr><th>Date</th><th>Mahina</th><th class="text-end">Rakam</th></tr></thead><tbody>' + hist + '</tbody></table>' : '<div class="text-muted">Abhi koi payment nahi hui</div>') })
    .then(function (r) { if (r.isConfirmed) recvFee(id); else if (r.isDenied) editFee(id); });
}
function editFee(id) {
  var s = findStudentById(id), v = prompt(s.name + ' ki mahana fee (Rs.):', s.fee.monthly); if (v === null || isNaN(+v)) return;
  var d = +v - s.fee.monthly; s.fee.monthly = +v; s.fee.remaining = Math.max(0, s.fee.remaining + d);
  s.fee.status = s.fee.remaining === 0 && s.fee.monthly > 0 ? 'Paid' : s.fee.paid > 0 ? 'Pending' : 'Unpaid';
  persist(); renderFeeTable(); toast('success', 'Fee Updated', s.name + ': ' + rs(s.fee.monthly));
}
function recvFee(id) { document.getElementById('qfId').value = id; feeLookup(); document.getElementById('qfCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
function feeQuick(n) { document.getElementById('qfAmt').value = n; }
function feeLookup() {
  var s = findStudentById($v('qfId').trim().toUpperCase()), info = document.getElementById('qfInfo'), box = document.getElementById('qfPay');
  if (!s) { info.innerHTML = '<div class="text-danger mt-2">Yeh ID nahi mili</div>'; box.style.display = 'none'; return; }
  var f = s.fee, late = isLate() && f.remaining > 0, chip = function (k, v, c) { return '<span class="badge-soft ' + c + '" style="font-size:12.5px">' + k + ': <b>' + v + '</b></span>'; };
  info.innerHTML = '<div class="d-flex gap-3 align-items-center p-3 rounded-3 mt-3" style="background:#f6faf9"><img class="avatar-sm" style="width:54px;height:54px" src="' + s.avatar + '"/><div><b>' + esc(s.name) + '</b> <span class="muted small">' + s.id + ' • ' + esc(clsLabel(s)) + '</span>' +
    '<div class="d-flex flex-wrap gap-2 mt-2">' + chip('Mahana', rs(f.monthly), 'bg-soft-info') + chip('Jama', rs(f.paid), 'bg-soft-success') + chip('Baqi', rs(f.remaining), f.remaining > 0 ? 'bg-soft-warning' : 'bg-soft-success') + (late ? '<span class="badge-soft bg-soft-danger">Late — 15 tarik guzar chuki</span>' : '') + '</div></div></div>';
  if (f.remaining <= 0) { info.innerHTML += '<div class="text-success fw-600 mt-2">Is mahine ki fee poori jama hai ✓</div>'; box.style.display = 'none'; return; }
  box.style.display = ''; document.getElementById('qfAmt').value = f.remaining;
  document.getElementById('qfHalf').onclick = function () { feeQuick(Math.ceil(f.remaining / 2)); }; document.getElementById('qfFull').onclick = function () { feeQuick(f.remaining); };
  document.getElementById('qfFineBox').style.display = late ? '' : 'none'; document.getElementById('qfFineOn').checked = false; document.getElementById('qfFine').value = loadArr('sh_fine', 0) || '';
}
function feePay() {
  var s = findStudentById($v('qfId').trim().toUpperCase()), amt = +$v('qfAmt');
  if (!s || !(amt > 0)) { toast('error', 'Check karein', 'Sahi ID aur amount likhein'); return; }
  if (amt > s.fee.remaining) { toast('error', 'Amount zyada hai', 'Is student ki baqi fee sirf ' + rs(s.fee.remaining) + ' hai'); return; }
  var f = s.fee, fine = document.getElementById('qfFineOn').checked ? (+$v('qfFine') || 0) : 0;
  if (fine) saveArr('sh_fine', fine);
  f.paid += amt; f.remaining = Math.max(0, f.remaining - amt); f.status = f.remaining === 0 ? 'Paid' : 'Pending'; f.fineTotal = (f.fineTotal || 0) + fine;
  s.payments.unshift({ month: f.month, amount: amt, penalty: fine, date: new Date().toLocaleDateString('en-GB'), method: 'Cash' });
  persist(); renderFeeTable(); document.getElementById('qfPay').style.display = 'none'; document.getElementById('qfInfo').innerHTML = ''; document.getElementById('qfId').value = '';
  notify(s.phone, s.name + ' ki fee Rs. ' + amt + (fine ? ' + late fine Rs. ' + fine : '') + ' jama ho gayi. Baqi: Rs. ' + f.remaining + '.');
  Swal.fire({ icon: 'success', title: 'Fee Jama ✓', html: '<b>' + esc(s.name) + '</b><br>' + rs(amt) + (fine ? ' + fine ' + rs(fine) : '') + '<br>Baqi: ' + rs(f.remaining) + '<br><small>Student ke portal mein aa gayi</small>', timer: 2800, showConfirmButton: false });
}
function renderFeeDue(s) {
  var e = document.getElementById('feeDue'); if (!e) return; var f = s.fee, late = isLate(), left = 15 - new Date().getDate();
  var h = '<div class="d-flex flex-wrap gap-2"><span class="badge-soft bg-soft-info"><i class="fa-solid fa-calendar-day me-1"></i>Last date: 15 ' + monthLabel() + '</span>';
  if (f.remaining > 0) h += late ? '<span class="badge-soft bg-soft-danger">Last date guzar chuki — school late fine laga sakta hai</span>' : '<span class="badge-soft bg-soft-warning">' + left + ' din baqi</span>';
  if (f.remaining > 0 && f.paid > 0) h += '<span class="badge-soft bg-soft-warning">Balance baqi: Rs. ' + f.remaining + ' (Rs. ' + f.paid + ' jama ho chuke)</span>';
  if (f.fineTotal) h += '<span class="badge-soft bg-soft-danger">Late fine lagi: Rs. ' + f.fineTotal + '</span>';
  e.innerHTML = h + '</div>';
}

/* ---------- EXAMS ---------- */
function getExams() { return loadArr('sh_exams', []) || []; }
function createExam() {
  var month = document.getElementById('exMonth').value, title = document.getElementById('exTitle').value.trim(), fee = +document.getElementById('exFee').value, cls = document.getElementById('exClass').value;
  if (!month || !title || !(fee >= 0)) { toast('error', 'Poora likhein', 'Month, naam aur exam fee zaroori hain'); return; }
  var all = getExams(), ex = { id: 'EX-' + (all.length + 1), month: month, title: title, fee: fee, cls: cls, stream: $v('exStream') || 'all' }; all.unshift(ex); saveArr('sh_exams', all);
  var n = 0; DEMO_STUDENTS.forEach(function (s) { if (examFor(ex, s)) { n++; notify(s.phone, 'Exam Notice: ' + title + ' (' + month + ') aa raha hai. Exam fee Rs. ' + fee + ' alag se jama karwayein.'); } });
  for (var c = 1; c <= 8; c++) if (cls === 'all' || +cls === c) addAlert({ cls: c, section: '', msg: 'Exam: ' + title + ' — ' + month + '. Exam fee Rs. ' + fee });
  if (ex.stream !== 'school') addAlert({ cls: 0, section: '', msg: 'Exam: ' + title + ' — ' + month + '. Exam fee Rs. ' + fee });
  renderExams(); toast('success', 'Exam Announce', n + ' students ko WhatsApp/SMS queue hua');
}
function examForStream(e, s) { var es = e.stream || 'all', st = s.stream || 'school'; return es === 'all' || st === 'both' || es === st; }
function examFor(e, s) { return examForStream(e, s) && (e.cls === 'all' || (s.stream || 'school') === 'madarsa' || +e.cls === +s.cls); }
function examFeeReceive(exId) {
  var id = prompt('Student ID (e.g. STU-1001) jis ne exam fee di:'); if (!id) return; var s = findStudentById(id); if (!s) { toast('error', 'Not found', id); return; }
  s.examPaid = s.examPaid || {}; s.examPaid[exId] = true; persist(); renderExams(); toast('success', 'Exam fee received', s.name);
}
function delExam(id) { saveArr('sh_exams', getExams().filter(function (e) { return e.id !== id; })); renderExams(); }
function renderExams() {
  var b = document.getElementById('examBody'); if (!b) return; var all = getExams(); b.innerHTML = '';
  if (!all.length) b.innerHTML = '<tr><td colspan="6" class="text-center muted py-3">Abhi koi exam announce nahi hua</td></tr>';
  all.forEach(function (e) {
    var paid = DEMO_STUDENTS.filter(function (s) { return s.examPaid && s.examPaid[e.id]; }).length;
    b.insertAdjacentHTML('beforeend', '<tr><td><b>' + esc(e.month) + '</b></td><td>' + esc(e.title) + '</td><td>' + (e.cls === 'all' ? 'All classes' : 'Class ' + e.cls) + ' • ' + ({ all: 'School+Madarsa', school: 'School', madarsa: 'Madarsa' }[e.stream || 'all']) + '</td><td class="fw-600">Rs. ' + e.fee + '</td><td>' + paid + ' paid</td><td class="text-end">' +
      '<button class="mini-btn btn-icon-success" title="Exam fee lein" onclick="examFeeReceive(\'' + e.id + '\')"><i class="fa-solid fa-money-bill-wave"></i></button><button class="mini-btn btn-icon-danger" onclick="delExam(\'' + e.id + '\')"><i class="fa-solid fa-trash"></i></button></td></tr>');
  });
}

/* ---------- BOOKS (school: class 1-8, madarsa: section A-D) ---------- */
var SCH_SUBJ = ['Urdu', 'English', 'Maths', 'Islamiyat', 'Science', 'Social Studies', 'Computer', 'Pakistan Studies'];
var SCH_CNT = { 1: 4, 2: 5, 3: 6, 4: 6, 5: 7, 6: 7, 7: 8, 8: 8 };
var BOOK_TPL = { school: {}, madarsa: {
  A: ['Noorani Qaida', 'Dua-e-Masnoon', 'Kalma aur Namaz ki Kitab', 'Urdu Deeni Qaida'],
  B: ['Quran Pak Nazra (Para 1-5)', 'Yassarnal Quran', 'Dua-e-Masnoon', 'Namaz Masail', 'Deeni Taleem Part 1'],
  C: ['Quran Pak Nazra (Para 6-30)', 'Tajweed ul Quran', 'Deeni Taleem Part 2', 'Seerat-un-Nabi (SAW)', 'Masnoon Duain', 'Akhlaq o Adab'],
  D: ['Quran Pak Hifz / Nazra Revision', 'Tajweed aur Qirat', 'Talimul Islam', 'Fiqh (Namaz, Roza, Zakat)', 'Arabic Nahw', 'Arabic Sarf', 'Hadith Chaalees']
} };
(function () { for (var c = 1; c <= 8; c++) BOOK_TPL.school[c] = SCH_SUBJ.slice(0, SCH_CNT[c]).map(function (n) { return n + ' — Class ' + c; }); })();
function getBooks() { return loadArr('sh_books', []) || []; }
function bkKey(st) { var v = $v('bkClass'); return st === 'madarsa' ? v : +v; }
function bkLabel(st, k) { return st === 'madarsa' ? 'Madarsa Section ' + k : 'Class ' + k; }
function bkStreamChanged() {
  var st = $v('bkStream'), h = '';
  if (st === 'madarsa') ['A', 'B', 'C', 'D'].forEach(function (x) { h += '<option value="' + x + '">Madarsa Section ' + x + '</option>'; });
  else for (var c = 1; c <= 8; c++) h += '<option value="' + c + '">Class ' + c + '</option>';
  document.getElementById('bkClass').innerHTML = h; loadBookTemplate();
}
function bkRow(n, p) { return '<div class="row g-2 mb-2 bkrow"><div class="col-7"><input class="form-control bkn" value="' + esc(n) + '"/></div><div class="col-3"><input type="number" class="form-control bkp" placeholder="Rs." value="' + (p === '' ? '' : p) + '"/></div><div class="col-2"><button class="mini-btn btn-icon-danger" onclick="this.closest(\'.bkrow\').remove()"><i class="fa-solid fa-xmark"></i></button></div></div>'; }
function loadBookTemplate() {
  var box = document.getElementById('bkDraft'); if (!box) return;
  var st = $v('bkStream'), key = bkKey(st), tpl = (BOOK_TPL[st][key] || []).slice(), saved = getBooks().filter(function (b) { return b.cls === key && b.stream === st; });
  saved.forEach(function (b) { if (tpl.indexOf(b.title) < 0) tpl.push(b.title); });
  box.innerHTML = '<div class="fw-600 mb-2">' + bkLabel(st, key) + ' — ' + tpl.length + ' books. Har book ki qeemat likhein:</div><div id="bkRows">' +
    tpl.map(function (n) { var b = saved.filter(function (x) { return x.title === n; })[0]; return bkRow(n, b ? b.price : ''); }).join('') +
    '</div><button class="btn-ghost me-2" onclick="document.getElementById(\'bkRows\').insertAdjacentHTML(\'beforeend\',bkRow(\'\',\'\'))"><i class="fa-solid fa-plus me-1"></i>Aur book</button><button class="btn-grad" onclick="saveDraftBooks()"><i class="fa-solid fa-check me-1"></i>Save All Books</button>';
}
function saveDraftBooks() {
  var st = $v('bkStream'), key = bkKey(st), rows = document.querySelectorAll('#bkRows .bkrow'), keep = getBooks().filter(function (b) { return !(b.cls === key && b.stream === st); }), n = 0, skipped = 0;
  rows.forEach(function (r) { var t = r.querySelector('.bkn').value.trim(), p = r.querySelector('.bkp').value; if (!t) return; if (p === '' || +p < 0) { skipped++; return; } keep.push({ id: 'BK-' + Date.now() + '-' + n, cls: key, stream: st, title: t, price: +p }); n++; });
  saveArr('sh_books', keep); renderBooks(); loadBookTemplate(); toast(skipped ? 'info' : 'success', n + ' books save', skipped ? skipped + ' books ki qeemat khali thi, woh save nahi hui' : bkLabel(st, key) + ' ki books portal mein aa gayi');
}
function addBook() {
  var st = $v('bkStream'), key = bkKey(st), title = $v('bkTitle').trim(), price = $v('bkPrice');
  if (!title || price === '' || +price < 0) { toast('error', 'Poora likhein', 'Book ka naam aur qeemat likhein'); return; }
  var all = getBooks(); all.push({ id: 'BK-' + Date.now(), cls: key, stream: st, title: title, price: +price }); saveArr('sh_books', all);
  document.getElementById('bkTitle').value = ''; document.getElementById('bkPrice').value = ''; renderBooks(); loadBookTemplate(); toast('success', 'Book Added', title);
}
function delBook(id) { saveArr('sh_books', getBooks().filter(function (b) { return b.id !== id; })); renderBooks(); loadBookTemplate(); }
function renderBooks() {
  var box = document.getElementById('booksList'); if (!box) return; var all = getBooks(), h = '';
  [['school', [1, 2, 3, 4, 5, 6, 7, 8]], ['madarsa', ['A', 'B', 'C', 'D']]].forEach(function (g) {
    g[1].forEach(function (k) {
      var l = all.filter(function (b) { return b.cls === k && b.stream === g[0]; }); if (!l.length) return;
      h += '<div class="card card-soft p-3 mb-3"><b>' + STREAMS[g[0]] + ' — ' + bkLabel(g[0], k) + '</b> <span class="muted small">(' + l.length + ' books • Total Rs. ' + l.reduce(function (a, b) { return a + b.price; }, 0) + ')</span>' +
        l.map(function (b) { return '<div class="d-flex justify-content-between border-bottom py-2"><span>' + esc(b.title) + '</span><span><b>Rs. ' + b.price + '</b> <button class="mini-btn btn-icon-danger" onclick="delBook(\'' + b.id + '\')"><i class="fa-solid fa-trash"></i></button></span></div>'; }).join('') + '</div>';
    });
  });
  box.innerHTML = h || '<div class="muted">Abhi koi book save nahi hui. Upar class (ya madarsa section) chunein, list khud aa jayegi.</div>';
}
function bookFor(b, s) { var st = s.stream || 'school'; return b.stream === 'school' ? (st !== 'madarsa' && +b.cls === +s.cls) : (st !== 'school' && b.cls === (s.madarsaSection || 'A')); }

/* ---------- STUDENT PORTAL extras ---------- */
function renderSchoolExtras(s) {
  var g = function (i) { return document.getElementById(i); }, st = s.stream || 'school';
  var ex = getExams().filter(function (e) { return examFor(e, s); });
  g('exFeeBody').innerHTML = ex.length ? ex.map(function (e) { var p = s.examPaid && s.examPaid[e.id];
    return '<tr><td><b>' + esc(e.month) + '</b></td><td>' + esc(e.title) + '</td><td>Rs. ' + e.fee + '</td><td class="text-end"><span class="badge-soft ' + (p ? 'bg-soft-success' : 'bg-soft-danger') + '">' + (p ? 'Paid' : 'Unpaid') + '</span></td></tr>'; }).join('')
    : '<tr><td colspan="4" class="text-center muted py-3">Abhi koi exam announce nahi hua</td></tr>';
  var bk = getBooks().filter(function (b) { return bookFor(b, s); });
  g('bookBody').innerHTML = bk.length ? bk.map(function (b) { return '<tr><td>' + esc(b.title) + '</td><td><span class="badge-soft bg-soft-info">' + STREAMS[b.stream] + '</span></td><td class="text-end fw-600">Rs. ' + b.price + '</td></tr>'; }).join('') +
    '<tr><td colspan="2"><b>Total</b></td><td class="text-end"><b>Rs. ' + bk.reduce(function (a, b) { return a + b.price; }, 0) + '</b></td></tr>' : '<tr><td colspan="3" class="text-center muted py-3">Is class ki books abhi upload nahi hui</td></tr>';
  g('madarsaCard').style.display = st === 'school' ? 'none' : '';
  ['cardTests', 'cardMarks'].forEach(function (i) { if (g(i)) g(i).style.display = st === 'madarsa' ? 'none' : ''; });
  if (g('portalBadge')) g('portalBadge').textContent = { school: 'School Portal', madarsa: 'Madarsa Portal', both: 'School + Madarsa Portal' }[st];
  document.title = 'IRAA — ' + { school: 'School', madarsa: 'Madarsa', both: 'School + Madarsa' }[st] + ' Portal';
  g('madarsaInfo').textContent = 'Madarsa Section ' + (s.madarsaSection || s.section || 'A') + ' • ' + STREAMS[st];
}

/* ---------- ID CARD PRINT (sirf card print hota hai) ---------- */
function printIdCard(s) {
  if (!s) return;
  var old = document.getElementById('idPrint'); if (old) old.remove();
  var st = document.getElementById('idPrintCss'); if (st) st.remove();
  st = document.createElement('style'); st.id = 'idPrintCss';
  st.textContent = '#idPrint{display:none}@media print{body>*:not(#idPrint){display:none!important}#idPrint{display:flex!important;justify-content:center;padding:16px}@page{margin:8mm}}' +
    '#idPrint *{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}' +
    '#idPrint .idc{width:330px;border-radius:20px;overflow:hidden;font-family:Arial,sans-serif;background:#fff;color:#0b1220;border:1px solid #cfe3e0;box-shadow:0 6px 20px rgba(0,0,0,.12)}' +
    '#idPrint .idh{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:14px 16px 46px;display:flex;align-items:center;gap:10px}' +
    '#idPrint .lg{width:42px;height:42px;border-radius:10px;overflow:hidden;flex-shrink:0}' +
    '#idPrint .idh b{display:block;font-size:15px}#idPrint .idh small{opacity:.9;font-size:10.5px;letter-spacing:.3px}' +
    '#idPrint .phw{margin:-38px auto 0;width:92px;height:92px;border-radius:50%;background:#fff;padding:4px;box-shadow:0 4px 12px rgba(0,0,0,.18);position:relative}' +
    '#idPrint .phw img{width:100%;height:100%;border-radius:50%;object-fit:cover}' +
    '#idPrint .idb{text-align:center;padding:0 18px 14px}#idPrint h3{margin:10px 0 4px;font-size:20px}' +
    '#idPrint .idn{display:inline-block;background:#e6f6f4;color:#0f766e;font-weight:700;padding:3px 14px;border-radius:20px;font-size:13px;letter-spacing:1px}' +
    '#idPrint .tag{display:block;margin:8px auto 0;color:#475569;font-size:13px;font-weight:600}' +
    '#idPrint .gr{margin:12px 0;text-align:left;font-size:12.5px;border-top:1px dashed #cbd5e1}' +
    '#idPrint .gr div{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px dashed #e2e8f0}#idPrint .gr span{color:#64748b}#idPrint .gr b{text-align:right}' +
    '#idPrint .qr{width:104px;height:104px;border:1px solid #e2e8f0;border-radius:10px;padding:4px}#idPrint .qs{display:block;font-size:10.5px;color:#64748b;margin-top:4px}' +
    '#idPrint .idf{background:#0f766e;color:#fff;text-align:center;font-size:10.5px;padding:7px;letter-spacing:.4px}';
  document.head.appendChild(st);
  var row = function (k, v) { return '<div><span>' + k + '</span><b>' + esc(v || '—') + '</b></div>'; };
  var d = document.createElement('div'); d.id = 'idPrint';
  d.innerHTML = '<div class="idc"><div class="idh"><div class="lg"><img src="assets/logo.svg" style="width:100%;height:100%;border-radius:10px"/></div><div><b>IRAA</b><small>Iqra Riffat ull Atfal Academy</small></div></div>' +
    '<div class="idb"><div class="phw"><img src="' + s.avatar + '"/></div><h3>' + esc(s.name) + '</h3><span class="idn">' + esc(s.id) + '</span><span class="tag">' + esc(clsLabel(s)) + '</span>' +
    '<div class="gr">' + row('Father', s.fatherName) + row('WhatsApp', s.phone) + row('Address', s.address) + '</div>' +
    '<img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(s.id) + '"/><small class="qs">Attendance ke liye scan karein</small></div>' +
    '<div class="idf">Yeh card hamesha saath rakhein</div></div>';
  document.body.appendChild(d);
  var imgs = Array.prototype.slice.call(d.querySelectorAll('img')), left = imgs.length, done = false;
  var go = function () { if (done) return; done = true; window.print(); setTimeout(function () { d.remove(); }, 500); };
  imgs.forEach(function (i) { if (i.complete) left--; else { i.onload = i.onerror = function () { if (--left <= 0) go(); }; } });
  if (left <= 0) go(); else setTimeout(go, 3000);
}

/* ---------- Type select: school mein section nahi, madarsa mein A-D ---------- */
function toggleMSec(sel, box) { document.getElementById(box).style.display = document.getElementById(sel).value === 'school' ? 'none' : ''; }

/* ---------- ID CARD SE ATTENDANCE ---------- */
function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function markAttendance(raw) {
  var id = String(raw || '').trim().toUpperCase(), s = findStudentById(id);
  if (!s) { Swal.fire({ icon: 'error', title: 'ID nahi mili', text: id || 'ID khali hai', timer: 2500, showConfirmButton: false }); return false; }
  var all = loadArr('sh_att', {}) || {}, k = todayKey(); all[k] = all[k] || {};
  var photo = '<img src="' + s.avatar + '" style="width:84px;height:84px;border-radius:50%;border:3px solid #0f766e"/>';
  var info = '<div class="mt-2"><b style="font-size:19px">' + esc(s.name) + '</b><br>' + esc(s.id) + ' • ' + esc(clsLabel(s)) + '</div>';
  if (all[k][s.id]) {
    Swal.fire({ icon: 'warning', title: 'Attendance pehle se mark hai', html: photo + info + '<div class="mt-2 text-muted">Aaj ' + all[k][s.id] + ' par lag chuki hai</div>', timer: 3200, showConfirmButton: false });
    return false;
  }
  var t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); all[k][s.id] = t; saveArr('sh_att', all);
  var a = s.attendance; a.present++; a.total++; a.percent = Math.round(a.present * 100 / a.total); if (a.week) a.week[(new Date().getDay() + 6) % 7] = 1;
  persist(); renderAttLog();
  notify(s.phone, s.name + ' ki attendance aaj ' + t + ' par lag gayi (Present).');
  Swal.fire({ icon: 'success', title: 'Attendance Mark ho gayi ✓', html: photo + info + '<div class="mt-2 text-success"><b>Present • ' + t + '</b></div>', timer: 2800, showConfirmButton: false });
  return true;
}
function manualScan() { var i = document.getElementById('manualId'); if (markAttendance(i.value) || i.value) i.value = ''; }
function renderAttLog() {
  var log = document.querySelector('#scanResultCard .scan-log'); if (!log) return;
  var day = (loadArr('sh_att', {}) || {})[todayKey()] || {}, ids = Object.keys(day).reverse();
  log.innerHTML = ids.length ? ids.map(function (id) { var s = findStudentById(id); if (!s) return '';
    return '<div class="d-flex justify-content-between align-items-center border-bottom py-2"><div class="stu-cell"><img class="avatar-sm" src="' + s.avatar + '"/><div><b style="font-size:13.5px;">' + esc(s.name) + '</b><span>' + s.id + '</span></div></div><span class="badge-soft bg-soft-success">' + day[id] + '</span></div>'; }).join('')
    : '<div class="muted text-center py-3">Aaj abhi kisi ki attendance nahi lagi</div>';
}
var camStream = null, camTimer = null, camBusy = 0;
function stopCam(btn) {
  clearInterval(camTimer); if (camStream) camStream.getTracks().forEach(function (t) { t.stop(); }); camStream = null;
  var v = document.getElementById('camVid'); if (v) v.remove();
  document.getElementById('scannerStage').classList.remove('scanning');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-video me-1"></i> Start Scanner';
}
function startCamScan(btn) {
  if (camStream) { stopCam(btn); return; }
  if (!window.BarcodeDetector || !navigator.mediaDevices) { toast('info', 'Is browser mein camera scan nahi', 'Chrome use karein, ya neeche ID likh kar Mark dabayen'); return; }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (st) {
    camStream = st; var stage = document.getElementById('scannerStage'), v = document.createElement('video');
    v.id = 'camVid'; v.setAttribute('playsinline', ''); v.muted = true; v.srcObject = st; stage.style.position = 'relative';
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;z-index:0';
    stage.prepend(v); v.play(); stage.classList.add('scanning'); btn.innerHTML = '<i class="fa-solid fa-square me-1"></i> Stop Scanner';
    var det = new BarcodeDetector({ formats: ['qr_code'] });
    camTimer = setInterval(function () {
      if (Date.now() < camBusy) return;
      det.detect(v).then(function (r) { if (r.length) { camBusy = Date.now() + 3500; markAttendance(r[0].rawValue); } }).catch(function () {});
    }, 500);
  }).catch(function () { toast('error', 'Camera allow nahi hua', 'Browser mein camera permission dein (https ya localhost chahiye)'); });
}

/* ---------- Admin: ek hi form (Add Student + Admission) ---------- */
function streamFields(p) {
  var st = $v(p + 'Type'); document.getElementById(p + 'ClsBox').style.display = st === 'madarsa' ? 'none' : '';
  document.getElementById(p + 'MSecBox').style.display = st === 'school' ? 'none' : '';
}
function stuFormHtml(p) {
  var c = ''; for (var i = 1; i <= 8; i++) c += '<option value="' + i + '">Class ' + i + '</option>';
  var f = function (md, id, lab, ph, type) { return '<div class="col-md-' + md + '"><label class="form-label small">' + lab + '</label><input class="form-control" type="' + (type || 'text') + '" id="' + p + id + '" placeholder="' + ph + '"/></div>'; };
  return '<div class="row g-3">' + f(6, 'Name', 'Full Name', 'e.g. Usman Ali') + f(6, 'Father', 'Father Name', 'e.g. Muhammad Ali') +
    '<div class="col-md-4"><label class="form-label small">Admission Type</label><select class="form-select" id="' + p + 'Type" onchange="streamFields(\'' + p + '\')"><option value="school">School</option><option value="madarsa">Madarsa</option><option value="both">School + Madarsa</option></select></div>' +
    '<div class="col-md-4" id="' + p + 'ClsBox"><label class="form-label small">Class</label><select class="form-select" id="' + p + 'Class">' + c + '</select></div>' +
    '<div class="col-md-4" id="' + p + 'MSecBox" style="display:none;"><label class="form-label small">Madarsa Section</label><select class="form-select" id="' + p + 'MSec"><option>A</option><option>B</option><option>C</option><option>D</option></select></div>' +
    f(4, 'Phone', 'WhatsApp Number', '03XXXXXXXXX') + f(4, 'Fee', 'Mahana Fee (Rs.) — aap tay karein', '2500', 'number') + f(12, 'Address', 'Address', 'City / Area') + '</div>';
}
function fillStuForms() {
  var a = document.getElementById('nsFormBox'); if (a && !a.innerHTML) { a.innerHTML = stuFormHtml('ns'); streamFields('ns'); }
  var b = document.getElementById('admFormBox');
  if (b && !b.innerHTML) { b.innerHTML = '<div class="card card-soft p-3 mb-4"><h5 class="section-title mb-3"><i class="fa-solid fa-user-plus me-2 text-primary"></i>Naya Admission Form</h5>' + stuFormHtml('ad') + '<button class="btn-grad mt-3" onclick="submitAdminAdmission()"><i class="fa-solid fa-check me-1"></i> Admission Karein</button></div>'; streamFields('ad'); }
}
function submitAdminAdmission() {
  var g = function (i) { return $v('ad' + i); }, fee = +g('Fee');
  if (!g('Name').trim() || !g('Phone').trim() || !(fee > 0)) { toast('error', 'Poora likhein', 'Naam, WhatsApp number aur mahana fee zaroori hain'); return; }
  var ad = submitAdmission({ name: g('Name').trim(), fatherName: g('Father').trim(), phone: g('Phone').trim(), address: g('Address').trim(), cls: g('Class'), stream: g('Type'), madarsaSection: g('MSec') });
  approveAdmission(ad.appId, fee);
  ['Name', 'Father', 'Phone', 'Fee', 'Address'].forEach(function (k) { document.getElementById('ad' + k).value = ''; });
  if (typeof renderAdmissions === 'function') renderAdmissions(); if (typeof buildStudentsTable === 'function') buildStudentsTable(); if (typeof updateNextId === 'function') updateNextId();
  Swal.fire({ icon: 'success', title: 'Admission ho gaya ✓', html: '<b>' + esc(ad.name) + '</b><br>ID: <b>' + ad.studentId + '</b> • Password: <b>' + ad.password + '</b><br>' + esc(clsLabel(ad)) + ' • Fee Rs. ' + fee +
    '<br><a target="_blank" href="' + waLink(ad.phone, 'IRAA: ' + ad.name + ' ka admission ho gaya. ID: ' + ad.studentId + ' Password: ' + ad.password) + '">WhatsApp par bhejein</a>' });
}

/* ---------- ATTENDANCE REPORT: Daily / Monthly / Class Wise ---------- */
var attM = 'daily';
function attMode(m) {
  attM = m; document.querySelectorAll('[data-am]').forEach(function (b) { b.classList.toggle('active', b.dataset.am === m); });
  document.getElementById('attDayBox').style.display = m === 'daily' ? '' : 'none'; document.getElementById('attMonBox').style.display = m === 'daily' ? 'none' : '';
  document.getElementById('attClsBox').style.display = m === 'class' ? 'none' : ''; renderAttendance();
}
function isoLocal(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function pctBadge(p) { return '<span class="badge-soft ' + (p >= 85 ? 'bg-soft-success' : p >= 75 ? 'bg-soft-warning' : 'bg-soft-danger') + '">' + p + '%</span>'; }
function attStat(icon, val, lab, bg) { return '<div class="col-6 col-lg-3"><div class="card card-soft p-3 d-flex flex-row align-items-center gap-3"><div class="stat-icon ' + bg + '"><i class="fa-solid fa-' + icon + '"></i></div><div><div class="stat-value" style="font-size:22px;">' + val + '</div><div class="stat-label">' + lab + '</div></div></div></div>'; }
function renderAttendance() {
  var dEl = document.getElementById('attDate'); if (!dEl) return; var mEl = document.getElementById('attMonth');
  if (!dEl.value) dEl.value = isoLocal(new Date()); if (!mEl.value) mEl.value = isoLocal(new Date()).slice(0, 7);
  var type = $v('attType'), cv = $v('attCls'), q = $v('attQ').trim().toLowerCase(), att = loadArr('sh_att', {}) || {};
  var inType = function (s) { var st = s.stream || 'school'; return !type || st === 'both' || st === type; };
  var inCls = function (s) { if (!cv) return true; var st = s.stream || 'school'; return cv.charAt(0) === 'C' ? (st !== 'madarsa' && +s.cls === +cv.slice(1)) : (st !== 'school' && (s.madarsaSection || 'A') === cv.charAt(1)); };
  var list = DEMO_STUDENTS.filter(function (s) { return inType(s) && (attM === 'class' || inCls(s)) && (!q || s.name.toLowerCase().indexOf(q) >= 0 || s.id.toLowerCase().indexOf(q) >= 0); });
  var head = document.getElementById('attHead'), body = document.getElementById('attBody'), stats = document.getElementById('attStats'), rows = '';
  var cell = function (s) { return '<td><div class="stu-cell"><img class="avatar-sm" src="' + s.avatar + '"/><div><b>' + esc(s.name) + '</b><span>' + s.id + '</span></div></div></td><td>' + esc(clsLabel(s)) + '</td>'; };
  if (attM === 'daily') {
    var p = dEl.value.split('-'), key = +p[0] + '-' + (+p[1]) + '-' + (+p[2]), day = att[key] || {}, has = Object.keys(day).length > 0, today = key === todayKey();
    var pres = list.filter(function (s) { return day[s.id]; }).length, abs = (has || today) ? list.length - pres : 0;
    stats.innerHTML = attStat('users', list.length, 'Students', 'bg-soft-primary') + attStat('user-check', pres, 'Present', 'bg-grad-success') + attStat('user-xmark', abs, 'Absent', 'bg-soft-danger') + attStat('chart-simple', (list.length && (has || today) ? Math.round(pres * 100 / list.length) : 0) + '%', 'Attendance Rate', 'bg-soft-info');
    head.innerHTML = '<tr><th>Student</th><th>Class</th><th>Check-in</th><th>Status</th><th></th></tr>';
    list.forEach(function (s) {
      var t = day[s.id], st = t ? '<span class="badge-soft bg-soft-success">Present</span>' : (has || today) ? '<span class="badge-soft bg-soft-danger">Absent</span>' : '<span class="badge-soft bg-soft-info">No record</span>';
      rows += '<tr>' + cell(s) + '<td>' + (t || '—') + '</td><td>' + st + '</td><td class="text-end">' + (!t && today ? '<button class="mini-btn btn-icon-success" title="Present lagayein" onclick="markAttendance(\'' + s.id + '\');renderAttendance()"><i class="fa-solid fa-check"></i></button>' : '') + '</td></tr>';
    });
    if (!has && !today) rows = '<tr><td colspan="5" class="text-center muted py-3">Is din ka koi attendance record nahi</td></tr>' + rows;
  } else {
    var mp = mEl.value.split('-'), prefix = +mp[0] + '-' + (+mp[1]) + '-', days = Object.keys(att).filter(function (k) { return k.indexOf(prefix) === 0; }), wd = days.length;
    var count = function (s) { return days.filter(function (k) { return att[k][s.id]; }).length; };
    if (attM === 'monthly') {
      var tot = 0, low = 0; list.forEach(function (s) { var c = count(s), pc = wd ? Math.round(c * 100 / wd) : 0; tot += pc; if (wd && pc < 75) low++; });
      stats.innerHTML = attStat('calendar-days', wd, 'Working Days', 'bg-soft-primary') + attStat('users', list.length, 'Students', 'bg-soft-info') + attStat('chart-simple', (list.length && wd ? Math.round(tot / list.length) : 0) + '%', 'Average Attendance', 'bg-grad-success') + attStat('triangle-exclamation', low, '75% se kam', 'bg-soft-danger');
      head.innerHTML = '<tr><th>Student</th><th>Class</th><th>Present Days</th><th>Working Days</th><th>Attendance</th></tr>';
      list.forEach(function (s) { var c = count(s); rows += '<tr>' + cell(s) + '<td class="fw-600">' + c + '</td><td>' + wd + '</td><td>' + (wd ? pctBadge(Math.round(c * 100 / wd)) : '—') + '</td></tr>'; });
    } else {
      var groups = [], add = function (label, f) { var l = list.filter(f); if (l.length) groups.push({ label: label, l: l }); };
      for (var c = 1; c <= 8; c++) (function (c) { add('Class ' + c, function (s) { return (s.stream || 'school') !== 'madarsa' && +s.cls === c; }); })(c);
      ['A', 'B', 'C', 'D'].forEach(function (x) { add('Madarsa Section ' + x, function (s) { return (s.stream || 'school') !== 'school' && (s.madarsaSection || 'A') === x; }); });
      var gp = groups.map(function (g) { var pr = 0; g.l.forEach(function (s) { pr += count(s); }); g.pr = pr; g.pc = wd && g.l.length ? Math.round(pr * 100 / (wd * g.l.length)) : 0; return g; });
      var best = gp.slice().sort(function (a, b) { return b.pc - a.pc; })[0];
      stats.innerHTML = attStat('calendar-days', wd, 'Working Days', 'bg-soft-primary') + attStat('layer-group', gp.length, 'Classes / Sections', 'bg-soft-info') + attStat('users', list.length, 'Students', 'bg-soft-warning') + attStat('trophy', best && wd ? best.label.replace('Madarsa Section', 'Madarsa') : '—', 'Sab se behtar', 'bg-grad-success');
      head.innerHTML = '<tr><th>Class / Section</th><th>Students</th><th>Working Days</th><th>Total Present</th><th>Average</th></tr>';
      gp.forEach(function (g) { rows += '<tr><td><b>' + g.label + '</b></td><td>' + g.l.length + '</td><td>' + wd + '</td><td>' + g.pr + '</td><td>' + (wd ? pctBadge(g.pc) : '—') + '</td></tr>'; });
    }
    if (!wd) rows = '<tr><td colspan="5" class="text-center muted py-3">Is mahine ka koi attendance record nahi — ID card scan hone par yahan aayega</td></tr>' + rows;
  }
  body.innerHTML = rows || '<tr><td colspan="5" class="text-center muted py-3">Koi student nahi mila</td></tr>';
}
