'use strict';

/* =============================================================
   0. 시각 효과 유틸
============================================================= */
/* ── 배경 별 ── */
function createStarfield() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.45';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 130; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.5})`;
    ctx.fill();
  }
}

/* ── 브랜드 타이핑 ── */
function runTypewriter(el, text, speed = 110) {
  const chars = Array.from(text);
  el.style.whiteSpace = 'pre-line';
  el.textContent = text;
  el.style.minHeight = el.offsetHeight + 'px';
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'brand-cursor';
  cursor.style.height = '1em';
  el.appendChild(cursor);
  let i = 0;
  const timer = setInterval(() => {
    el.insertBefore(document.createTextNode(chars[i]), cursor);
    i++;
    if (i >= chars.length) { clearInterval(timer); setTimeout(() => cursor.remove(), 1200); }
  }, speed);
}

function initTypewriter() {
  const sidebar = document.querySelector('.sidebar__brand');
  const auth    = document.querySelector('.auth-brand');
  if (sidebar) runTypewriter(sidebar, '👊\n수란이\n딴짓하면\n꿀밤!');
  if (auth)    runTypewriter(auth,    '👊\n수란이 딴짓하면 꿀밤!');
}

/* ── 숫자 카운트업 ── */
function animateCount(el, target, suffix = '', duration = 700) {
  const from  = parseInt(el.textContent) || 0;
  const start = performance.now();
  const tick  = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const wave = document.createElement('span');
  wave.className = 'ripple-wave';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(wave);
  wave.addEventListener('animationend', () => wave.remove());
}, true);


/* =============================================================
   1. Supabase 초기화
============================================================= */
const SUPABASE_URL = 'https://pninjyqcaxlywumyoupw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tmJVJ20iWTYd262LAvBa0w_t_oRznCa';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* =============================================================
   2. 상수 & 기본 데이터
============================================================= */
const WEEKS = Array.from({ length: 24 }, (_, i) => i + 1);
const WEEK_BASE_START = new Date('2026-05-11');

const SUBJECTS = {
  wireless:    { label: '📡 무선공학', cls: 'wireless' },
  electronics: { label: '⚡ 전자공학', cls: 'electronics' },
  comms:       { label: '📶 통신공학', cls: 'comms' },
};

const DAILY_EMOJIS = ['📕', '📗', '📘', '📙', '📖', '📒', '✏️', '📝'];

const CUSTOM_COLORS = [
  '#f87171', '#facc15', '#4ade80',
  '#f472b6', '#2dd4bf', '#a3e635', '#e879f9',
];

const DEFAULT_COURSES = [
  { subject:'electronics', name:'전자공학', week:1, status:'default', progress:'1강',  duration:'31분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'electronics', name:'전자공학', week:1, status:'default', progress:'2강',  duration:'40분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'electronics', name:'전자공학', week:1, status:'default', progress:'3강',  duration:'38분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'electronics', name:'전자공학', week:1, status:'default', progress:'4강',  duration:'48분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'electronics', name:'전자공학', week:2, status:'default', progress:'5강',  duration:'45분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'electronics', name:'전자공학', week:2, status:'default', progress:'6강',  duration:'30분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'electronics', name:'전자공학', week:2, status:'default', progress:'7강',  duration:'38분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'electronics', name:'전자공학', week:2, status:'default', progress:'8강',  duration:'55분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'electronics', name:'전자공학', week:3, status:'default', progress:'9강',  duration:'42분',       startDate:'2026-05-25', endDate:'2026-05-31' },
  { subject:'electronics', name:'전자공학', week:3, status:'default', progress:'10강', duration:'39분',       startDate:'2026-05-25', endDate:'2026-05-31' },
  { subject:'electronics', name:'전자공학', week:3, status:'default', progress:'11강', duration:'1시간 15분', startDate:'2026-05-25', endDate:'2026-05-31' },
  { subject:'electronics', name:'전자공학', week:4, status:'default', progress:'12강', duration:'43분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'electronics', name:'전자공학', week:4, status:'default', progress:'13강', duration:'44분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'electronics', name:'전자공학', week:4, status:'default', progress:'14강', duration:'23분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'electronics', name:'월말고사',  week:4, status:'default', progress:'',    duration:'40분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'electronics', name:'전자공학', week:5, status:'default', progress:'15강', duration:'38분',       startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'electronics', name:'전자공학', week:5, status:'default', progress:'16강', duration:'29분',       startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'electronics', name:'전자공학', week:5, status:'default', progress:'17강', duration:'36분',       startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'electronics', name:'전자공학', week:5, status:'default', progress:'18강', duration:'1시간 3분',  startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'electronics', name:'전자공학',     week:6, status:'default', progress:'19강', duration:'',      startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'electronics', name:'최종 모의고사', week:6, status:'default', progress:'',    duration:'33분',   startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'comms', name:'통신공학', week:1, status:'default', progress:'1강',  duration:'31분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'comms', name:'통신공학', week:1, status:'default', progress:'2강',  duration:'36분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'comms', name:'통신공학', week:1, status:'default', progress:'3강',  duration:'35분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'comms', name:'통신공학', week:1, status:'default', progress:'4강',  duration:'44분',       startDate:'2026-05-11', endDate:'2026-05-17' },
  { subject:'comms', name:'통신공학', week:2, status:'default', progress:'5강',  duration:'43분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'comms', name:'통신공학', week:2, status:'default', progress:'6강',  duration:'1시간 27분', startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'comms', name:'통신공학', week:2, status:'default', progress:'7강',  duration:'44분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'comms', name:'통신공학', week:2, status:'default', progress:'8강',  duration:'20분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'comms', name:'통신공학', week:2, status:'default', progress:'9강',  duration:'10분',       startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'comms', name:'통신공학', week:2, status:'default', progress:'10강', duration:'1시간 21분', startDate:'2026-05-18', endDate:'2026-05-24' },
  { subject:'comms', name:'통신공학', week:3, status:'default', progress:'11강', duration:'52분',       startDate:'2026-05-25', endDate:'2026-05-31' },
  { subject:'comms', name:'통신공학', week:3, status:'default', progress:'12강', duration:'37분',       startDate:'2026-05-25', endDate:'2026-05-31' },
  { subject:'comms', name:'통신공학', week:3, status:'default', progress:'13강', duration:'59분',       startDate:'2026-05-25', endDate:'2026-05-31' },
  { subject:'comms', name:'통신공학', week:4, status:'default', progress:'14강', duration:'44분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'comms', name:'통신공학', week:4, status:'default', progress:'15강', duration:'48분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'comms', name:'통신공학', week:4, status:'default', progress:'16강', duration:'57분',       startDate:'2026-06-01', endDate:'2026-06-07' },
  { subject:'comms', name:'월말평가',  week:5, status:'default', progress:'',    duration:'36분',       startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'comms', name:'통신공학', week:5, status:'default', progress:'17강', duration:'52분',       startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'comms', name:'통신공학', week:5, status:'default', progress:'18강', duration:'52분',       startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'comms', name:'통신공학', week:6, status:'default', progress:'19강', duration:'48분',       startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'comms', name:'통신공학', week:6, status:'default', progress:'20강', duration:'38분',       startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'comms', name:'통신공학', week:6, status:'default', progress:'21강', duration:'55분',       startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'comms', name:'통신공학', week:7, status:'default', progress:'22강', duration:'54분',       startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'comms', name:'통신공학', week:7, status:'default', progress:'23강', duration:'41분',       startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'comms', name:'통신공학', week:7, status:'default', progress:'24강', duration:'48분',       startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'wireless', name:'월말고사',    week:5, status:'default', progress:'',    duration:'38분',  startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'wireless', name:'무선공학',    week:5, status:'default', progress:'17강', duration:'38분',  startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'wireless', name:'무선공학',    week:5, status:'default', progress:'18강', duration:'52분',  startDate:'2026-06-08', endDate:'2026-06-14' },
  { subject:'wireless', name:'무선공학',    week:6, status:'default', progress:'19강', duration:'1시간', startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'wireless', name:'무선공학',    week:6, status:'default', progress:'20강', duration:'40분',  startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'wireless', name:'무선공학',    week:6, status:'default', progress:'21강', duration:'46분',  startDate:'2026-06-15', endDate:'2026-06-21' },
  { subject:'wireless', name:'무선공학',    week:7, status:'default', progress:'22강', duration:'54분',  startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'wireless', name:'무선공학',    week:7, status:'default', progress:'23강', duration:'46분',  startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'wireless', name:'무선공학',    week:7, status:'default', progress:'24강', duration:'54분',  startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'wireless', name:'무선공학',    week:7, status:'default', progress:'25강', duration:'55분',  startDate:'2026-06-22', endDate:'2026-06-28' },
  { subject:'wireless', name:'무선공학',    week:8, status:'default', progress:'26강', duration:'27분',  startDate:'2026-06-29', endDate:'2026-07-05' },
  { subject:'wireless', name:'최종모의고사', week:8, status:'default', progress:'',    duration:'21분',  startDate:'2026-06-29', endDate:'2026-07-05' },
];

/* =============================================================
   3. 앱 상태
============================================================= */
let courses       = [];
let activeWeek    = 2;
let activeSubject = 'all';
let currentUser   = null;
let isAdmin       = false;
let viewingUserId = null;
let eventsBound   = false;
let loggingIn     = false; // 동시 로그인 처리 방지

const today    = new Date();
let calYear    = today.getFullYear();
let calMonth   = today.getMonth();

// 문제 풀이
let dailyNotes        = {}; // { 'YYYY-MM-DD': { memo, todos:[{emoji,text,done}] } }
let dailyAddRows      = []; // 풀이 추가 모달 행 목록
let dailyCheckDate    = null;
let dailyCheckTodos   = [];

/* =============================================================
   4. 유틸리티
============================================================= */
const $ = (id) => document.getElementById(id);

function fmtDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function esc(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str || '').replace(/[&<>"']/g, ch => map[ch]);
}

function dayToGridCol(date) {
  const dow = date.getDay();
  return dow === 0 ? 7 : dow;
}

const todayStr = fmtDate(today);

function getWeekRange(week) {
  const start = new Date(WEEK_BASE_START);
  start.setDate(WEEK_BASE_START.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: fmtDate(start), end: fmtDate(end) };
}

function detectWeekFromDate(dateStr) {
  const d = new Date(dateStr);
  const diffDays = Math.floor((d - WEEK_BASE_START) / 86400000);
  if (diffDays < 0) return 1;
  return Math.min(Math.floor(diffDays / 7) + 1, 24);
}

function toDbRow(course, userId) {
  return {
    id:         course.id,
    user_id:    userId,
    subject:    course.subject   || null,
    name:       course.name      || '',
    week:       course.week      || 1,
    status:     course.status    || 'default',
    progress:   course.progress  || '',
    duration:   course.duration  || '',
    start_date: course.startDate || null,
    end_date:   course.endDate   || null,
    color:      course.color     || null,
  };
}

function fromDbRow(row) {
  return {
    id:        row.id,
    subject:   row.subject    || '',
    name:      row.name       || '',
    week:      row.week       || 1,
    status:    row.status     || 'default',
    progress:  row.progress   || '',
    duration:  row.duration   || '',
    startDate: row.start_date || '',
    endDate:   row.end_date   || '',
    color:     row.color      || null,
  };
}

/* =============================================================
   5. 데이터 (Supabase)
============================================================= */
async function loadCourses(userId) {
  console.log('[loadCourses] 시작, userId:', userId);
  const isViewingOther = isAdmin && currentUser && userId !== currentUser.id;

  const baseQuery = isViewingOther
    ? sb.rpc('get_courses_for_user', { target_user_id: userId })
    : sb.from('courses').select('*').eq('user_id', userId).order('week').order('created_at');

  const { data, error } = await Promise.race([
    baseQuery,
    new Promise(resolve => setTimeout(() => resolve({ data: null, error: new Error('courses 쿼리 타임아웃') }), 10000)),
  ]);

  console.log('[loadCourses] 결과:', { count: data?.length ?? 'null', error: error?.message ?? null });

  if (error) { console.error('loadCourses 오류:', error); return; }

  if (!data || data.length === 0) {
    if (isViewingOther) { courses = []; return; }

    // 구버전 localStorage 데이터 마이그레이션 (없으면 빈 상태로 시작)
    const stored = localStorage.getItem('schedule_v8');
    if (stored) {
      const source = JSON.parse(stored);
      const toInsert = source.map(c => toDbRow({ ...c, id: crypto.randomUUID() }, userId));
      const { data: inserted, error: insertErr } = await sb
        .from('courses').insert(toInsert).select();
      if (insertErr) { console.error('insertDefaults:', insertErr); return; }
      courses = (inserted || []).map(fromDbRow);
      localStorage.removeItem('schedule_v8');
      console.log('[loadCourses] localStorage 마이그레이션:', courses.length, '개');
    } else {
      courses = [];
      console.log('[loadCourses] 새 계정 빈 상태로 시작');
    }
  } else {
    courses = data.map(fromDbRow);
    console.log('[loadCourses] 로드 완료:', courses.length, '개');
  }
}

async function saveCourse(course) {
  const uid = viewingUserId || currentUser.id;
  const { error } = await sb
    .from('courses')
    .upsert(toDbRow(course, uid));
  if (error) console.error('saveCourse:', error);
}

async function removeCourse(id) {
  const { error } = await sb.from('courses').delete().eq('id', id);
  if (error) console.error('removeCourse:', error);
}

/* =============================================================
   5-b. 문제 풀이 데이터 (Supabase)
============================================================= */
async function loadDailyNotes(userId) {
  const y = calYear;
  const m = String(calMonth + 1).padStart(2, '0');
  const from = `${y}-${m}-01`;
  const to   = `${y}-${m}-31`;

  const { data, error } = await sb
    .from('daily_notes')
    .select('date, memo, todos')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);

  if (error) { console.error('loadDailyNotes:', error); return; }
  dailyNotes = {};
  (data || []).forEach(row => {
    dailyNotes[row.date] = { memo: row.memo || '', todos: row.todos || [] };
  });
}

async function saveDailyNote(date, memo, todos) {
  const uid = currentUser.id;
  const { error } = await sb.from('daily_notes').upsert(
    { user_id: uid, date, memo, todos, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,date' }
  );
  if (error) console.error('saveDailyNote:', error);
}

async function deleteDailyNote(date) {
  const { error } = await sb.from('daily_notes')
    .delete().eq('user_id', currentUser.id).eq('date', date);
  if (error) console.error('deleteDailyNote:', error);
}

/* =============================================================
   5-c. 버그 리포트 데이터 (Supabase)
============================================================= */
async function submitBugReport(type, message) {
  const { error } = await sb.from('bug_reports').insert({
    user_id:    currentUser.id,
    user_email: currentUser.email,
    type,
    message,
  });
  return error;
}

async function loadBugReports() {
  const { data, error } = await sb.rpc('get_all_bug_reports');
  if (error) { console.error('loadBugReports:', error); return []; }
  return data || [];
}

async function markBugReportRead(id) {
  const { error } = await sb.rpc('mark_bug_report_read', { report_id: id });
  if (error) console.error('markBugReportRead:', error);
}

async function refreshBugBadge() {
  if (!isAdmin) return;
  const { data } = await sb.from('bug_reports').select('id').eq('is_read', false);
  const count = data?.length ?? 0;
  const badge = $('bug-unread-badge');
  if (!badge) return;
  if (count > 0) { badge.style.display = ''; badge.textContent = count; }
  else           { badge.style.display = 'none'; }
}

/* =============================================================
   6. UI 헬퍼
============================================================= */
function periodLabel(startDate, endDate) {
  if (!endDate) return '-';
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const end       = new Date(endDate); end.setHours(0, 0, 0, 0);
  const fmt       = (d) => `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  const diffDays  = Math.round((end - todayDate) / 86400000);
  let badge = '';
  if (diffDays === 0)    badge = ' <span class="d-badge d-badge--near">D-day</span>';
  else if (diffDays > 0) badge = ` <span class="d-badge${diffDays<=7?' d-badge--near':''}">D-${diffDays}</span>`;
  else                   badge = ` <span class="d-badge d-badge--over">D+${Math.abs(diffDays)}</span>`;
  const startStr = startDate ? fmt(new Date(startDate)) : '-';
  return `${startStr} ~ ${fmt(end)}${badge}`;
}

function statusBadge(status) {
  const map = {
    default: ['기본', 'badge--default'],
    delayed: ['밀림', 'badge--delayed'],
    done:    ['완료', 'badge--done'],
  };
  const [label, cls] = map[status] || map.default;
  return `<span class="badge ${cls}">${label}</span>`;
}

function subjectBadge(subject, color) {
  const info = SUBJECTS[subject];
  if (info) return `<span class="subject-badge subject-badge--${info.cls}">${info.label}</span>`;
  const c = color || '#94a3b8';
  return `<span class="subject-badge" style="background:${c}26;color:${c};border:1px solid ${c}4d">${esc(subject)}</span>`;
}

/* =============================================================
   7. 스케줄 뷰
============================================================= */
function updateSummary() {
  const total   = courses.length;
  const done    = courses.filter(c => c.status === 'done').length;
  const delayed = courses.filter(c => c.status === 'delayed').length;
  const rate    = total ? Math.round(done / total * 100) : 0;
  animateCount($('total-count'),   total);
  animateCount($('done-count'),    done);
  animateCount($('delayed-count'), delayed);
  animateCount($('overall-rate'),  rate, '%');
  $('overall-bar').style.width = rate + '%';
}

function renderWeekTabs() {
  const nav = $('week-tabs');
  nav.innerHTML = '';
  WEEKS.forEach(week => {
    const count = courses.filter(c =>
      c.week === week && (activeSubject === 'all' || c.subject === activeSubject)
    ).length;
    const btn = document.createElement('button');
    btn.className = `week-tab${week === activeWeek ? ' active' : ''}`;
    btn.innerHTML = `${week}주차${count ? `<span class="tab-count">(${count})</span>` : ''}`;
    btn.addEventListener('click', () => { activeWeek = week; renderSchedule(); });
    nav.appendChild(btn);
  });
  const activeTab = nav.querySelector('.week-tab.active');
  if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function renderTableRows() {
  const tbody      = $('table-body');
  const emptyState = $('empty-state');
  const table      = $('schedule-table');

  let list = courses.filter(c => c.week === activeWeek);
  if (activeSubject !== 'all') list = list.filter(c => c.subject === activeSubject);

  const SUBJECT_ORDER = { electronics: 0, comms: 1, wireless: 2 };
  list.sort((a, b) => {
    const sa = SUBJECT_ORDER[a.subject] ?? 99;
    const sb = SUBJECT_ORDER[b.subject] ?? 99;
    if (sa !== sb) return sa - sb;
    // 커스텀 과목끼리는 과목명으로 묶기
    if (sa === 99 && a.subject !== b.subject) return a.subject.localeCompare(b.subject, 'ko');
    const ap = parseInt(a.progress) || 9999;
    const bp = parseInt(b.progress) || 9999;
    return ap - bp;
  });

  if (!list.length) {
    tbody.innerHTML = '';
    table.style.display = 'none';
    emptyState.classList.add('visible');
    return;
  }

  table.style.display = '';
  emptyState.classList.remove('visible');

  tbody.innerHTML = list.map(course => {
    const isDone = course.status === 'done';
    return `<tr class="row--${course.subject||''} ${isDone ? 'row--done' : ''}">
      <td><button class="check-btn ${isDone ? 'checked' : ''}" data-check="${course.id}" title="완료 토글">✔</button></td>
      <td>${subjectBadge(course.subject, course.color)}</td>
      <td class="col-name">${esc(course.name)}</td>
      <td class="col-progress">${esc(course.progress)||'-'}</td>
      <td class="col-duration">${esc(course.duration)||'-'}</td>
      <td class="col-deadline">${periodLabel(course.startDate, course.endDate)}</td>
      <td>${statusBadge(course.status)}</td>
      <td>
        <button class="btn btn--icon" data-edit="${course.id}" title="수정">✏️</button>
        <button class="btn btn--icon btn--delay" data-delay="${course.id}" title="1주 밀기">➡️</button>
        <button class="btn btn--icon" data-del="${course.id}" title="삭제">🗑</button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-check]').forEach(btn =>
    btn.addEventListener('click', () => toggleDone(btn.dataset.check))
  );
  tbody.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.edit))
  );
  tbody.querySelectorAll('[data-delay]').forEach(btn =>
    btn.addEventListener('click', () => delayCourse(btn.dataset.delay))
  );
  tbody.querySelectorAll('[data-del]').forEach(btn =>
    btn.addEventListener('click', () => deleteCourse(btn.dataset.del))
  );
}

function renderSchedule() {
  updateSummary();
  renderWeekTabs();
  renderTableRows();
}

async function toggleDone(id) {
  const course = courses.find(c => c.id === id);
  if (!course) return;
  course.status = course.status === 'done' ? 'default' : 'done';
  await saveCourse(course);
  renderSchedule();
  renderCalendar();
}

async function deleteCourse(id) {
  if (!confirm('이 강의를 삭제할까요?')) return;
  courses = courses.filter(c => c.id !== id);
  await removeCourse(id);
  renderSchedule();
  renderCalendar();
}

async function delayCourse(id) {
  const course = courses.find(c => c.id === id);
  if (!course) return;
  course.status = 'delayed';
  course.week = Math.min((course.week || 1) + 1, 24);
  if (course.startDate) {
    const d = new Date(course.startDate);
    d.setDate(d.getDate() + 7);
    course.startDate = fmtDate(d);
  }
  if (course.endDate) {
    const d = new Date(course.endDate);
    d.setDate(d.getDate() + 7);
    course.endDate = fmtDate(d);
  }
  activeWeek = course.week;
  await saveCourse(course);
  renderSchedule();
  renderCalendar();
}

/* =============================================================
   8. 달력 뷰
============================================================= */
function buildDayCells(week) {
  return week.map((date, i) => {
    const dateStr = fmtDate(date);
    const inMonth = date.getMonth() === calMonth;
    const isToday = dateStr === todayStr;
    const dow     = date.getDay();
    const cls = [
      'cal-day',
      !inMonth ? 'cal-day--other' : '',
      dow === 6 ? 'cal-day--sat' : '',
      dow === 0 ? 'cal-day--sun' : '',
      isToday   ? 'cal-day--today' : '',
    ].filter(Boolean).join(' ');

    return `<div class="${cls}" data-date="${dateStr}" style="grid-column:${i+1}; grid-row:1 / -1">
      <span class="cal-day__num">${date.getDate()}</span>
    </div>`;
  }).join('');
}

function buildEmojiCells(week, emojiRow) {
  return week.map((date, i) => {
    const dateStr = fmtDate(date);
    if (date.getMonth() !== calMonth) return '';
    const note = dailyNotes[dateStr];
    if (!note || !note.todos || !note.todos.length) return '';
    const emojisHtml = note.todos.map(t =>
      `<span class="cal-day__emoji${t.done ? ' cal-day__emoji--done' : ''}">${t.emoji}</span>`
    ).join('');
    return `<div class="cal-day__emojis" style="grid-column:${i+1};grid-row:${emojiRow}">${emojisHtml}</div>`;
  }).join('');
}

function buildEventBars(weekCourses, weekStart, weekEnd) {
  const bySubject = {};
  weekCourses.forEach(course => {
    if (!bySubject[course.subject]) bySubject[course.subject] = { total:0, done:0, minStart:course.startDate, maxEnd:course.endDate, week:course.week, color:course.color };
    bySubject[course.subject].total++;
    if (course.status === 'done') bySubject[course.subject].done++;
    if (course.startDate && course.startDate < bySubject[course.subject].minStart)
      bySubject[course.subject].minStart = course.startDate;
    if (course.endDate && course.endDate > bySubject[course.subject].maxEnd)
      bySubject[course.subject].maxEnd = course.endDate;
  });
  const weekStartStr = fmtDate(weekStart);
  const weekEndStr   = fmtDate(weekEnd);
  return Object.entries(bySubject).map(([subject, info], idx) => {
    const subjectInfo = SUBJECTS[subject];
    const icon    = subjectInfo ? subjectInfo.label.split(' ')[0] : '';
    const name    = subjectInfo ? subjectInfo.label.split(' ').slice(1).join(' ') : subject;
    const allDone = info.done === info.total;
    const countLabel = Array.from({ length: info.total }, (_, i) => i < info.done ? '👏' : '◻️').join('');
    const isFirstWeek = !info.minStart || info.minStart >= weekStartStr;
    const isLastWeek  = !info.maxEnd   || info.maxEnd   <= weekEndStr;
    let segClass = '';
    if (isFirstWeek && !isLastWeek)       segClass = ' cal-event--first-seg';
    else if (!isFirstWeek && isLastWeek)  segClass = ' cal-event--last-seg';
    else if (!isFirstWeek && !isLastWeek) segClass = ' cal-event--mid-seg';
    const evStart  = info.minStart ? new Date(info.minStart) : new Date(weekStart);
    const evEnd    = info.maxEnd   ? new Date(info.maxEnd)   : weekEnd;
    const effStart = evStart < weekStart ? weekStart : evStart;
    const effEnd   = evEnd   > weekEnd   ? weekEnd   : evEnd;
    const colStart = dayToGridCol(effStart);
    const colEnd   = dayToGridCol(effEnd) + 1;
    const weekNum     = info.week ?? '';
    const subjectCls  = SUBJECTS[subject] ? subject : 'custom';
    const customColor = !SUBJECTS[subject] ? (info.color || '#94a3b8') : null;
    const extraStyle  = customColor
      ? `;background:${customColor}2e;color:${customColor};border-left-color:${customColor};border-right-color:${customColor}`
      : '';
    return `<div class="cal-event cal-event--${subjectCls}${allDone?' cal-event--done':''}${segClass}"
      style="grid-column:${colStart}/${colEnd};grid-row:${idx+2}${extraStyle}"
      data-week="${weekNum}" data-subject="${subject}">
      <span class="cal-event__icon">${isFirstWeek ? icon : ''}</span>
      <span class="cal-event__name">${isFirstWeek ? name : ''}</span>
      <span class="cal-event__count">${isFirstWeek ? countLabel : ''}</span>
      ${isFirstWeek && allDone ? '<span class="cal-event__done-mark">✔</span>' : ''}
      <span class="cal-event__week">${isLastWeek && weekNum ? `${weekNum}주차` : ''}</span>
    </div>`;
  }).join('');
}

function renderCalendar() {
  const grid = $('cal-grid');
  if (!grid) return;
  const firstOfMonth = new Date(calYear, calMonth, 1);
  const startDow     = firstOfMonth.getDay();
  const calStart     = new Date(firstOfMonth);
  calStart.setDate(calStart.getDate() - (startDow === 0 ? 6 : startDow - 1));
  const lastOfMonth  = new Date(calYear, calMonth + 1, 0);
  const endDow       = lastOfMonth.getDay();
  const calEnd       = new Date(lastOfMonth);
  calEnd.setDate(calEnd.getDate() + (endDow === 0 ? 0 : 7 - endDow));
  let html = '';
  const cur = new Date(calStart);
  while (cur <= calEnd) {
    const week = Array.from({ length: 7 }, () => {
      const d = new Date(cur);
      cur.setDate(cur.getDate() + 1);
      return d;
    });
    const weekSun    = week[6];
    const weekMonStr = fmtDate(week[0]);
    const weekSunStr = fmtDate(weekSun);
    const weekCourses = courses.filter(course => {
      const s = course.startDate || course.endDate;
      const e = course.endDate   || course.startDate;
      return s && e && s <= weekSunStr && e >= weekMonStr;
    });
    const subjectCount = new Set(weekCourses.map(c => c.subject)).size;
    const emojiRow    = subjectCount + 2;
    const emojiMin    = Math.max(0, 108 - subjectCount * 36);
    const emojiMinSm  = Math.max(0, 78  - subjectCount * 26);
    const eventPart   = Array(subjectCount).fill('36px').join(' ');
    const eventPartSm = Array(subjectCount).fill('26px').join(' ');
    const rows   = ['36px', eventPart, `minmax(${emojiMin}px,auto)`].filter(Boolean).join(' ');
    const rowsSm = ['26px', eventPartSm, `minmax(${emojiMinSm}px,auto)`].filter(Boolean).join(' ');
    html += `<div class="cal-week" style="--rows:${rows};--rows-sm:${rowsSm}">${buildDayCells(week)}${buildEventBars(weekCourses, week[0], weekSun)}${buildEmojiCells(week, emojiRow)}</div>`;
  }
  grid.innerHTML = html;
  $('cal-month-label').textContent =
    new Date(calYear, calMonth).toLocaleDateString('ko-KR', { year:'numeric', month:'long' });

  // 커스텀 과목 범례 동적 생성
  const legend = $('cal-legend');
  legend.querySelectorAll('.cal-legend__item--custom').forEach(el => el.remove());
  const customSeen = {};
  courses.forEach(c => {
    if (!SUBJECTS[c.subject] && c.subject && !customSeen[c.subject]) {
      customSeen[c.subject] = c.color || '#94a3b8';
    }
  });
  Object.entries(customSeen).forEach(([subject, color]) => {
    const span = document.createElement('span');
    span.className = 'cal-legend__item cal-legend__item--custom';
    span.style.color = color;
    span.textContent = subject;
    legend.appendChild(span);
  });
}

/* =============================================================
   8-b. 풀이 추가 / 날짜 체크
============================================================= */
function renderDailyAddRows() {
  const container = $('daily-add-rows');
  container.innerHTML = dailyAddRows.map((row, i) => `
    <div class="daily-add-row">
      <div class="daily-row-emojis">
        ${DAILY_EMOJIS.map(emoji =>
          `<button type="button" class="emoji-btn-sm${emoji === row.emoji ? ' selected' : ''}" data-row="${i}" data-emoji="${emoji}">${emoji}</button>`
        ).join('')}
      </div>
      <div class="daily-row-bottom">
        <input type="text" class="form-input daily-row-text" data-row="${i}"
          placeholder="할 일을 입력하세요" value="${esc(row.text)}" maxlength="60">
        ${dailyAddRows.length > 1
          ? `<button type="button" class="btn btn--icon daily-row-del" data-row="${i}">🗑</button>`
          : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.emoji-btn-sm').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.row);
      dailyAddRows[idx].emoji = btn.dataset.emoji;
      container.querySelectorAll(`.emoji-btn-sm[data-row="${idx}"]`).forEach(b =>
        b.classList.toggle('selected', b.dataset.emoji === btn.dataset.emoji)
      );
    });
  });

  container.querySelectorAll('.daily-row-text').forEach(input => {
    input.addEventListener('input', () => {
      dailyAddRows[Number(input.dataset.row)].text = input.value;
    });
  });

  container.querySelectorAll('.daily-row-del').forEach(btn => {
    btn.addEventListener('click', () => {
      dailyAddRows.splice(Number(btn.dataset.row), 1);
      renderDailyAddRows();
    });
  });
}

function openDailyAddModal(prefillDate) {
  $('daily-add-date').value = prefillDate || todayStr;
  dailyAddRows = [{ emoji: DAILY_EMOJIS[0], text: '' }];
  renderDailyAddRows();
  $('daily-add-overlay').classList.add('open');
  setTimeout(() => {
    const first = $('daily-add-rows').querySelector('.daily-row-text');
    if (first) first.focus();
  }, 50);
}

function closeDailyAddModal() {
  $('daily-add-overlay').classList.remove('open');
}

async function handleDailyAddSubmit(e) {
  e.preventDefault();
  const date = $('daily-add-date').value;
  if (!date) return;

  // 입력값 최종 동기화
  $('daily-add-rows').querySelectorAll('.daily-row-text').forEach(input => {
    dailyAddRows[Number(input.dataset.row)].text = input.value.trim();
  });

  const validRows = dailyAddRows.filter(r => r.text);
  if (!validRows.length) return;

  const existing     = dailyNotes[date] || { memo: '', todos: [] };
  const newTodos     = validRows.map(r => ({ emoji: r.emoji, text: r.text, done: false }));
  const updatedTodos = [...existing.todos, ...newTodos];
  await saveDailyNote(date, existing.memo, updatedTodos);
  dailyNotes[date]   = { memo: existing.memo, todos: updatedTodos };

  closeDailyAddModal();
  renderCalendar();
}

function openDailyCheckModal(dateStr) {
  const note = dailyNotes[dateStr];
  if (!note || !note.todos || note.todos.length === 0) {
    openDailyAddModal(dateStr);
    return;
  }
  dailyCheckDate  = dateStr;
  dailyCheckTodos = note.todos.map(t => ({ ...t }));

  const date  = new Date(dateStr + 'T00:00:00');
  $('daily-check-title').textContent =
    date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  renderDailyCheckList();
  $('daily-check-overlay').classList.add('open');
}

function closeDailyCheckModal() {
  $('daily-check-overlay').classList.remove('open');
  dailyCheckDate = null;
}

function renderDailyCheckList() {
  const list = $('daily-check-list');
  list.innerHTML = dailyCheckTodos.map((todo, i) => `
    <div class="daily-check-item">
      <span class="daily-check-emoji${todo.done ? ' done' : ''}">${todo.emoji}</span>
      <span class="daily-check-text${todo.done ? ' done' : ''}">${esc(todo.text)}</span>
      <input type="checkbox" class="daily-check-cb" data-idx="${i}" ${todo.done ? 'checked' : ''}>
      <button type="button" class="btn btn--icon daily-check-edit" data-idx="${i}" title="수정">✏️</button>
      <button type="button" class="btn btn--icon daily-check-del" data-idx="${i}" title="삭제">🗑</button>
    </div>
  `).join('');
  list.querySelectorAll('.daily-check-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      dailyCheckTodos[Number(cb.dataset.idx)].done = cb.checked;
      renderDailyCheckList();
    });
  });
  list.querySelectorAll('.daily-check-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = Number(btn.dataset.idx);
      const item   = btn.closest('.daily-check-item');
      const textEl = item.querySelector('.daily-check-text');
      const input  = document.createElement('input');
      input.type      = 'text';
      input.className = 'form-input daily-check-edit-input';
      input.value     = dailyCheckTodos[idx].text;
      textEl.replaceWith(input);
      btn.style.display = 'none';
      input.focus();
      const save = () => {
        const trimmed = input.value.trim();
        if (trimmed) dailyCheckTodos[idx].text = trimmed;
        renderDailyCheckList();
      };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
      input.addEventListener('blur', save);
    });
  });
  list.querySelectorAll('.daily-check-del').forEach(btn => {
    btn.addEventListener('click', () => {
      dailyCheckTodos.splice(Number(btn.dataset.idx), 1);
      renderDailyCheckList();
    });
  });
}

async function saveDailyCheckModal() {
  if (!dailyCheckDate) return;
  const existing = dailyNotes[dailyCheckDate] || { memo: '' };
  await saveDailyNote(dailyCheckDate, existing.memo, dailyCheckTodos);
  dailyNotes[dailyCheckDate] = { memo: existing.memo, todos: dailyCheckTodos.map(t => ({ ...t })) };
  closeDailyCheckModal();
  renderCalendar();
}

/* =============================================================
   9. 뷰 전환
============================================================= */
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('menu-btn--active'));
  $(`view-${viewId}`).classList.add('view--active');
  const menuBtn = document.querySelector(`[data-view="${viewId}"]`);
  if (menuBtn) menuBtn.classList.add('menu-btn--active');
  if (viewId === 'calendar') {
    if (currentUser) loadDailyNotes(currentUser.id).then(renderCalendar);
    else renderCalendar();
  }
  if (viewId === 'admin') renderAdminUsers();
}

/* =============================================================
   10. 모달
============================================================= */
function openModal(editId = null) {
  $('f-week').innerHTML = WEEKS.map(w =>
    `<option value="${w}" ${w === activeWeek ? 'selected' : ''}>${w}주차</option>`
  ).join('');

  if (editId) {
    const course = courses.find(c => c.id === editId);
    if (!course) return;
    $('modal-title').textContent = '강의 수정';
    $('edit-id').value    = course.id;
    $('f-name').value     = course.name;
    const isCustom = !SUBJECTS[course.subject];
    $('f-subject').value  = isCustom ? 'custom' : (course.subject || 'wireless');
    $('f-custom-subject').value = isCustom ? course.subject : '';
    $('custom-subject-group').style.display = isCustom ? '' : 'none';
    if (isCustom) resetColorSwatches(course.color || CUSTOM_COLORS[0]);
    $('f-week').value       = course.week;
    $('f-status').value     = course.status;
    $('f-progress').value   = course.progress;
    $('f-duration').value   = course.duration;
    $('f-start-date').value = course.startDate || '';
    $('f-end-date').value   = course.endDate   || '';
  } else {
    $('modal-title').textContent = '공부 추가';
    $('course-form').reset();
    $('edit-id').value  = '';
    $('f-week').value   = activeWeek;
    $('f-status').value = 'default';
    $('f-custom-subject').value = '';
    $('custom-subject-group').style.display = 'none';
    resetColorSwatches();
    if (activeSubject !== 'all') $('f-subject').value = activeSubject;
    const range = getWeekRange(activeWeek);
    $('f-start-date').value = range.start;
    $('f-end-date').value   = range.end;
  }

  $('modal-overlay').classList.add('open');
  $('f-name').focus();
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const name = $('f-name').value.trim();
  if (!name) { $('f-name').focus(); return; }

  const editId        = $('edit-id').value;
  const subjectSelect = $('f-subject').value;
  let subject = subjectSelect;
  let color   = null;
  if (subjectSelect === 'custom') {
    subject = $('f-custom-subject').value.trim();
    if (!subject) { $('f-custom-subject').focus(); return; }
    color = $('f-custom-color').value || CUSTOM_COLORS[0];
  }
  const startDate = $('f-start-date').value;
  const endDate   = $('f-end-date').value;
  const week      = endDate ? detectWeekFromDate(endDate) : (startDate ? detectWeekFromDate(startDate) : Number($('f-week').value));

  const courseData = {
    id:        editId || crypto.randomUUID(),
    name,
    subject,
    color,
    week,
    status:    $('f-status').value,
    progress:  $('f-progress').value.trim(),
    duration:  $('f-duration').value.trim(),
    startDate,
    endDate,
  };

  if (editId) {
    const idx = courses.findIndex(c => c.id === courseData.id);
    if (idx !== -1) courses[idx] = courseData;
  } else {
    courses.push(courseData);
  }

  activeWeek = courseData.week;
  await saveCourse(courseData);
  closeModal();
  renderSchedule();
  renderCalendar();
}

/* =============================================================
   11. 색상 스와치
============================================================= */
function initColorSwatches() {
  const container = $('color-swatches');
  container.innerHTML = '';
  CUSTOM_COLORS.forEach((color, i) => {
    const div = document.createElement('div');
    div.className = `color-swatch${i === 0 ? ' selected' : ''}`;
    div.style.background = color;
    div.dataset.color = color;
    div.addEventListener('click', () => {
      container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      div.classList.add('selected');
      $('f-custom-color').value = color;
    });
    container.appendChild(div);
  });
  $('f-custom-color').value = CUSTOM_COLORS[0];
}

function resetColorSwatches(selectedColor) {
  const target = selectedColor || CUSTOM_COLORS[0];
  $('f-custom-color').value = target;
  document.querySelectorAll('#color-swatches .color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === target);
  });
}

/* =============================================================
   12. 관리자 뷰
============================================================= */
async function renderAdminUsers() {
  const tbody = $('admin-user-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">불러오는 중...</td></tr>';

  const [{ data: profiles, error }, { data: allCourses }] = await Promise.all([
    sb.rpc('get_all_profiles'),
    sb.rpc('get_all_courses_summary'),
  ]);

  if (error) { console.error('renderAdminUsers:', error); return; }

  tbody.innerHTML = (profiles || []).sort((a, b) => (b.is_admin ? 1 : 0) - (a.is_admin ? 1 : 0)).map(profile => {
    const userCourses = (allCourses || []).filter(c => c.user_id === profile.id);
    const total = userCourses.length;
    const done  = userCourses.filter(c => c.status === 'done').length;
    const rate  = total ? Math.round(done / total * 100) : 0;
    const joinDate = new Date(profile.created_at).toLocaleDateString('ko-KR');
    const isMe = profile.id === currentUser.id;
    return `<tr>
      <td>${esc((profile.email || '-').replace('@suran.app', ''))}${isMe ? ' <span class="badge badge--default" style="font-size:0.7rem">나</span>' : ''}${profile.is_admin ? ' <span class="badge badge--done" style="font-size:0.7rem">admin</span>' : ''}</td>
      <td style="color:var(--muted)">${joinDate}</td>
      <td>${profile.is_admin ? '<span style="color:var(--muted)">-</span>' : total}</td>
      <td style="color:var(--done)">${profile.is_admin ? '<span style="color:var(--muted)">-</span>' : done}</td>
      <td>${profile.is_admin ? '<span style="color:var(--muted)">-</span>' : rate + '%'}</td>
      <td>
        ${!profile.is_admin ? `<button class="btn btn--ghost" style="font-size:0.8rem;padding:5px 12px"
          data-view-user="${profile.id}" data-view-email="${esc(profile.email||'')}">
          스케줄 보기
        </button>` : ''}
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-view-user]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid   = btn.dataset.viewUser;
      const email = btn.dataset.viewEmail;
      viewingUserId = uid;
      await loadCourses(uid);
      activeWeek = detectWeekFromDate(todayStr);
      activeSubject = 'all';
      document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.subject-btn[data-subject="all"]').classList.add('active');
      showAdminBanner(email.replace('@suran.app', ''));
      switchView('schedule');
      renderSchedule();
    });
  });
}

function setAdminSidebarMode(viewingUser) {
  const scheduleItem = document.querySelector('[data-view="schedule"]').closest('li');
  const calendarItem = document.querySelector('[data-view="calendar"]').closest('li');
  scheduleItem.style.display = viewingUser ? '' : 'none';
  calendarItem.style.display = viewingUser ? '' : 'none';
}

function showAdminBanner(email) {
  let banner = $('admin-viewing-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'admin-viewing-banner';
    banner.className = 'admin-viewing-banner';
    const container = document.querySelector('#view-schedule .container');
    container.insertBefore(banner, container.firstChild);
  }
  setAdminSidebarMode(true);
  banner.innerHTML = `
    <span>👑 <strong>${esc(email)}</strong>님의 스케줄 보는 중</span>
    <button class="btn btn--ghost" style="font-size:0.8rem;padding:5px 12px" id="admin-back-btn">← 목록으로</button>
  `;
  $('admin-back-btn').addEventListener('click', () => {
    viewingUserId = null;
    courses = [];
    banner.remove();
    setAdminSidebarMode(false);
    switchView('admin');
  });
}

/* =============================================================
   12-b. 버그 리포트 UI
============================================================= */
function openBugReportModal() {
  $('bug-report-form').reset();
  $('bug-char-count').textContent = '0 / 500';
  $('bug-submit-msg').textContent = '';
  $('bug-submit-msg').className   = 'bug-submit-msg';
  $('bug-report-overlay').classList.add('open');
  setTimeout(() => $('bug-message').focus(), 50);
}

function closeBugReportModal() {
  $('bug-report-overlay').classList.remove('open');
}

async function handleBugReportSubmit(e) {
  e.preventDefault();
  const type    = $('bug-type').value;
  const message = $('bug-message').value.trim();
  if (!message) { $('bug-message').focus(); return; }

  const submitBtn = $('bug-report-submit-btn');
  const msgEl     = $('bug-submit-msg');
  submitBtn.disabled    = true;
  submitBtn.textContent = '전송 중...';
  msgEl.textContent = '';

  const error = await submitBugReport(type, message);
  submitBtn.disabled    = false;
  submitBtn.textContent = '전송';

  if (error) {
    msgEl.className   = 'bug-submit-msg bug-submit-msg--error';
    msgEl.textContent = '다시보내주세용😭';
  } else {
    msgEl.className   = 'bug-submit-msg bug-submit-msg--success';
    msgEl.textContent = '알라뷰❤️';
    setTimeout(closeBugReportModal, 1400);
  }
}

async function loadAndRenderBugReports() {
  const list = $('bug-report-admin-list');
  list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">불러오는 중...</p>';

  const reports = await loadBugReports();

  const unread = reports.filter(r => !r.is_read).length;
  const badge  = $('bug-unread-badge');
  if (unread > 0) { badge.style.display = ''; badge.textContent = unread; }
  else            { badge.style.display = 'none'; }

  if (!reports.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">버그 리포트가 없습니다.</p>';
    return;
  }

  const typeLabel = { bug: '🐛 버그', suggestion: '💡 건의', other: '💬 기타' };
  const typeCls   = { bug: 'bug', suggestion: 'suggestion', other: 'other' };

  list.innerHTML = reports.map(r => {
    const date = new Date(r.created_at).toLocaleString('ko-KR',
      { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return `<div class="bug-admin-item${r.is_read ? '' : ' bug-admin-item--unread'}" data-id="${r.id}">
      <div class="bug-admin-item__meta">
        <span class="bug-admin-item__type bug-admin-item__type--${typeCls[r.type] || 'other'}">${typeLabel[r.type] || '기타'}</span>
        <span class="bug-admin-item__email">${esc((r.user_email || '알 수 없음').replace('@suran.app', ''))}</span>
        <span class="bug-admin-item__date">${date}</span>
      </div>
      <p class="bug-admin-item__message">${esc(r.message)}</p>
      ${!r.is_read ? `<div class="bug-admin-item__actions">
        <button class="btn btn--ghost bug-admin-item__read-btn" data-read="${r.id}">읽음 처리</button>
      </div>` : ''}
    </div>`;
  }).join('');

  list.querySelectorAll('[data-read]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await markBugReportRead(btn.dataset.read);
      loadAndRenderBugReports();
    });
  });
}

/* =============================================================
   13. 인증
============================================================= */
function showAuthScreen() {
  $('auth-screen').classList.remove('hidden');
}

function hideAuthScreen() {
  $('auth-screen').classList.add('hidden');
}

function usernameToEmail(username) {
  return username.toLowerCase() + '@suran.app';
}

async function handleAuth(e) {
  e.preventDefault();
  const username  = $('auth-username').value.trim();
  const password  = $('auth-password').value;
  const tab       = document.querySelector('.auth-tab--active').dataset.authTab;
  const errorEl   = $('auth-error');
  const submitBtn = $('auth-submit-btn');

  if (!username) {
    errorEl.style.color = 'var(--delayed)';
    errorEl.textContent = '아이디를 입력해주세요.';
    return;
  }

  const email = usernameToEmail(username);
  errorEl.textContent = '';
  submitBtn.disabled  = true;
  submitBtn.textContent = '처리 중...';

  try {
    if (tab === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      errorEl.style.color = 'var(--done)';
      errorEl.textContent = '가입 완료! 로그인해주세요.';
    }
  } catch (err) {
    errorEl.style.color = 'var(--delayed)';
    errorEl.textContent = err.message || '오류가 발생했습니다.';
    console.error('Auth error:', err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = tab === 'login' ? '로그인' : '회원가입';
  }
}

/* =============================================================
   14. 이벤트 바인딩
============================================================= */
function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;

  // 사이드바 뷰 전환
  document.querySelectorAll('.menu-btn').forEach(btn =>
    btn.addEventListener('click', () => switchView(btn.dataset.view))
  );

  // 과목 필터
  document.querySelectorAll('.subject-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSubject = btn.dataset.subject;
      renderSchedule();
    })
  );

  // 달력 클릭 (이벤트 바 or 날짜 셀)
  $('cal-grid').addEventListener('click', e => {
    const bar = e.target.closest('.cal-event');
    if (bar) {
      const week    = Number(bar.dataset.week);
      const subject = bar.dataset.subject;
      if (!week) return;
      activeWeek    = week;
      activeSubject = SUBJECTS[subject] ? subject : 'all';
      document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      const matchBtn = document.querySelector(`.subject-btn[data-subject="${activeSubject}"]`);
      if (matchBtn) matchBtn.classList.add('active');
      switchView('schedule');
      renderSchedule();
      return;
    }
    const dayCell = e.target.closest('.cal-day[data-date]:not(.cal-day--other)');
    if (dayCell) openDailyCheckModal(dayCell.dataset.date);
  });

  // 달력 월 이동
  $('cal-prev').addEventListener('click', async () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    await loadDailyNotes(currentUser.id);
    renderCalendar();
  });
  $('cal-next').addEventListener('click', async () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    await loadDailyNotes(currentUser.id);
    renderCalendar();
  });

  // 풀이 추가 모달
  $('open-daily-add-btn').addEventListener('click', () => openDailyAddModal());
  $('daily-add-close-btn').addEventListener('click', closeDailyAddModal);
  $('daily-add-cancel-btn').addEventListener('click', closeDailyAddModal);
  $('daily-add-overlay').addEventListener('click', e => {
    if (e.target === $('daily-add-overlay')) closeDailyAddModal();
  });
  $('daily-add-form').addEventListener('submit', handleDailyAddSubmit);
  $('daily-add-row-btn').addEventListener('click', () => {
    dailyAddRows.push({ emoji: DAILY_EMOJIS[0], text: '' });
    renderDailyAddRows();
    setTimeout(() => {
      const inputs = $('daily-add-rows').querySelectorAll('.daily-row-text');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 30);
  });

  // 날짜 체크 모달
  $('daily-check-close-btn').addEventListener('click', closeDailyCheckModal);
  $('daily-check-cancel-btn').addEventListener('click', closeDailyCheckModal);
  $('daily-check-save-btn').addEventListener('click', saveDailyCheckModal);
  $('daily-check-overlay').addEventListener('click', e => {
    if (e.target === $('daily-check-overlay')) closeDailyCheckModal();
  });

  // 주차 슬라이드
  $('week-prev').addEventListener('click', () => { $('week-tabs').scrollLeft -= 200; });
  $('week-next').addEventListener('click', () => { $('week-tabs').scrollLeft += 200; });

  // 주차 변경 → 날짜 자동
  $('f-week').addEventListener('change', () => {
    const range = getWeekRange(Number($('f-week').value));
    $('f-start-date').value = range.start;
    $('f-end-date').value   = range.end;
  });

  // 날짜 변경 → 주차 자동
  ['f-start-date', 'f-end-date'].forEach(id => {
    $(id).addEventListener('change', () => {
      const detect = $('f-end-date').value || $('f-start-date').value;
      if (detect) $('f-week').value = detectWeekFromDate(detect);
    });
  });

  // 과목 직접 입력 토글
  $('f-subject').addEventListener('change', () => {
    const isCustom = $('f-subject').value === 'custom';
    $('custom-subject-group').style.display = isCustom ? '' : 'none';
    if (isCustom) { resetColorSwatches(); $('f-custom-subject').focus(); }
  });

  // 모달
  $('open-modal-btn').addEventListener('click', () => openModal());
  $('close-modal-btn').addEventListener('click', closeModal);
  $('cancel-btn').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });
  $('course-form').addEventListener('submit', handleFormSubmit);

  // 버그 리포트 플로팅 버튼
  $('bug-fab').addEventListener('click', openBugReportModal);
  $('bug-report-close-btn').addEventListener('click', closeBugReportModal);
  $('bug-report-cancel-btn').addEventListener('click', closeBugReportModal);
  $('bug-report-overlay').addEventListener('click', e => {
    if (e.target === $('bug-report-overlay')) closeBugReportModal();
  });
  $('bug-report-form').addEventListener('submit', handleBugReportSubmit);
  $('bug-message').addEventListener('input', () => {
    $('bug-char-count').textContent = `${$('bug-message').value.length} / 500`;
  });

  // 관리자 탭 전환
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
      tab.classList.add('admin-tab--active');
      const which = tab.dataset.adminTab;
      $('admin-tab-users').style.display = which === 'users' ? '' : 'none';
      $('admin-tab-bugs').style.display  = which === 'bugs'  ? '' : 'none';
      if (which === 'bugs') loadAndRenderBugReports();
    });
  });

  // 로그아웃
  $('logout-btn').addEventListener('click', () => {
    console.log('[logout] 클릭');
    currentUser   = null;
    isAdmin       = false;
    courses       = [];
    loggingIn     = false;
    viewingUserId = null;
    showAuthScreen();
    sb.auth.signOut().catch(console.error);
  });

  // 인증 폼
  $('auth-form').addEventListener('submit', handleAuth);

  // 인증 탭 전환
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('auth-tab--active'));
      tab.classList.add('auth-tab--active');
      $('auth-submit-btn').textContent = tab.dataset.authTab === 'login' ? '로그인' : '회원가입';
      $('auth-error').textContent = '';
    });
  });
}

/* =============================================================
   15. 초기화
============================================================= */
function setTodayLabel() {
  const label = today.toLocaleDateString('ko-KR', {
    year:'numeric', month:'long', day:'numeric', weekday:'long',
  });
  $('today-date').textContent     = label;
  $('cal-today-date').textContent = label;
}

async function onLogin(user) {
  if (loggingIn) return;
  loggingIn = true;

  currentUser   = user;
  viewingUserId = null;

  // 인증 즉시 화면 전환 + 빈 상태 렌더 (주차 탭 등 UI 바로 표시)
  $('sidebar-email').textContent = (user.email || '').replace('@suran.app', '') + ' 님';
  setTodayLabel();
  initColorSwatches();
  hideAuthScreen();
  renderSchedule();

  try {
    // 프로필 조회 (admin 여부 확인)
    console.log('[profile] 조회 시작, uid:', user.id);
    const { data: profile, error: profileError } = await Promise.race([
      sb.from('profiles').select('is_admin, email').eq('id', user.id).maybeSingle(),
      new Promise(res => setTimeout(() => res({ data: null, error: new Error('profile 타임아웃') }), 6000)),
    ]);
    console.log('[profile] 결과:', { profile, error: profileError?.message });

    isAdmin = profile?.is_admin ?? false;
    if (profile?.email) $('sidebar-email').textContent = profile.email.replace('@suran.app', '') + ' 님';
    $('admin-menu-item').style.display = isAdmin ? '' : 'none';
    console.log('[profile] isAdmin:', isAdmin);

    if (isAdmin) {
      // 어드민은 자기 스케줄 불필요 → 관리자 뷰로 바로 이동
      courses = [];
      setAdminSidebarMode(false);
      switchView('admin');
      refreshBugBadge();
    } else {
      await loadCourses(user.id);
      activeWeek = detectWeekFromDate(todayStr);
      renderSchedule();
    }
  } catch (err) {
    console.error('[onLogin] 오류:', err);
  } finally {
    loggingIn = false;
  }
}

function init() {
  createStarfield();
  initTypewriter();
  bindEvents();

  sb.auth.onAuthStateChange(async (event, session) => {
    console.log('[auth event]', event);

    if (event === 'INITIAL_SESSION') {
      // 세션 준비 완료 후 → 데이터 로딩
      if (session?.user) await onLogin(session.user);
      else showAuthScreen();
    } else if (event === 'SIGNED_IN') {
      // 로그인 직후 → 화면만 즉시 전환 (쿼리 X, INITIAL_SESSION에서 처리)
      if (session?.user && !loggingIn) {
        hideAuthScreen();
        $('sidebar-email').textContent = (session.user.email || '').replace('@suran.app', '') + ' 님';
      }
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      isAdmin     = false;
      courses     = [];
      loggingIn   = false;
      showAuthScreen();
    }
  });
}

init();
