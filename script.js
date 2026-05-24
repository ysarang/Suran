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
  const sidebar  = document.querySelector('.sidebar__brand');
  const auth     = document.querySelector('.auth-brand');
  const mobTitle = document.querySelector('.mob-topbar');
  if (sidebar)  runTypewriter(sidebar,  '👊\n아무튼\n딴짓하면\n꿀밤!');
  if (auth)     runTypewriter(auth,     '👊\n아무튼 딴짓하면 꿀밤!');
  if (mobTitle) runTypewriter(mobTitle, '👊 아무튼 딴짓하면 꿀밤!', 80);
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
let userWeekStart = new Date('2026-05-11'); // 로그인 후 프로필에서 덮어씀

// 표시할 주차 범위 (localStorage 에서 복원)
let visibleWeekRange = (() => {
  try { return JSON.parse(localStorage.getItem('weekRange')) || { from: 1, to: 12 }; }
  catch { return { from: 1, to: 12 }; }
})();
function saveWeekRange() { localStorage.setItem('weekRange', JSON.stringify(visibleWeekRange)); }

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
let loggingIn     = false;

let userSettings = {
  scheduleLabel:  '공부 스케줄',
  calendarLabel:  '공부 달력',
  theme:          'dark',
  customSubjects: { hidden: [], extras: [] },
};

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
  const start = new Date(userWeekStart);
  start.setDate(userWeekStart.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: fmtDate(start), end: fmtDate(end) };
}

function detectWeekFromDate(dateStr) {
  const d = new Date(dateStr);
  const diffDays = Math.floor((d - userWeekStart) / 86400000);
  if (diffDays < 0) return 1;
  return Math.min(Math.floor(diffDays / 7) + 1, 24);
}

function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return fmtDate(d);
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

function renderWeekTabs(scrollHint = 'active') {
  // scrollHint: 'active' | 'end' | 'start'
  const nav = $('week-tabs');
  nav.innerHTML = '';

  const from = Math.max(1, visibleWeekRange.from);
  const to   = Math.min(24, visibleWeekRange.to);

  // - 버튼: 항상 표시, 맨 왼쪽 주차를 제거
  const subBtn = document.createElement('button');
  subBtn.className = 'week-add-btn';
  subBtn.title = `${from}주차 숨기기`;
  subBtn.textContent = '−';
  subBtn.disabled = from >= to;
  subBtn.addEventListener('click', () => {
    if (visibleWeekRange.from >= visibleWeekRange.to) return;
    visibleWeekRange.from = visibleWeekRange.from + 1;
    if (activeWeek < visibleWeekRange.from) { activeWeek = visibleWeekRange.from; }
    saveWeekRange();
    renderWeekTabs('start');
  });
  nav.appendChild(subBtn);

  WEEKS.filter(w => w >= from && w <= to).forEach(week => {
    const count = courses.filter(c =>
      c.week === week && (activeSubject === 'all' || c.subject === activeSubject)
    ).length;
    const btn = document.createElement('button');
    btn.className = `week-tab${week === activeWeek ? ' active' : ''}`;
    btn.innerHTML = `${week}주차${count ? `<span class="tab-count">(${count})</span>` : ''}`;
    btn.addEventListener('click', () => { activeWeek = week; renderSchedule(); });
    nav.appendChild(btn);
  });

  // + 버튼: 끝 주차가 24 미만일 때 표시
  if (to < 24) {
    const addBtn = document.createElement('button');
    addBtn.className = 'week-add-btn';
    addBtn.title = `${to + 1}주차 표시`;
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => {
      visibleWeekRange.to = Math.min(24, visibleWeekRange.to + 1);
      saveWeekRange();
      renderWeekTabs('end');
    });
    nav.appendChild(addBtn);
  }

  if (scrollHint === 'end') {
    const last = nav.lastElementChild;
    if (last) last.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
  } else if (scrollHint === 'start') {
    const first = nav.firstElementChild;
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  } else {
    const activeTab = nav.querySelector('.week-tab.active');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
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
  renderSubjectFilter();
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
  populateSubjectSelect();

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
    $('modal-title').textContent = '추가';
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
      $('subject-filter').querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      $('subject-filter').querySelector('.subject-btn[data-subject="all"]')?.classList.add('active');
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

/* =============================================================
   공지 관리
============================================================= */
function showNoticePreview(content, dateLabel = '') {
  const lines     = (content || '').split('\n');
  const titleText = lines[0].trim();
  const bodyText  = lines.slice(1).join('\n').replace(/^\n+/, '');
  $('notice-popup-badge').textContent = '📢 미리보기';
  $('notice-popup-title').textContent = titleText;
  $('notice-popup-date').textContent  = dateLabel || '미리보기';
  $('notice-popup-body').textContent  = bodyText;
  $('notice-popup-overlay').classList.add('open');
  $('notice-confirm-btn').onclick = () => $('notice-popup-overlay').classList.remove('open');
  const dismissBtn = $('notice-dismiss-btn');
  dismissBtn.textContent = '닫기';
  dismissBtn.onclick = () => $('notice-popup-overlay').classList.remove('open');
}

async function renderAdminNotices() {
  const listEl = $('notice-admin-list');
  listEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">불러오는 중...</p>';

  const { data, error } = await sb
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { listEl.innerHTML = '<p style="color:var(--delayed);padding:20px">불러오기 실패</p>'; return; }
  if (!data?.length) { listEl.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">등록된 공지가 없어요.</p>'; return; }

  const now = todayStr;
  listEl.innerHTML = `<div class="notice-list-wrap">${data.map(n => {
    const expired = n.end_date < now;
    const created = new Date(n.created_at).toLocaleDateString('ko-KR');
    const updated = n.updated_at !== n.created_at
      ? ` · 수정 ${new Date(n.updated_at).toLocaleDateString('ko-KR')}` : '';
    return `<div class="notice-admin-item${expired ? ' notice-admin-item--expired' : ''}" data-nid="${n.id}">
      <div class="notice-admin-item__meta">
        <span>${n.start_date} ~ ${n.end_date}</span>
        <span>작성 ${created}${updated}</span>
        ${expired ? '<span style="color:var(--delayed)">기간 종료</span>' : (n.is_active ? '<span style="color:var(--done)">활성</span>' : '<span style="color:var(--muted)">비활성</span>')}
      </div>
      <div class="notice-admin-item__content">${esc(n.content)}</div>
      <div class="notice-admin-item__actions">
        <button class="btn btn--ghost" style="font-size:0.8rem;padding:5px 12px" data-preview-notice="${n.id}">미리보기</button>
        <button class="btn btn--ghost" style="font-size:0.8rem;padding:5px 12px" data-append-notice="${n.id}">내용 수정</button>
        <button class="btn btn--ghost" style="font-size:0.8rem;padding:5px 12px;color:${n.is_active ? 'var(--muted)' : 'var(--done)'}" data-toggle-notice="${n.id}" data-active="${n.is_active}">${n.is_active ? '비활성화' : '활성화'}</button>
        <button class="btn btn--ghost" style="font-size:0.8rem;padding:5px 12px;color:var(--delayed)" data-delete-notice="${n.id}">삭제</button>
      </div>
      <div class="notice-admin-item__append" id="notice-append-${n.id}" style="display:none;flex-direction:column;gap:8px">
        <textarea class="form-input" rows="4" id="notice-append-input-${n.id}"></textarea>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="date" class="form-input" id="notice-edit-start-${n.id}" style="flex:1">
          <span style="color:var(--muted);font-size:0.85rem">~</span>
          <input type="date" class="form-input" id="notice-edit-end-${n.id}" style="flex:1">
          <button class="btn btn--primary" style="font-size:0.8rem;padding:5px 14px;white-space:nowrap" data-save-append="${n.id}">저장</button>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;

  // 미리보기
  listEl.querySelectorAll('[data-preview-notice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nid    = btn.dataset.previewNotice;
      const notice = data.find(n => n.id === nid);
      if (!notice) return;
      showNoticePreview(notice.content, `${notice.start_date} ~ ${notice.end_date}`);
    });
  });

  // 내용 수정 토글
  listEl.querySelectorAll('[data-append-notice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nid      = btn.dataset.appendNotice;
      const row      = $(`notice-append-${nid}`);
      const textarea = $(`notice-append-input-${nid}`);
      const isHidden = row.style.display === 'none';
      if (isHidden) {
        const original = data.find(n => n.id === nid);
        if (original) {
          textarea.value = original.content;
          const startEl = $(`notice-edit-start-${nid}`);
          const endEl   = $(`notice-edit-end-${nid}`);
          if (startEl) startEl.value = original.start_date;
          if (endEl)   endEl.value   = original.end_date;
        }
      }
      row.style.display = isHidden ? 'flex' : 'none';
    });
  });

  // 수정 저장
  listEl.querySelectorAll('[data-save-append]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const nid        = btn.dataset.saveAppend;
      const newContent = $(`notice-append-input-${nid}`)?.value.trim();
      const newStart   = $(`notice-edit-start-${nid}`)?.value;
      const newEnd     = $(`notice-edit-end-${nid}`)?.value;
      if (!newContent) return;
      const updates = { content: newContent, updated_at: new Date().toISOString() };
      if (newStart) updates.start_date = newStart;
      if (newEnd)   updates.end_date   = newEnd;
      const { error } = await sb.from('announcements')
        .update(updates)
        .eq('id', nid);
      if (!error) renderAdminNotices();
    });
  });

  // 활성/비활성 토글
  listEl.querySelectorAll('[data-toggle-notice]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const nid    = btn.dataset.toggleNotice;
      const active = btn.dataset.active === 'true';
      await sb.from('announcements').update({ is_active: !active }).eq('id', nid);
      renderAdminNotices();
    });
  });

  // 삭제
  listEl.querySelectorAll('[data-delete-notice]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('공지를 삭제할까요?')) return;
      const nid = btn.dataset.deleteNotice;
      await sb.from('announcements').delete().eq('id', nid);
      renderAdminNotices();
    });
  });
}

async function submitNotice() {
  const content = $('notice-content').value.trim();
  const start   = $('notice-start').value;
  const end     = $('notice-end').value;
  const msg     = $('notice-write-msg');
  if (!content || !start || !end) { msg.style.color='var(--delayed)'; msg.textContent='내용과 기간을 모두 입력해주세요.'; return; }
  if (start > end) { msg.style.color='var(--delayed)'; msg.textContent='종료일이 시작일보다 빠릅니다.'; return; }
  const btn = $('notice-submit-btn');
  btn.disabled = true; btn.textContent = '등록 중...';
  const { error } = await sb.from('announcements').insert({ content, start_date: start, end_date: end });
  btn.disabled = false; btn.textContent = '공지 등록';
  if (error) { msg.style.color='var(--delayed)'; msg.textContent = error.message; return; }
  msg.style.color='var(--done)'; msg.textContent='공지가 등록됐어요!';
  $('notice-content').value = '';
  $('notice-start').value = '';
  $('notice-end').value = '';
  renderAdminNotices();
}

async function checkAndShowNotice() {
  const { data, error } = await sb
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', todayStr)
    .gte('end_date', todayStr)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return;

  const dismissKey = `notice_dismissed_${data.id}`;
  if (localStorage.getItem(dismissKey) === todayStr) return;

  // 제목/날짜 파싱 (첫 줄이 제목 역할)
  const lines = (data.content || '').split('\n');
  let titleText = '';
  let bodyText  = data.content;
  if (lines[0] && lines[0].trim()) {
    titleText = lines[0].trim();
    bodyText  = lines.slice(1).join('\n').replace(/^\n+/, '');
  }

  $('notice-popup-title').textContent = titleText;
  $('notice-popup-date').textContent  = data.start_date ? `${data.start_date} 기준` : '';
  $('notice-popup-body').textContent  = bodyText;
  $('notice-popup-overlay').classList.add('open');

  $('notice-confirm-btn').onclick = () => {
    $('notice-popup-overlay').classList.remove('open');
  };
  $('notice-dismiss-btn').onclick = () => {
    localStorage.setItem(dismissKey, todayStr);
    $('notice-popup-overlay').classList.remove('open');
  };
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
   12. 설정
============================================================= */
function getSubjectOrder() {
  const hidden    = userSettings.customSubjects.hidden || [];
  const extras    = userSettings.customSubjects.extras || [];
  const order     = userSettings.customSubjects.order  || [];
  const defaultKs = Object.keys(SUBJECTS);
  const extraKs   = extras.map(e => e.key);
  const allKeys   = [...defaultKs, ...extraKs];
  return order.length
    ? [...order.filter(k => allKeys.includes(k)), ...allKeys.filter(k => !order.includes(k))]
    : allKeys;
}

function computeUserSubjects() {
  const hidden = userSettings.customSubjects.hidden || [];
  const extras = userSettings.customSubjects.extras || [];
  const result = {};
  getSubjectOrder().forEach(key => {
    if (hidden.includes(key)) return;
    if (SUBJECTS[key]) {
      result[key] = SUBJECTS[key];
    } else {
      const ex = extras.find(e => e.key === key);
      if (ex) result[key] = { label: ex.label, cls: 'custom' };
    }
  });
  return result;
}

function applyTheme(theme) {
  userSettings.theme = theme;
  document.body.classList.toggle('light', theme === 'light');
  localStorage.setItem('theme', theme);
  const darkBtn  = $('theme-dark-btn');
  const lightBtn = $('theme-light-btn');
  if (darkBtn)  darkBtn.classList.toggle('theme-option--active',  theme === 'dark');
  if (lightBtn) lightBtn.classList.toggle('theme-option--active', theme === 'light');
}

function updateMenuLabels() {
  const scheduleLabel = document.querySelector('[data-view="schedule"] .menu-label');
  const calendarLabel = document.querySelector('[data-view="calendar"] .menu-label');
  if (scheduleLabel) scheduleLabel.textContent = userSettings.scheduleLabel;
  if (calendarLabel) calendarLabel.textContent = userSettings.calendarLabel;
  const scheduleTitle = $('schedule-view-title');
  const calendarTitle = $('calendar-view-title');
  if (scheduleTitle) scheduleTitle.textContent = '📋 ' + userSettings.scheduleLabel;
  if (calendarTitle) calendarTitle.textContent = '📅 ' + userSettings.calendarLabel;
}

function renderSubjectFilter() {
  const filter = $('subject-filter');
  if (!filter) return;
  const subjects = computeUserSubjects();
  filter.innerHTML = `<button class="subject-btn${activeSubject === 'all' ? ' active' : ''}" data-subject="all">전체</button>`
    + Object.entries(subjects).map(([key, val]) =>
        `<button class="subject-btn${activeSubject === key ? ' active' : ''}" data-subject="${key}">${val.label}</button>`
      ).join('');
}

function populateSubjectSelect() {
  const sel = $('f-subject');
  if (!sel) return;
  const subjects = computeUserSubjects();
  sel.innerHTML = Object.entries(subjects).map(([key, val]) =>
    `<option value="${key}">${val.label}</option>`
  ).join('') + `<option value="custom">✏️ 직접 입력</option>`;
}

function openSettingsModal() {
  // 현재 값으로 폼 초기화
  $('new-password').value = '';
  $('new-password-confirm').value = '';
  $('pw-msg').textContent = '';
  $('label-schedule').value = userSettings.scheduleLabel;
  $('label-calendar').value = userSettings.calendarLabel;
  $('label-msg').textContent = '';
  $('subject-msg').textContent = '';
  applyTheme(userSettings.theme);
  renderSubjectManageList();
  switchSettingsTab('info');
  $('settings-overlay').classList.add('open');
}

function closeSettingsModal() {
  $('settings-overlay').classList.remove('open');
}

function switchSettingsTab(tab) {
  document.querySelectorAll('.settings-tab').forEach(t =>
    t.classList.toggle('settings-tab--active', t.dataset.stab === tab)
  );
  document.querySelectorAll('.settings-panel').forEach(p =>
    p.classList.toggle('hidden', p.id !== 'settings-panel-' + tab)
  );
}

async function savePassword() {
  const pw  = $('new-password').value;
  const pw2 = $('new-password-confirm').value;
  const msg = $('pw-msg');
  if (pw.length < 6) { msg.style.color='var(--delayed)'; msg.textContent='6자 이상 입력해주세요.'; return; }
  if (pw !== pw2)    { msg.style.color='var(--delayed)'; msg.textContent='비밀번호가 일치하지 않아요.'; return; }
  const btn = $('pw-save-btn');
  btn.disabled = true; btn.textContent = '변경 중...';
  const { error } = await sb.auth.updateUser({ password: pw });
  btn.disabled = false; btn.textContent = '변경하기';
  if (error) { msg.style.color='var(--delayed)'; msg.textContent = error.message; }
  else       { msg.style.color='var(--done)';    msg.textContent = '비밀번호가 변경됐어요!'; $('new-password').value=''; $('new-password-confirm').value=''; }
}

async function saveLabels() {
  const sl = $('label-schedule').value.trim() || '공부 스케줄';
  const cl = $('label-calendar').value.trim()  || '공부 달력';
  const btn = $('label-save-btn');
  const msg = $('label-msg');
  btn.disabled = true; btn.textContent = '저장 중...';
  const { error } = await sb.from('profiles').update({ schedule_label: sl, calendar_label: cl }).eq('id', currentUser.id);
  btn.disabled = false; btn.textContent = '저장';
  if (error) { msg.style.color='var(--delayed)'; msg.textContent = error.message; return; }
  userSettings.scheduleLabel = sl;
  userSettings.calendarLabel = cl;
  updateMenuLabels();
  msg.style.color='var(--done)'; msg.textContent = '저장됐어요!';
}

async function saveCustomSubjects() {
  const { error } = await sb.from('profiles')
    .update({ custom_subjects: userSettings.customSubjects })
    .eq('id', currentUser.id);
  if (error) console.error('saveCustomSubjects:', error);
  else {
    renderSubjectFilter();
    populateSubjectSelect();
  }
}

function setSubjectMsg(text, type = 'done') {
  const msg = $('subject-msg');
  if (!msg) return;
  msg.style.color = type === 'done' ? 'var(--done)' : 'var(--delayed)';
  msg.textContent = text;
}

function renderSubjectManageList() {
  const list = $('subject-manage-list');
  if (!list) return;
  const hidden = userSettings.customSubjects.hidden || [];
  const extras = userSettings.customSubjects.extras || [];

  const orderedKeys = getSubjectOrder();
  const items = orderedKeys.map(key => {
    const isDefault = !!SUBJECTS[key];
    const isHidden  = hidden.includes(key);
    const label     = isDefault ? SUBJECTS[key].label : (extras.find(e => e.key === key)?.label || key);
    const btns = isDefault
      ? `<button class="btn btn--ghost" style="font-size:0.78rem;padding:4px 10px;color:${isHidden ? 'var(--done)' : 'var(--delayed)'}" data-toggle="${key}">${isHidden ? '복구' : '삭제'}</button>`
      : `<button class="btn btn--ghost" style="font-size:0.78rem;padding:4px 10px" data-edit="${key}">수정</button>
         <button class="btn btn--ghost" style="font-size:0.78rem;padding:4px 10px;color:var(--delayed)" data-delete="${key}">삭제</button>`;
    return `<div class="subject-manage-item${isHidden ? ' subject-manage-item--hidden' : ''}" draggable="true" data-key="${key}">
      <span class="subject-drag-handle">⠿</span>
      <span class="subject-manage-item__label" id="slabel-${key}">${esc(label)}</span>
      ${btns}
    </div>`;
  }).join('');

  const inner = document.createElement('div');
  inner.className = 'subject-manage-list-inner';
  inner.innerHTML = items;
  list.innerHTML = '';
  list.appendChild(inner);

  // 토글(삭제/복구)
  inner.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.toggle;
      const idx = userSettings.customSubjects.hidden.indexOf(key);
      if (idx === -1) userSettings.customSubjects.hidden.push(key);
      else userSettings.customSubjects.hidden.splice(idx, 1);
      await saveCustomSubjects();
      renderSubjectManageList();
      setSubjectMsg('저장됐어요!');
    });
  });

  // 수정
  inner.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.edit;
      const ex  = userSettings.customSubjects.extras.find(e => e.key === key);
      if (!ex) return;
      const labelEl = $(`slabel-${key}`);
      labelEl.innerHTML = `<input type="text" class="form-input" style="font-size:0.82rem;padding:4px 8px;height:auto" value="${esc(ex.label)}" maxlength="20" id="sedit-${key}">`;
      btn.textContent = '저장';
      delete btn.dataset.edit;
      btn.addEventListener('click', async () => {
        const newLabel = $(`sedit-${key}`)?.value.trim();
        if (!newLabel) return;
        ex.label = newLabel;
        await saveCustomSubjects();
        renderSubjectManageList();
        setSubjectMsg('수정됐어요!');
      }, { once: true });
    });
  });

  // 삭제
  inner.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.delete;
      const idx = userSettings.customSubjects.extras.findIndex(e => e.key === key);
      if (idx !== -1) userSettings.customSubjects.extras.splice(idx, 1);
      const oi = (userSettings.customSubjects.order || []).indexOf(key);
      if (oi !== -1) userSettings.customSubjects.order.splice(oi, 1);
      await saveCustomSubjects();
      renderSubjectManageList();
      setSubjectMsg('삭제됐어요!');
    });
  });

  // 드래그 앤 드롭
  let dragKey = null;
  inner.querySelectorAll('.subject-manage-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      dragKey = item.dataset.key;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      inner.querySelectorAll('.subject-manage-item').forEach(i => i.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      inner.querySelectorAll('.subject-manage-item').forEach(i => i.classList.remove('drag-over'));
      item.classList.add('drag-over');
    });
    item.addEventListener('drop', async e => {
      e.preventDefault();
      const targetKey = item.dataset.key;
      if (!dragKey || dragKey === targetKey) return;
      const currentOrder = [...inner.querySelectorAll('.subject-manage-item')].map(i => i.dataset.key);
      const from = currentOrder.indexOf(dragKey);
      const to   = currentOrder.indexOf(targetKey);
      currentOrder.splice(from, 1);
      currentOrder.splice(to, 0, dragKey);
      userSettings.customSubjects.order = currentOrder;
      await saveCustomSubjects();
      renderSubjectManageList();
      setSubjectMsg('순서가 변경됐어요!');
    });
  });
}

async function addCustomSubject() {
  const input = $('new-subject-input');
  const label = input.value.trim();
  const msg   = $('subject-msg');
  if (!label) return;
  const emoji = $('emoji-pick-btn').textContent.trim();
  const key   = 'custom_' + Date.now();
  userSettings.customSubjects.extras.push({ key, label: emoji + ' ' + label });
  if (!userSettings.customSubjects.order) userSettings.customSubjects.order = [];
  userSettings.customSubjects.order.push(key);
  input.value = '';
  $('emoji-pick-btn').textContent = '📚';
  await saveCustomSubjects();
  renderSubjectManageList();
  msg.style.color = 'var(--done)'; msg.textContent = '과목이 추가됐어요!';
}

/* =============================================================
   12-0. 마이 팝업 (모바일)
============================================================= */
function openMobMyPopup() {
  const username = (currentUser?.email || '').replace('@suran.app', '');
  $('mob-my-username').textContent = username;
  $('mob-my-overlay').classList.add('open');
}
function closeMobMyPopup() {
  $('mob-my-overlay').classList.remove('open');
}

/* =============================================================
   12-1. 주차 설정
============================================================= */
function openWeekSettingModal() {
  $('week-start-input').value  = fmtDate(userWeekStart);
  $('week-range-from').value   = visibleWeekRange.from;
  $('week-range-to').value     = visibleWeekRange.to;
  $('week-setting-overlay').classList.add('open');
}

function closeWeekSettingModal() {
  $('week-setting-overlay').classList.remove('open');
}

async function saveWeekSetting() {
  const val  = $('week-start-input').value;
  if (!val) return;

  const fromVal = parseInt($('week-range-from').value) || 1;
  const toVal   = parseInt($('week-range-to').value)   || 12;
  if (fromVal < 1 || toVal > 24 || fromVal > toVal) {
    alert('주차 범위가 올바르지 않습니다. (1~24 사이, 시작 ≤ 끝)');
    return;
  }

  const saveBtn = $('week-setting-save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = '저장 중...';

  const { error } = await sb
    .from('profiles')
    .update({ week_start_date: val })
    .eq('id', currentUser.id);

  saveBtn.disabled = false;
  saveBtn.textContent = '저장';

  if (error) { console.error('saveWeekSetting:', error); return; }

  userWeekStart = new Date(val);
  visibleWeekRange = { from: fromVal, to: toVal };
  saveWeekRange();
  activeWeek = detectWeekFromDate(todayStr);
  closeWeekSettingModal();
  renderSchedule();
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
  document.querySelectorAll('.menu-btn').forEach(btn => {
    if (!btn.dataset.view) return;
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  $('sidebar-brand').addEventListener('click', () => switchView('schedule'));

  // 과목 필터 (이벤트 위임)
  $('subject-filter').addEventListener('click', e => {
    const btn = e.target.closest('.subject-btn');
    if (!btn) return;
    $('subject-filter').querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeSubject = btn.dataset.subject;
    renderSchedule();
  });

  // 마이 팝업 (모바일)
  $('mob-my-btn').addEventListener('click', openMobMyPopup);
  $('mob-my-overlay').addEventListener('click', e => { if (e.target === $('mob-my-overlay')) closeMobMyPopup(); });
  $('mob-my-logout-btn').addEventListener('click', () => { closeMobMyPopup(); $('logout-btn').click(); });

  // 설정 버튼
  $('settings-btn').addEventListener('click', openSettingsModal);
  $('settings-close-btn').addEventListener('click', closeSettingsModal);
  $('settings-overlay').addEventListener('click', e => { if (e.target === $('settings-overlay')) closeSettingsModal(); });
  document.querySelectorAll('.settings-tab').forEach(tab =>
    tab.addEventListener('click', () => switchSettingsTab(tab.dataset.stab))
  );
  $('theme-dark-btn').addEventListener('click',  () => applyTheme('dark'));
  $('theme-light-btn').addEventListener('click', () => applyTheme('light'));
  $('pw-save-btn').addEventListener('click', savePassword);
  $('label-save-btn').addEventListener('click', saveLabels);
  $('new-subject-add-btn').addEventListener('click', addCustomSubject);
  $('new-subject-input').addEventListener('keydown', e => { if (e.key === 'Enter') addCustomSubject(); });

  // 이모지 피커
  $('emoji-pick-btn').addEventListener('click', e => {
    e.stopPropagation();
    const dropdown = $('emoji-picker-dropdown');
    const rect = $('emoji-pick-btn').getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top  = (rect.top - 8) + 'px';
    dropdown.style.transform = 'translateY(-100%)';
    dropdown.classList.toggle('open');
  });
  $('emoji-picker-dropdown').addEventListener('click', e => {
    const emoji = e.target.textContent.trim();
    if (!emoji) return;
    $('emoji-pick-btn').textContent = emoji;
    $('emoji-picker-dropdown').classList.remove('open');
  });
  document.addEventListener('click', () => {
    $('emoji-picker-dropdown')?.classList.remove('open');
  });

  // 달력 클릭 (이벤트 바 or 날짜 셀)
  $('cal-grid').addEventListener('click', e => {
    const bar = e.target.closest('.cal-event');
    if (bar) {
      const week    = Number(bar.dataset.week);
      const subject = bar.dataset.subject;
      if (!week) return;
      activeWeek    = week;
      activeSubject = computeUserSubjects()[subject] ? subject : 'all';
      $('subject-filter').querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      const matchBtn = $('subject-filter').querySelector(`.subject-btn[data-subject="${activeSubject}"]`);
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

  // 주차 슬라이드 (데스크톱 화살표 — 모바일에선 CSS로 숨김)
  $('week-prev').addEventListener('click', () => { $('week-tabs').scrollLeft -= 200; });
  $('week-next').addEventListener('click', () => { $('week-tabs').scrollLeft += 200; });

  // 마우스 드래그 슬라이드 (과목필터 + 주차탭)
  function addDragScroll(el) {
    let isDown = false, startX, scrollStart;
    el.addEventListener('mousedown', e => {
      isDown = true; startX = e.pageX - el.offsetLeft; scrollStart = el.scrollLeft;
      el.style.cursor = 'grabbing';
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = ''; });
    el.addEventListener('mouseup',    () => { isDown = false; el.style.cursor = ''; });
    el.addEventListener('mousemove',  e => {
      if (!isDown) return;
      e.preventDefault();
      el.scrollLeft = scrollStart - (e.pageX - el.offsetLeft - startX);
    });
  }
  addDragScroll($('subject-filter'));
  addDragScroll($('week-tabs'));

  // 주차 설정 모달
  $('week-setting-btn').addEventListener('click', openWeekSettingModal);
  $('week-setting-close-btn').addEventListener('click', closeWeekSettingModal);
  $('week-setting-cancel-btn').addEventListener('click', closeWeekSettingModal);
  $('week-setting-save-btn').addEventListener('click', saveWeekSetting);
  $('week-setting-overlay').addEventListener('click', e => {
    if (e.target === $('week-setting-overlay')) closeWeekSettingModal();
  });

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

  // 공지 등록
  $('notice-submit-btn').addEventListener('click', submitNotice);

  // 공지 미리보기 (작성 폼)
  $('notice-preview-btn').addEventListener('click', () => {
    const content = $('notice-content').value.trim();
    if (!content) { alert('내용을 먼저 입력해주세요.'); return; }
    showNoticePreview(content, '작성 중인 내용입니다');
  });

  // 업데이트 공지 양식 버튼
  $('notice-template-btn').addEventListener('click', () => {
    const today = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });
    $('notice-content').value =
`업데이트 안내

ver.

📅 ${today}

─────────────────────
✅
✅
✅
─────────────────────

항상 이용해 주셔서 감사합니다 🙏`;
    $('notice-content').focus();
  });

  // 관리자 탭 전환
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
      tab.classList.add('admin-tab--active');
      const which = tab.dataset.adminTab;
      $('admin-tab-users').style.display   = which === 'users'   ? '' : 'none';
      $('admin-tab-bugs').style.display    = which === 'bugs'    ? '' : 'none';
      $('admin-tab-notices').style.display = which === 'notices' ? '' : 'none';
      if (which === 'bugs')    loadAndRenderBugReports();
      if (which === 'notices') renderAdminNotices();
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
      sb.from('profiles').select('is_admin, email, week_start_date, created_at, schedule_label, calendar_label, custom_subjects').eq('id', user.id).maybeSingle(),
      new Promise(res => setTimeout(() => res({ data: null, error: new Error('profile 타임아웃') }), 6000)),
    ]);
    console.log('[profile] 결과:', { profile, error: profileError?.message });

    isAdmin = profile?.is_admin ?? false;
    if (profile?.email) $('sidebar-email').textContent = profile.email.replace('@suran.app', '') + ' 님';

    // 1주차 시작일 설정
    const weekStartStr = profile?.week_start_date
      || getMondayOfWeek(profile?.created_at || user.created_at || todayStr);
    userWeekStart = new Date(weekStartStr);

    // suran 계정은 주차 범위 기본값 24주차
    if (!localStorage.getItem('weekRange')) {
      const username = (profile?.email || user.email || '').replace('@suran.app', '');
      if (username === 'suran') {
        visibleWeekRange = { from: 1, to: 24 };
        saveWeekRange();
      }
    }

    // 유저 설정 적용
    userSettings.scheduleLabel = profile?.schedule_label || '공부 스케줄';
    userSettings.calendarLabel = profile?.calendar_label || '공부 달력';
    const cs = profile?.custom_subjects;
    if (cs) userSettings.customSubjects = { hidden: cs.hidden || [], extras: cs.extras || [] };
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    updateMenuLabels();
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
      checkAndShowNotice();
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
      // 로그인 직후 → currentUser 없을 때만 onLogin 실행 (새로고침 시 INITIAL_SESSION 중복 방지)
      if (session?.user && !loggingIn && !currentUser) {
        await onLogin(session.user);
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
