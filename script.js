'use strict';

/* =============================================================
   1. 상수 & 기본 데이터
============================================================= */
const STORAGE_KEY = 'schedule_v5';
const WEEKS = Array.from({ length: 8 }, (_, i) => 20 + i); // 20 ~ 27주차

const SUBJECTS = {
  wireless:    { label: '📡 무선공학', cls: 'wireless' },
  electronics: { label: '⚡ 전자공학', cls: 'electronics' },
  comms:       { label: '📶 통신공학', cls: 'comms' },
};

const DEFAULT_COURSES = [
  // ── 전자공학 ──────────────────────────────────────────────
  { id:1001, subject:'electronics', name:'전자공학', week:20, status:'default', progress:'1',  duration:'31분',       deadline:'2026-05-17' },
  { id:1002, subject:'electronics', name:'전자공학', week:20, status:'default', progress:'2',  duration:'40분',       deadline:'2026-05-17' },
  { id:1003, subject:'electronics', name:'전자공학', week:20, status:'default', progress:'3',  duration:'38분',       deadline:'2026-05-17' },
  { id:1004, subject:'electronics', name:'전자공학', week:20, status:'default', progress:'4',  duration:'48분',       deadline:'2026-05-17' },
  { id:1005, subject:'electronics', name:'전자공학', week:21, status:'default', progress:'5',  duration:'45분',       deadline:'2026-05-24' },
  { id:1006, subject:'electronics', name:'전자공학', week:21, status:'default', progress:'6',  duration:'30분',       deadline:'2026-05-24' },
  { id:1007, subject:'electronics', name:'전자공학', week:21, status:'default', progress:'7',  duration:'38분',       deadline:'2026-05-24' },
  { id:1008, subject:'electronics', name:'전자공학', week:21, status:'default', progress:'8',  duration:'55분',       deadline:'2026-05-24' },
  { id:1009, subject:'electronics', name:'전자공학', week:22, status:'default', progress:'9',  duration:'42분',       deadline:'2026-05-31' },
  { id:1010, subject:'electronics', name:'전자공학', week:22, status:'default', progress:'10', duration:'39분',       deadline:'2026-05-31' },
  { id:1011, subject:'electronics', name:'전자공학', week:22, status:'default', progress:'11', duration:'1시간 15분', deadline:'2026-05-31' },
  { id:1012, subject:'electronics', name:'전자공학', week:23, status:'default', progress:'12', duration:'43분',       deadline:'2026-06-07' },
  { id:1013, subject:'electronics', name:'전자공학', week:23, status:'default', progress:'13', duration:'44분',       deadline:'2026-06-07' },
  { id:1014, subject:'electronics', name:'전자공학', week:23, status:'default', progress:'14', duration:'23분',       deadline:'2026-06-07' },
  { id:1015, subject:'electronics', name:'월말고사',  week:23, status:'default', progress:'',   duration:'40분',       deadline:'2026-06-07' },
  { id:1016, subject:'electronics', name:'전자공학', week:24, status:'default', progress:'15', duration:'38분',       deadline:'2026-06-14' },
  { id:1017, subject:'electronics', name:'전자공학', week:24, status:'default', progress:'16', duration:'29분',       deadline:'2026-06-14' },
  { id:1018, subject:'electronics', name:'전자공학', week:24, status:'default', progress:'17', duration:'36분',       deadline:'2026-06-14' },
  { id:1019, subject:'electronics', name:'전자공학', week:24, status:'default', progress:'18', duration:'1시간 3분',  deadline:'2026-06-14' },
  { id:1020, subject:'electronics', name:'전자공학',     week:25, status:'default', progress:'19', duration:'',      deadline:'2026-06-21' },
  { id:1021, subject:'electronics', name:'최종 모의고사', week:25, status:'default', progress:'',   duration:'33분',  deadline:'2026-06-21' },

  // ── 통신공학 ──────────────────────────────────────────────
  { id:2001, subject:'comms', name:'통신공학', week:20, status:'default', progress:'1',  duration:'31분',       deadline:'2026-05-17' },
  { id:2002, subject:'comms', name:'통신공학', week:20, status:'default', progress:'2',  duration:'36분',       deadline:'2026-05-17' },
  { id:2003, subject:'comms', name:'통신공학', week:20, status:'default', progress:'3',  duration:'35분',       deadline:'2026-05-17' },
  { id:2004, subject:'comms', name:'통신공학', week:20, status:'default', progress:'4',  duration:'44분',       deadline:'2026-05-17' },
  { id:2005, subject:'comms', name:'통신공학', week:21, status:'default', progress:'5',  duration:'43분',       deadline:'2026-05-24' },
  { id:2006, subject:'comms', name:'통신공학', week:21, status:'default', progress:'6',  duration:'1시간 27분', deadline:'2026-05-24' },
  { id:2007, subject:'comms', name:'통신공학', week:21, status:'default', progress:'7',  duration:'44분',       deadline:'2026-05-24' },
  { id:2008, subject:'comms', name:'통신공학', week:21, status:'default', progress:'8',  duration:'20분',       deadline:'2026-05-24' },
  { id:2009, subject:'comms', name:'통신공학', week:21, status:'default', progress:'9',  duration:'10분',       deadline:'2026-05-24' },
  { id:2010, subject:'comms', name:'통신공학', week:21, status:'default', progress:'10', duration:'1시간 21분', deadline:'2026-05-24' },
  { id:2011, subject:'comms', name:'통신공학', week:22, status:'default', progress:'11', duration:'52분',       deadline:'2026-05-31' },
  { id:2012, subject:'comms', name:'통신공학', week:22, status:'default', progress:'12', duration:'37분',       deadline:'2026-05-31' },
  { id:2013, subject:'comms', name:'통신공학', week:22, status:'default', progress:'13', duration:'59분',       deadline:'2026-05-31' },
  { id:2014, subject:'comms', name:'통신공학', week:23, status:'default', progress:'14', duration:'44분',       deadline:'2026-06-07' },
  { id:2015, subject:'comms', name:'통신공학', week:23, status:'default', progress:'15', duration:'48분',       deadline:'2026-06-07' },
  { id:2016, subject:'comms', name:'통신공학', week:23, status:'default', progress:'16', duration:'57분',       deadline:'2026-06-07' },
  { id:2017, subject:'comms', name:'월말평가',  week:24, status:'default', progress:'',   duration:'36분',       deadline:'2026-06-14' },
  { id:2018, subject:'comms', name:'통신공학', week:24, status:'default', progress:'17', duration:'52분',       deadline:'2026-06-14' },
  { id:2019, subject:'comms', name:'통신공학', week:24, status:'default', progress:'18', duration:'52분',       deadline:'2026-06-14' },
  { id:2020, subject:'comms', name:'통신공학', week:25, status:'default', progress:'19', duration:'48분',       deadline:'2026-06-21' },
  { id:2021, subject:'comms', name:'통신공학', week:25, status:'default', progress:'20', duration:'38분',       deadline:'2026-06-21' },
  { id:2022, subject:'comms', name:'통신공학', week:25, status:'default', progress:'21', duration:'55분',       deadline:'2026-06-21' },
  { id:2023, subject:'comms', name:'통신공학', week:26, status:'default', progress:'22', duration:'54분',       deadline:'2026-06-28' },
  { id:2024, subject:'comms', name:'통신공학', week:26, status:'default', progress:'23', duration:'41분',       deadline:'2026-06-28' },
  { id:2025, subject:'comms', name:'통신공학', week:26, status:'default', progress:'24', duration:'48분',       deadline:'2026-06-28' },

  // ── 무선공학 (24주차~) ────────────────────────────────────
  { id:3001, subject:'wireless', name:'월말고사',    week:24, status:'default', progress:'',   duration:'38분', deadline:'2026-06-14' },
  { id:3002, subject:'wireless', name:'무선공학',    week:24, status:'default', progress:'17', duration:'38분', deadline:'2026-06-14' },
  { id:3003, subject:'wireless', name:'무선공학',    week:24, status:'default', progress:'18', duration:'52분', deadline:'2026-06-14' },
  { id:3004, subject:'wireless', name:'무선공학',    week:25, status:'default', progress:'19', duration:'1시간', deadline:'2026-06-21' },
  { id:3005, subject:'wireless', name:'무선공학',    week:25, status:'default', progress:'20', duration:'40분', deadline:'2026-06-21' },
  { id:3006, subject:'wireless', name:'무선공학',    week:25, status:'default', progress:'21', duration:'46분', deadline:'2026-06-21' },
  { id:3007, subject:'wireless', name:'무선공학',    week:26, status:'default', progress:'22', duration:'54분', deadline:'2026-06-28' },
  { id:3008, subject:'wireless', name:'무선공학',    week:26, status:'default', progress:'23', duration:'46분', deadline:'2026-06-28' },
  { id:3009, subject:'wireless', name:'무선공학',    week:26, status:'default', progress:'24', duration:'54분', deadline:'2026-06-28' },
  { id:3010, subject:'wireless', name:'무선공학',    week:26, status:'default', progress:'25', duration:'55분', deadline:'2026-06-28' },
  { id:3011, subject:'wireless', name:'무선공학',    week:27, status:'default', progress:'26', duration:'27분', deadline:'2026-07-05' },
  { id:3012, subject:'wireless', name:'최종모의고사', week:27, status:'default', progress:'',   duration:'21분', deadline:'2026-07-05' },
];

/* =============================================================
   2. 앱 상태
============================================================= */
let courses       = [];
let activeWeek    = 21;
let activeSubject = 'all';

// 달력 상태
const today = new Date();
let calYear  = today.getFullYear();
let calMonth = today.getMonth();

/* =============================================================
   3. 유틸리티
============================================================= */
// ID로 DOM 요소 조회
const $ = (id) => document.getElementById(id);

// Date → 'YYYY-MM-DD' 문자열
function fmtDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// XSS 방지 이스케이프
function esc(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str || '').replace(/[&<>"']/g, ch => map[ch]);
}

// 요일 → CSS Grid 컬럼 번호 (월=1 … 일=7)
function dayToGridCol(date) {
  const dow = date.getDay();
  return dow === 0 ? 7 : dow;
}

const todayStr = fmtDate(today); // 오늘 날짜 문자열 (비교용)

/* =============================================================
   4. 저장소
============================================================= */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function load() {
  const stored = localStorage.getItem(STORAGE_KEY);
  courses = stored
    ? JSON.parse(stored)
    : JSON.parse(JSON.stringify(DEFAULT_COURSES)); // 깊은 복사
  if (!stored) save();
}

/* =============================================================
   5. UI 헬퍼 (배지, 마감일 라벨)
============================================================= */
function deadlineLabel(dateStr) {
  if (!dateStr) return '-';

  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const endDate   = new Date(dateStr); endDate.setHours(0, 0, 0, 0);
  const startDate = new Date(endDate); startDate.setDate(endDate.getDate() - 6);

  const fmt      = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const diffDays = Math.round((endDate - todayDate) / 86400000);

  let badge = '';
  if (diffDays === 0)    badge = ' <span class="d-badge d-badge--near">D-day</span>';
  else if (diffDays > 0) badge = `<span class="d-badge${diffDays <= 7 ? ' d-badge--near' : ''}">D-${diffDays}</span>`;
  else                   badge = ` <span class="d-badge d-badge--over">D+${Math.abs(diffDays)}</span>`;

  return `${fmt(startDate)} - ${fmt(endDate)}${badge}`;
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

function subjectBadge(subject) {
  const info = SUBJECTS[subject];
  if (!info) return '-';
  return `<span class="subject-badge subject-badge--${info.cls}">${info.label}</span>`;
}

/* =============================================================
   6. 스케줄 뷰
============================================================= */
function updateSummary() {
  const total   = courses.length;
  const done    = courses.filter(c => c.status === 'done').length;
  const delayed = courses.filter(c => c.status === 'delayed').length;
  const rate    = total ? Math.round(done / total * 100) : 0;

  $('total-count').textContent   = total;
  $('done-count').textContent    = done;
  $('delayed-count').textContent = delayed;
  $('overall-rate').textContent  = rate + '%';
  $('overall-bar').style.width   = rate + '%';
}

function renderWeekTabs() {
  const nav = $('week-tabs');
  nav.innerHTML = '';

  WEEKS.forEach(week => {
    const count = courses.filter(c =>
      c.week === week && (activeSubject === 'all' || c.subject === activeSubject)
    ).length;

    const btn = document.createElement('button');
    btn.className   = `week-tab${week === activeWeek ? ' active' : ''}`;
    btn.textContent = `${week}주차${count ? ` (${count})` : ''}`;
    btn.addEventListener('click', () => { activeWeek = week; renderSchedule(); });
    nav.appendChild(btn);
  });
}

function renderTableRows() {
  const tbody      = $('table-body');
  const emptyState = $('empty-state');
  const table      = $('schedule-table');

  let list = courses.filter(c => c.week === activeWeek);
  if (activeSubject !== 'all') list = list.filter(c => c.subject === activeSubject);

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
    return `<tr class="row--${course.subject || ''} ${isDone ? 'row--done' : ''}">
      <td><button class="check-btn ${isDone ? 'checked' : ''}" data-check="${course.id}" title="완료 토글">✔</button></td>
      <td>${subjectBadge(course.subject)}</td>
      <td class="col-name">${esc(course.name)}</td>
      <td class="col-progress">${esc(course.progress) || '-'}</td>
      <td class="col-duration">${esc(course.duration) || '-'}</td>
      <td class="col-deadline">${deadlineLabel(course.deadline)}</td>
      <td>${statusBadge(course.status)}</td>
      <td>
        <button class="btn btn--icon" data-edit="${course.id}" title="수정">✏️</button>
        <button class="btn btn--icon" data-del="${course.id}"  title="삭제">🗑</button>
      </td>
    </tr>`;
  }).join('');

  // 행 내부 버튼 이벤트
  tbody.querySelectorAll('[data-check]').forEach(btn =>
    btn.addEventListener('click', () => toggleDone(Number(btn.dataset.check)))
  );
  tbody.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => openModal(Number(btn.dataset.edit)))
  );
  tbody.querySelectorAll('[data-del]').forEach(btn =>
    btn.addEventListener('click', () => deleteCourse(Number(btn.dataset.del)))
  );
}

function renderSchedule() {
  updateSummary();
  renderWeekTabs();
  renderTableRows();
}

function toggleDone(id) {
  const course = courses.find(c => c.id === id);
  if (!course) return;
  course.status = course.status === 'done' ? 'default' : 'done';
  save();
  renderSchedule();
  renderCalendar();
}

function deleteCourse(id) {
  if (!confirm('이 강의를 삭제할까요?')) return;
  courses = courses.filter(c => c.id !== id);
  save();
  renderSchedule();
  renderCalendar();
}

/* =============================================================
   7. 달력 뷰
============================================================= */

// 한 주(7일)의 날짜 셀 HTML 생성
function buildDayCells(week) {
  return week.map((date, i) => {
    const inMonth = date.getMonth() === calMonth;
    const isToday = fmtDate(date) === todayStr;
    const dow     = date.getDay();

    const cls = [
      'cal-day',
      !inMonth ? 'cal-day--other' : '',
      dow === 6 ? 'cal-day--sat' : '',
      dow === 0 ? 'cal-day--sun' : '',
      isToday   ? 'cal-day--today' : '',
    ].filter(Boolean).join(' ');

    return `<div class="${cls}" style="grid-column:${i + 1}; grid-row:1 / -1">
      <span class="cal-day__num">${date.getDate()}</span>
    </div>`;
  }).join('');
}

// 한 주의 이벤트 바 HTML 생성 (과목별로 스패닝)
function buildEventBars(weekCourses, weekStart, weekEnd) {
  // 과목별로 완료수/전체수 집계
  const bySubject = {};
  weekCourses.forEach(course => {
    if (!bySubject[course.subject]) bySubject[course.subject] = { total: 0, done: 0 };
    bySubject[course.subject].total++;
    if (course.status === 'done') bySubject[course.subject].done++;
  });

  return Object.entries(bySubject).map(([subject, info], idx) => {
    const subjectInfo = SUBJECTS[subject];
    const icon        = subjectInfo ? subjectInfo.label.split(' ')[0] : '';
    const name        = subjectInfo ? subjectInfo.label.split(' ').slice(1).join(' ') : subject;
    const allDone     = info.done === info.total;
    const countLabel  = `${info.total}강`;

    // 마감일 기준 월~일로 범위 설정 (이번 주 내에서 clamp)
    const evStart  = new Date(weekEnd); evStart.setDate(weekEnd.getDate() - 6);
    const effStart = evStart < weekStart ? weekStart : evStart;
    const colStart = dayToGridCol(effStart);
    const colEnd   = dayToGridCol(weekEnd) + 1; // 일요일+1 = 8 (끝 컬럼)

    const week = weekCourses[0]?.week ?? '';
    return `<div class="cal-event cal-event--${subject}${allDone ? ' cal-event--done' : ''}"
      style="grid-column:${colStart}/${colEnd}; grid-row:${idx + 2}"
      data-week="${week}" data-subject="${subject}">
      <span class="cal-event__icon">${icon}</span>
      <span class="cal-event__name">${name}</span>
      <span class="cal-event__count">${countLabel}</span>
      ${allDone ? '<span class="cal-event__done-mark">✔</span>' : ''}
    </div>`;
  }).join('');
}

function renderCalendar() {
  const grid = $('cal-grid');
  if (!grid) return;

  // 마감일(일요일) 기준으로 강의 그룹화
  const byDeadline = {};
  courses.forEach(course => {
    if (!course.deadline) return;
    (byDeadline[course.deadline] = byDeadline[course.deadline] || []).push(course);
  });

  // 달력 표시 범위: 달 첫날의 직전 월요일 ~ 달 마지막날의 직후 일요일
  const firstOfMonth = new Date(calYear, calMonth, 1);
  const startDow     = firstOfMonth.getDay();
  const calStart     = new Date(firstOfMonth);
  calStart.setDate(calStart.getDate() - (startDow === 0 ? 6 : startDow - 1));

  const lastOfMonth = new Date(calYear, calMonth + 1, 0);
  const endDow      = lastOfMonth.getDay();
  const calEnd      = new Date(lastOfMonth);
  calEnd.setDate(calEnd.getDate() + (endDow === 0 ? 0 : 7 - endDow));

  // 주차별 HTML 생성
  let html = '';
  const cur = new Date(calStart);

  while (cur <= calEnd) {
    const week = Array.from({ length: 7 }, () => {
      const d = new Date(cur);
      cur.setDate(cur.getDate() + 1);
      return d;
    });

    const weekSun     = week[6]; // 이번 주 일요일 = 마감일 기준
    const weekCourses = byDeadline[fmtDate(weekSun)] || [];

    const dayCells  = buildDayCells(week);
    const eventBars = buildEventBars(weekCourses, week[0], weekSun);

    html += `<div class="cal-week">${dayCells}${eventBars}</div>`;
  }

  grid.innerHTML = html;
  $('cal-month-label').textContent =
    new Date(calYear, calMonth).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
}

/* =============================================================
   8. 뷰 전환
============================================================= */
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('menu-btn--active'));
  $(`view-${viewId}`).classList.add('view--active');
  document.querySelector(`[data-view="${viewId}"]`).classList.add('menu-btn--active');
  if (viewId === 'calendar') renderCalendar();
}

/* =============================================================
   9. 모달
============================================================= */
function openModal(editId = null) {
  // 주차 옵션 생성
  $('f-week').innerHTML = WEEKS.map(w =>
    `<option value="${w}" ${w === activeWeek ? 'selected' : ''}>${w}주차</option>`
  ).join('');

  if (editId) {
    const course = courses.find(c => c.id === editId);
    if (!course) return;
    $('modal-title').textContent = '강의 수정';
    $('edit-id').value    = course.id;
    $('f-name').value     = course.name;
    $('f-subject').value  = course.subject || 'wireless';
    $('f-week').value     = course.week;
    $('f-status').value   = course.status;
    $('f-progress').value = course.progress;
    $('f-duration').value = course.duration;
    $('f-deadline').value = course.deadline;
  } else {
    $('modal-title').textContent = '강의 추가';
    $('course-form').reset();
    $('edit-id').value  = '';
    $('f-week').value   = activeWeek;
    $('f-status').value = 'default';
    if (activeSubject !== 'all') $('f-subject').value = activeSubject;
  }

  $('modal-overlay').classList.add('open');
  $('f-name').focus();
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const name = $('f-name').value.trim();
  if (!name) { $('f-name').focus(); return; }

  const editId     = $('edit-id').value;
  const courseData = {
    id:       editId ? Number(editId) : Date.now(),
    name,
    subject:  $('f-subject').value,
    week:     Number($('f-week').value),
    status:   $('f-status').value,
    progress: $('f-progress').value.trim(),
    duration: $('f-duration').value.trim(),
    deadline: $('f-deadline').value,
  };

  if (editId) {
    const idx = courses.findIndex(c => c.id === courseData.id);
    if (idx !== -1) courses[idx] = courseData;
  } else {
    courses.push(courseData);
  }

  activeWeek = courseData.week;
  save();
  closeModal();
  renderSchedule();
  renderCalendar();
}

/* =============================================================
   10. 이벤트 바인딩
============================================================= */
function bindEvents() {
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

  // 달력 이벤트 바 클릭 → 해당 주차 스케줄로 이동
  $('cal-grid').addEventListener('click', e => {
    const bar = e.target.closest('.cal-event');
    if (!bar) return;
    const week   = Number(bar.dataset.week);
    const subject = bar.dataset.subject;
    if (!week) return;
    activeWeek    = week;
    activeSubject = subject;
    document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.subject-btn[data-subject="${subject}"]`).classList.add('active');
    switchView('schedule');
    renderSchedule();
  });

  // 달력 월 이동
  $('cal-prev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  $('cal-next').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // 모달 열기/닫기
  $('open-modal-btn').addEventListener('click', () => openModal());
  $('close-modal-btn').addEventListener('click', closeModal);
  $('cancel-btn').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });
  $('course-form').addEventListener('submit', handleFormSubmit);
}

/* =============================================================
   11. 초기화
============================================================= */
function setTodayLabel() {
  const label = today.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
  $('today-date').textContent     = label;
  $('cal-today-date').textContent = label;
}

function init() {
  load();
  setTodayLabel();
  bindEvents();
  renderSchedule();
}

init();
