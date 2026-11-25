/* CGPA Studio — client-side application.
 * Keep storage keys and JSON indices stable for backwards compatibility.
 * No server requests are needed to calculate or save grades.
 */

// Default curriculum and grading scale
const data = [
    [
        ['CSE 1101', 'Elementary Structured Programming', 3], ['CSE 1102', 'Elementary Structured Programming Lab', 1.5], ['CSE 1108', 'Introduction to Computer Systems', 1.5], ['HUM 1107', 'Critical Thinking and Communication', 3], ['HUM 1108', 'English Language Sessional', 1.5], ['MATH 1115', 'Mathematics-I', 3], ['PHY 1115', 'Physics', 3], ['PHY 1116', 'Physics Lab', .75], ['CHEM 1115', 'Chemistry', 3]
    ],
    [
        ['CSE 1200', 'Software Development-I', 1.5], ['CSE 1203', 'Discrete Mathematics', 3], ['CSE 1205', 'Object Oriented Programming', 3], ['CSE 1206', 'Object Oriented Programming Lab', 1.5], ['EEE 1241', 'Basic Electrical Engineering', 3], ['EEE 1242', 'Basic Electrical Engineering Lab', 1.5], ['MATH 1219', 'Mathematics-II', 3], ['ME 1211', 'Basic Mechanical Engineering', 3], ['ME 1214', 'Engineering Drawing', .75]
    ],
    [
        ['CSE 2100', 'Software Development-II', .75], ['CSE 2103', 'Data Structures', 3], ['CSE 2104', 'Data Structures Lab', 1.5], ['CSE 2105', 'Digital Logic Design', 3], ['CSE 2106', 'Digital Logic Design Lab', 1.5], ['EEE 2141', 'Electronic Devices and Circuits', 3], ['EEE 2142', 'Electronic Devices and Circuits Lab', 1.5], ['HUM 2109', 'Society, Ethics and Technology', 3], ['MATH 2101', 'Mathematics-III', 3]
    ],
    [
        ['CSE 2200', 'Software Development-III', .75], ['CSE 2201', 'Numerical Methods', 3], ['CSE 2202', 'Numerical Methods Lab', .75], ['CSE 2207', 'Algorithms', 3], ['CSE 2208', 'Algorithms Lab', 1.5], ['CSE 2211', 'Data Communication', 3], ['CSE 2213', 'Computer Architecture', 3], ['CSE 2214', 'Assembly Language Programming', 1.5], ['MATH 2203', 'Mathematics-IV', 3]
    ],
    [
        ['CSE 3100', 'Software Development-IV', .75], ['CSE 3101', 'Mathematical Analysis for Computer Science', 3], ['CSE 3103', 'Database', 3], ['CSE 3104', 'Database Lab', 1.5], ['CSE 3109', 'Digital System Design', 3], ['CSE 3110', 'Digital System Design Lab', .75], ['CSE 3117', 'Microprocessors and Microcontrollers', 3], ['CSE 3118', 'Microprocessors and Microcontrollers Lab', .75], ['HUM 3115', 'Economics and Accounting', 3]
    ],
    [
        ['CSE 3200', 'Software Development-V', .75], ['CSE 3201', 'Introduction to Computer Networks', 3], ['CSE 3202', 'Introduction to Computer Networks Lab', .75], ['CSE 3207', 'Introduction to Artificial Intelligence', 3], ['CSE 3208', 'Introduction to Artificial Intelligence Lab', .75], ['CSE 3213', 'Operating System', 3], ['CSE 3214', 'Operating System Lab', .75], ['CSE 3223', 'Information System Design and Software Engineering', 3], ['CSE 3224', 'Information System Design and Software Engineering Lab', .75], ['HUM 3207', 'Industrial Law and Safety Management', 3]
    ],
    [
        ['IPE 4111', 'Industrial Management', 3], ['CSE 4173', 'Cyber Security', 3], ['CSE 4174', 'Cyber Security Lab', .75], ['CSE 4129', 'Formal Languages and Compilers', 3], ['CSE 4130', 'Formal Languages and Compilers Lab', .75], ['CSE 4137', 'Soft Computing', 3], ['CSE 4138', 'Soft Computing Lab', .75], ['CSE 4113', 'Pattern Recognition and Machine Learning', 3], ['CSE 4114', 'Pattern Recognition and Machine Learning Lab', .75], ['CSE 4100', 'Project and Thesis-I', 3]
    ],
    [
        ['CSE 4227', 'Digital Image Processing', 3], ['CSE 4228', 'Digital Image Processing Lab', .75], ['CSE 4203', 'Computer Graphics', 3], ['CSE 4204', 'Computer Graphics Lab', .75], ['CSE 4263', 'Internet of Things (IoT)', 3], ['CSE 4264', 'Internet of Things Lab', .75], ['CSE 4267', 'Cloud Computing', 3], ['CSE 4250', 'Project and Thesis-II', 3]
    ]
];
const grades = [
    ['Not entered', null], ['F', 0], ['D', 2], ['C', 2.25], ['C+', 2.5], ['B−', 2.75], ['B', 3], ['B+', 3.25], ['A−', 3.5], ['A', 3.75], ['A+', 4]
], labels = [
    '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'
];
const theoryCodes = new Set('CSE 1101|HUM 1107|MATH 1115|PHY 1115|CHEM 1115|CSE 1203|CSE 1205|EEE 1241|MATH 1219|ME 1211|CSE 2103|CSE 2105|EEE 2141|HUM 2109|MATH 2101|CSE 2201|CSE 2207|CSE 2211|CSE 2213|MATH 2203|CSE 3101|CSE 3103|CSE 3109|CSE 3117|HUM 3115|CSE 3201|CSE 3207|CSE 3213|CSE 3223|HUM 3207|IPE 4111|CSE 4173|CSE 4129|CSE 4137|CSE 4113|CSE 4227|CSE 4203|CSE 4263|CSE 4267'.split('|')), thesisCodes = new Set(['CSE 4100', 'CSE 4250']);
let all = data.flatMap((s, sem) => s.map(([code, name, credit]) => ({ code, name, credit, sem, theory: theoryCodes.has(code), type: theoryCodes.has(code) ? 'Theory' : thesisCodes.has(code) ? 'Thesis' : 'Lab / Sessional' }))), byCode = Object.fromEntries(all.map(c => [c.code, c])), total = all.reduce((s, c) => s + c.credit, 0);
const $ = id => document.getElementById(id), key = 'aust-cgpa-v1';
let values = {}, exams = [], page = 0, view = 'semester', target = 3.5, start = 6, allowImprove = 'yes';

// Curriculum validation and data migration
const courseTypes = ['Theory', 'Lab / Sessional', 'Thesis'];
function curriculum() {
    return { semesters: [...labels], courses: all.map(c => ({ code: c.code, name: c.name, credits: c.credit, type: c.type, semester: c.sem + 1 })) };
}
function validateCurriculum(x) {
    if (!x || !Array.isArray(x.semesters) || x.semesters.length < 1 || x.semesters.length > 24 || !Array.isArray(x.courses) || x.courses.length > 1000 || !x.courses.length)
        throw Error('Provide 1–24 semesters and 1–1000 courses.');
    let sem = x.semesters.map(l => {
        if (typeof l !== 'string' || !l.trim() || l.length > 24 || !/^[-a-zA-Z0-9 /_.]+$/.test(l))
            throw Error('Invalid semester label. Use letters, numbers, spaces or hyphens.');
        return l.trim();
    });
    if (new Set(sem).size !== sem.length)
        throw Error('Semester labels must be unique.');
    let seen = new Set();
    let courses = x.courses.map(c => {
        if (!c || typeof c.code !== 'string' || !/^[-a-zA-Z0-9 /_.]{1,40}$/.test(c.code) || !c.code.trim() || Object.prototype.hasOwnProperty.call(Object.prototype, c.code.trim()) || c.code.trim() === 'prototype' || !['Theory', 'Lab / Sessional', 'Thesis'].includes(c.type) || typeof c.name !== 'string' || !c.name.trim() || c.name.length > 180 || typeof c.credits !== 'number' || !Number.isFinite(c.credits) || c.credits <= 0 || c.credits > 60 || !Number.isInteger(c.semester) || c.semester < 1 || c.semester > sem.length)
            throw Error('Invalid course: ' + (c?.code || '(missing code)'));
        let code = c.code.trim();
        if (seen.has(code))
            throw Error('Duplicate course code: ' + code);
        seen.add(code);
        return { code, name: c.name.trim(), credits: c.credits, type: c.type, semester: c.semester };
    });
    return { semesters: sem, courses };
}
function applyCurriculum(x) {
    let c = validateCurriculum(x);
    labels.splice(0, labels.length, ...c.semesters);
    all = c.courses.map(r => ({ code: r.code, name: r.name, credit: r.credits, type: r.type, theory: r.type === 'Theory', sem: r.semester - 1 }));
    data.splice(0, data.length, ...labels.map((_, i) => all.filter(c => c.sem === i).map(c => [c.code, c.name, c.credit])));
    byCode = Object.fromEntries(all.map(c => [c.code, c]));
    total = all.reduce((n, c) => n + c.credit, 0);
}
function clean(x) {
    let v = {};
    const old = x.values || {};
    x = { ...x, values: { ...old } };
    if (!byCode['CSE 4200'] && byCode['CSE 4250'] && !Object.hasOwn(old, 'CSE 4250') && Object.hasOwn(old, 'CSE 4200'))
        x.values['CSE 4250'] = old['CSE 4200'];
    for (const [code, n] of Object.entries(x.values || {}))
        if (Object.hasOwn(byCode, code) && Number.isInteger(n) && n >= 0 && n <= 10)
            v[code] = n;
    let e = Array.isArray(x.exams) ? x.exams.filter(r => r && Object.hasOwn(byCode, r.code) && ['carry', 'clearance', 'improvement'].includes(r.type) && Number.isInteger(r.sem) && r.sem >= 0 && r.sem < labels.length && Number.isInteger(r.grade) && r.grade >= 1 && r.grade <= 8).map(r => ({ code: r.code, type: r.type, sem: r.sem, grade: r.grade })) : [];
    return { values: v, exams: e, page: Number.isInteger(x.page) && x.page >= 0 && x.page < labels.length ? x.page : 0, target: Number.isFinite(x.target) ? x.target : 3.5, start: Number.isInteger(x.start) && x.start >= 0 && x.start < labels.length ? x.start : Math.max(0, labels.length - 2), allowImprove: x.allowImprove === 'no' ? 'no' : 'yes' };
}
try {
    let saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (saved.curriculum)
        applyCurriculum(saved.curriculum);
    ({ values, exams, page, target, start, allowImprove } = clean(saved));
}
catch (e) {
}
const idx = code => values[code] || 0, gp = n => grades[n][1], fmt = n => {
    if (n == null)
        return '—';
    let x = n * 1000, k = Math.floor(x), f = x - k;
    return ((Math.abs(f - .5) < 1e-9 ? k + (k % 2) : Math.round(x)) / 1000).toFixed(3);
}, gradeText = n => grades[n][0], nameType = t => t[0].toUpperCase() + t.slice(1), num = n => Number(n.toFixed(4));
function save() {
    try {
        localStorage.setItem(key, JSON.stringify({ schemaVersion: 2, curriculum: curriculum(), values, exams, page, target, start, allowImprove }));
        $('saveStatus').textContent = 'Saved on this device';
    }
    catch (e) {
        $('saveStatus').textContent = 'Local saving unavailable';
    }
}

// Credit-weighted GPA and repeat examination engine
function calc(map, excludeF = true) {
    let points = 0, credits = 0;
    for (const [code, n] of Object.entries(map)) {
        if (n && (n !== 1 || !excludeF)) {
            let c = byCode[code].credit;
            credits += c;
            points += c * gp(n);
        }
    }
    return { credits, points, avg: credits ? points / credits : null };
}
function eligibility(c, type, sem, state, history) {
    let n = state[c.code] || 0, orig = idx(c.code), h = history.filter(r => r.code === c.code), here = history.filter(r => r.sem === sem);
    if (!c.theory)
        return 'Only theory courses are supported';
    if (type === 'improvement') {
        if (c.credit !== 3)
            return 'Only 3-credit theory courses qualify for improvement';
        if (c.sem > sem || orig < 2 || orig >= 8 || n < 2 || n >= 8 || h.length)
            return 'Requires an original passing grade below A− and no prior repeat';
        if (here.filter(r => r.type === 'improvement').length >= 2)
            return 'Two improvements already in this semester';
        if (history.filter(r => r.type === 'improvement').length >= 8)
            return 'Eight improvements already used';
    }
    else {
        if (n !== 1)
            return 'Course must have an unresolved F';
        if (type === 'clearance' && (c.sem !== sem || orig !== 1 || h.length))
            return 'Clearance only after original F in the same semester, once';
        if (type === 'carry' && c.sem >= sem)
            return 'Carry must be from an earlier semester';
        if (here.some(r => r.code === c.code))
            return 'Only one repeat per course in this semester';
        if (here.filter(r => r.type !== 'improvement').length >= 2)
            return 'Two carry/clearance exams already in this semester';
    }
    return '';
}
function model() {
    let state = {}, history = [], invalid = [], terms = [], original = {};
    for (let sem = 0; sem < labels.length; sem++) {
        let term = {};
        for (const c of all.filter(c => c.sem === sem)) {
            let n = idx(c.code);
            if (n) {
                state[c.code] = n;
                original[c.code] = n;
                term[c.code] = n;
            }
        }
        for (const [i, r] of exams.entries()) {
            if (r.sem !== sem)
                continue;
            let why = eligibility(byCode[r.code], r.type, sem, state, history);
            if (r.grade > (r.type === 'improvement' ? 8 : 6))
                why = 'Grade exceeds examination cap';
            if (why) {
                invalid.push({ i, why });
                continue;
            }
            state[r.code] = r.grade;
            term[r.code] = r.grade;
            history.push({ ...r, i });
        }
        let failed = Object.keys(state).filter(c => state[c] === 1);
        terms.push({ state: { ...state }, term, original: { ...original }, gpa: calc(term), cum: calc(state), raw: calc(state, false), orig: calc(original, false), failed, history: [...history] });
    }
    return { terms, history, invalid, state, original };
}

// Display helpers and course status
const esc = s => String(s).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
function gradeTone(n) {
    return n == null ? 'unset' : n === 0 ? 'fail' : n >= 3.5 ? 'high' : n >= 3 ? 'good' : n >= 2.5 ? 'mid' : 'low';
}
function gradeMarkup(n, points = false) {
    return `<span class="gradeTone" data-tone="${gradeTone(gp(n))}">${points ? (n ? gp(n).toFixed(2) : '—') : gradeText(n)}</span>`;
}
function statusFor(c, m) {
    let h = m.history.filter(r => r.code === c.code), n = m.state[c.code] || 0, last = h.at(-1);
    if (n === 1)
        return { kind: 'failed', text: last ? 'Unresolved F · ' + nameType(last.type) : 'Unresolved F' };
    if (last)
        return { kind: last.type, text: ({ improvement: 'Improved', clearance: 'Cleared', carry: 'Carried' })[last.type] };
    if (c.theory && c.credit === 3 && n >= 2 && n < 8 && idx(c.code) >= 2 && idx(c.code) < 8 && c.sem < labels.length - 1 && m.history.filter(r => r.type === 'improvement').length < 8)
        return { kind: 'eligible', text: 'Improvement eligible' };
    return { kind: '', text: '' };
}
function matchesStatus(c, m, i) {
    let h = m.history.filter(r => r.code === c.code);
    return i === 0 ? statusFor(c, m).kind === 'eligible' : i === 1 ? h.some(r => r.type === 'improvement') : i === 2 ? h.some(r => r.type === 'carry') : i === 3 ? h.some(r => r.type === 'clearance') : i === 4 ? m.state[c.code] === 1 : i === 5 ? !h.length : false;
}
function courseLink(c, m) {
    let st = statusFor(c, m);
    return `<button type="button" class="courseName" data-course-detail="${esc(c.code)}" data-status="${st.kind}" title="${esc(st.text ? st.text + ' · View details' : 'View course details')}">${esc(c.name)}</button><span class="courseFlag" ${st.text ? '' : 'hidden'}>${esc(st.text)}</span>`;
}
const legend = '<details class="statusKey"><summary>Colour key</summary><div class="courseLegend"><span class="eligible">Improvement eligible</span><span class="improvement">Improved</span><span class="clearance">Cleared</span><span class="carry">Carried</span><span class="failed">Unresolved F</span></div></details>';
let detailCourse = null;
function renderCourseDetail(c, m) {
    let n = idx(c.code), latest = m.state[c.code] || 0, h = m.history.filter(r => r.code === c.code), st = statusFor(c, m), gain = n && latest ? (gp(latest) - gp(n)) * c.credit : null;
    let eligibleTerms = type => labels.filter((_, i) => {
        if (i < c.sem || (type === 'improvement' && i === c.sem))
            return false;
        if (type === 'improvement' && m.history.filter(r => r.type === 'improvement').length >= 8)
            return false;
        let t = m.terms[i];
        return !eligibility(c, type, i, t.state, t.history) && !m.history.some(r => r.code === c.code && r.sem > i);
    }).join(', ');
    let rule = (type) => {
        if (!c.theory)
            return 'Theory courses only';
        if (type === 'improvement' && c.credit !== 3)
            return '3-credit theory only';
        if (!n)
            return 'Enter regular grade first';
        if (type === 'improvement' && (n < 2 || n >= 8 || h.length))
            return 'Ineligible: grade or repeat history';
        if (type !== 'improvement' && latest !== 1)
            return 'No unresolved F';
        return eligibleTerms(type) || 'No eligible semester slot';
    };
    $('detailCode').textContent = c.code;
    $('detailTitle').textContent = c.name;
    $('detailMeta').textContent = `Semester ${labels[c.sem]} · ${c.type} · ${c.credit} credits`;
    $('detailBody').innerHTML = `${st.text ? `<p><span class="courseName" data-status="${st.kind}">${esc(st.text)}</span></p>` : ''}<div class="detailFacts"><div><small>Regular grade</small><strong>${gradeMarkup(n)}</strong><small>${gradeMarkup(n, true)} GP</small></div><div><small>Latest valid grade</small><strong>${gradeMarkup(latest)}</strong><small>${gradeMarkup(latest, true)} GP</small></div><div><small>Weighted grade points</small><strong>${latest ? num(gp(latest) * c.credit) : '—'}</strong></div><div><small>Repeat CGPA change*</small><strong>${gain === null ? '—' : (gain > 0 ? '+' : '') + fmt(gain / total)}</strong></div></div><h3>Exam history</h3>${exams.some(r => r.code === c.code) ? `<table><thead><tr><th>Semester</th><th>Exam</th><th>Grade</th><th>Status</th></tr></thead><tbody>${exams.map((r, i) => ({ ...r, i })).filter(r => r.code === c.code).sort((a, b) => a.sem - b.sem).map(r => {
        let bad = m.invalid.find(x => x.i === r.i);
        return `<tr><td>${labels[r.sem]}</td><td>${nameType(r.type)}</td><td>${gradeMarkup(r.grade)}</td><td class="${bad ? 'bad' : 'good'}">${bad ? esc(bad.why) : 'Included'}</td></tr>`;
    }).join('')}</tbody></table>` : '<p>No repeat exam records.</p>'}<h3>Repeat exam eligibility</h3><div class="detailList">${['improvement', 'clearance', 'carry'].map(t => `<div><span>${nameType(t)}</span><span>${esc(rule(t))}</span></div>`).join('')}</div><p class="foot">Improvement: max A− (3.50); carry / clearance: max B (3.00). Listed semesters are modeled slots, not confirmed registration dates.</p><p class="foot">*Change in weighted points divided by ${total} graduation credits, compared with original grade.</p>`;
}
$('closeDetail').onclick = () => $('courseDialog').close();
$('courseDialog').addEventListener('close', () => detailCourse = null);
$('courseDialog').addEventListener('click', e => {
    if (e.target === $('courseDialog')) {
        let r = $('courseDialog').getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
            $('courseDialog').close();
    }
});
$('gotoCourse').onclick = () => {
    if (!detailCourse)
        return;
    page = byCode[detailCourse].sem;
    view = 'semester';
    $('courseDialog').close();
    show();
    window.scrollTo(0, 0);
};
document.addEventListener('click', e => {
    let b = e.target.closest('[data-course-detail]');
    if (!b)
        return;
    detailCourse = b.dataset.courseDetail;
    renderCourseDetail(byCode[detailCourse], model());
    if (!$('courseDialog').open)
        $('courseDialog').showModal();
});
function updateCourseVisuals(m) {
    document.querySelectorAll('#courses input[type=range]').forEach(el => el.style.setProperty('--fill', (+el.value * 10) + '%'));
    document.querySelectorAll('#courses [data-course-detail]').forEach(b => {
        let c = byCode[b.dataset.courseDetail], st = statusFor(c, m);
        b.dataset.status = st.kind;
        let f = b.nextElementSibling;
        f.textContent = st.text;
        f.hidden = !st.text;
        b.title = st.text ? st.text + ' · View details' : 'View course details';
        let row = b.closest('.course'), g = row.querySelector('.grade');
        g.dataset.tone = gradeTone(gp(idx(c.code)));
        let n = m.state[c.code] || 0;
        g.querySelector('.latestGrade')?.remove();
        if (n !== idx(c.code)) {
            g.title = 'Regular grade shown above; latest valid grade: ' + gradeText(n);
            let e = document.createElement('small');
            e.className = 'latestGrade gradeTone';
            e.dataset.tone = gradeTone(gp(n));
            e.textContent = 'Now ' + gradeText(n);
            g.appendChild(e);
        }
        else
            g.removeAttribute('title');
    });
    for (const [id, v] of [['overall', m.terms.at(-1).cum.avg], ['raw', m.terms.at(-1).raw.avg], ['original', m.terms.at(-1).orig.avg], ['sgpa', m.terms[page].gpa.avg]]) {
        $(id).classList.add('gradeTone');
        $(id).dataset.tone = gradeTone(v);
    }
    ;
    labels.forEach((s, i) => {
        let e = $('tabg' + i);
        e.classList.add('gradeTone');
        e.dataset.tone = gradeTone(m.terms[i].gpa.avg);
    });
    if (detailCourse && $('courseDialog').open)
        renderCourseDetail(byCode[detailCourse], m);
}
function refresh() {
    let m = model(), last = m.terms.at(-1), t = m.terms[page];
    $('overall').textContent = fmt(last.cum.avg);
    $('overallSub').textContent = `${last.cum.credits} / ${total} passed credits`;
    $('raw').textContent = fmt(last.raw.avg);
    $('original').textContent = fmt(last.orig.avg);
    $('semLabel').textContent = `${labels[page]} IUMS GPA`;
    $('sgpa').textContent = fmt(t.gpa.avg);
    $('sgpaSub').textContent = `${t.gpa.credits} passed credits`;
    $('sgpaSub').title = `Including F: ${fmt(calc(t.term, false).avg)} · Original: ${fmt(calc(Object.fromEntries(data[page].map(c => [c[0], idx(c[0])])), false).avg)}`;
    $('subtitle').textContent = `${data[page].length} courses · ${num(data[page].reduce((s, c) => s + c[2], 0))} credits · CGPA ${fmt(t.cum.avg)}`;
    labels.forEach((s, i) => $('tabg' + i).textContent = fmt(m.terms[i].gpa.avg));
    let entered = all.filter(c => idx(c.code)).length;
    $('progressFill').style.width = (entered / all.length * 100) + '%';
    $('progressLabel').textContent = `${entered} / ${all.length} grades entered`;
    $('summary').innerHTML = m.terms.map((t, i) => `<tr><td>${labels[i]}</td><td>${t.gpa.credits} / ${data[i].reduce((a, c) => a + c[2], 0)}</td>${[t.gpa.avg, t.cum.avg, t.raw.avg, t.orig.avg].map(v => `<td class="gradeTone" data-tone="${gradeTone(v)}">${fmt(v)}</td>`).join('')}<td>${t.failed.length}</td></tr>`).join('');
    let warns = [];
    if (m.invalid.length)
        warns.push(`${m.invalid.length} repeat record(s) are invalid and excluded. Check their semester pages.`);
    for (let i = 0; i < labels.length; i++) {
        let t = m.terms[i], complete = data[i].every(c => idx(c[0]));
        if (!complete)
            continue;
        let newFailed = t.failed.filter(c => byCode[c].sem === i);
        if (newFailed.length > 2 || t.failed.length > 4 || newFailed.some(c => !byCode[c].theory) || i > 0 && t.cum.avg !== null && t.cum.avg < 2.2)
            warns.push(`${labels[i]}: promotion warning — review outstanding failures / minimum CGPA.`);
    }
    $('warnings').innerHTML = warns.map(x => `<div class="notice">${x}</div>`).join('');
    updateCourseVisuals(m);
    renderExams(m);
    if (view === 'stats')
        renderStats(m);
    if (view === 'target')
        renderPlan(m);
    save();
}
function show() {
    $('pageHeading').textContent = view === 'semester' ? 'Semester ' + labels[page] : ({ overview: 'Overview', stats: 'Statistics', target: 'Target CGPA', rules: 'Rules & sources', settings: 'Settings' })[view];
    $('semesterView').hidden = view !== 'semester';
    $('statsView').hidden = view !== 'stats';
    $('targetView').hidden = view !== 'target';
    $('overviewView').hidden = view !== 'overview';
    $('rulesView').hidden = view !== 'rules';
    $('settingsView').hidden = view !== 'settings';
    $('tabs').innerHTML = `<button class="navLink ${view === 'overview' ? 'active' : ''}" data-view="overview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Overview</button><button class="navLink ${view === 'stats' ? 'active' : ''}" data-view="stats"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 20h16M7 16V9m5 7V4m5 12v-5"/></svg> Statistics</button><button class="navLink ${view === 'target' ? 'active' : ''}" data-view="target"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg> Target CGPA</button><div class="navLabel">Semesters</div>` + labels.map((s, i) => `<button class="navLink semLink ${view === 'semester' && i === page ? 'active' : ''}" data-page="${i}"><span>Semester ${s}</span><span class="navGpa" id="tabg${i}">—</span></button>`).join('') + `<button class="navLink ${view === 'rules' ? 'active' : ''}" data-view="rules"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></svg> Rules & sources</button><button class="navLink ${view === 'settings' ? 'active' : ''}" data-view="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M19 5l-3 3m-8 8-3 3"/></svg> Settings</button>`;
    for (const b of $('tabs').querySelectorAll('button'))
        b.onclick = () => {
            if (b.dataset.page !== undefined) {
                page = +b.dataset.page;
                view = 'semester';
            }
            else
                view = b.dataset.view;
            if (window.matchMedia('(max-width: 1599px)').matches) {
                collapsed = true;
                syncUI();
                $('toggleSide').focus();
            }
            show();
            window.scrollTo({ top: 0, behavior: 'instant' });
        };
    $('title').textContent = `Semester ${labels[page]}`;
    let cm = model();
    $('courses').innerHTML = legend + ['Theory', 'Lab / Sessional', 'Thesis'].map(type => {
        let group = data[page].filter(c => byCode[c[0]].type === type);
        return group.length ? `<h3 class="courseGroup">${type} <span>${group.reduce((a, c) => a + c[2], 0)} credits</span></h3>` + group.map(([code, name, c]) => {
            let i = data[page].findIndex(x => x[0] === code);
            return `<div class="course"><div><div class="name">${courseLink(byCode[code], cm)}</div><div class="code">${code} · ${c} cr</div></div><div class="control"><input class="slider" type="range" min="0" max="10" value="${idx(code)}" data-code="${code}" aria-label="${esc(name)} regular grade" aria-valuetext="${gradeText(idx(code))}"></div><div class="grade gradeTone" id="g${i}">${idx(code) ? gradeText(idx(code)) : "—"}<small>${idx(code) ? gp(idx(code)).toFixed(2) : 'Unset'}</small></div></div>`;
        }).join('') : '';
    }).join('');
    $('courses').querySelectorAll('input').forEach(el => el.oninput = () => {
        el.setAttribute('aria-valuetext', gradeText(+el.value));
        let i = data[page].findIndex(c => c[0] === el.dataset.code), n = +el.value;
        values[el.dataset.code] = n;
        $('g' + i).innerHTML = `${n ? gradeText(n) : "—"}<small>${n ? gp(n).toFixed(2) : 'Unset'}</small>`;
        refresh();
    });
    $('bulk').selectedIndex = 0;
    $('examForm').hidden = true;
    refresh();
    if (view === 'settings')
        renderSettings();
}
function renderExams(m) {
    let rs = exams.map((r, i) => ({ ...r, i })).filter(r => r.sem === page), h = m.history.filter(r => r.sem === page);
    $('repeatSummary').textContent = `${h.filter(r => r.type !== 'improvement').length}/2 recovery · ${h.filter(r => r.type === 'improvement').length}/2 improvements · ${m.history.filter(r => r.type === 'improvement').length}/8 total`;
    $('exams').innerHTML = rs.length ? `<div class="tablewrap"><table><thead><tr><th>Course</th><th>Type</th><th>Result</th><th>Status</th><th></th></tr></thead><tbody>${rs.map(r => {
        let bad = m.invalid.find(x => x.i === r.i);
        return `<tr><td class="wrap"><small>${r.code}</small><br>${courseLink(byCode[r.code], m)} (${labels[byCode[r.code].sem]})</td><td>${nameType(r.type)}</td><td><select data-edit="${r.i}">${grades.slice(1, (r.type === 'improvement' ? 8 : 6) + 1).map((g, i) => `<option value="${i + 1}" ${r.grade === i + 1 ? 'selected' : ''}>${g[0]}</option>`).join('')}</select></td><td class="wrap ${bad ? 'bad' : 'good'}">${bad ? bad.why : 'Included'}</td><td><button data-remove="${r.i}">Remove</button></td></tr>`;
    }).join('')}</tbody></table></div>` : '';
    $('exams').querySelectorAll('[data-remove]').forEach(b => b.onclick = () => {
        exams.splice(+b.dataset.remove, 1);
        refresh();
    });
    $('exams').querySelectorAll('[data-edit]').forEach(b => b.onchange = () => {
        exams[+b.dataset.edit].grade = +b.value;
        refresh();
    });
    if (!$('examForm').hidden)
        populateExam(m);
}
function populateExam(m = model()) {
    let type = $('examType').value, t = m.terms[page], selected = $('examCourse').value, old = $('examGrade').value;
    let eligible = all.filter(c => !eligibility(c, type, page, t.state, t.history) && !(type === 'improvement' && m.history.filter(r => r.type === 'improvement').length >= 8) && !m.history.some(r => r.code === c.code && r.sem > page && r.type === 'improvement'));
    $('examCourse').innerHTML = eligible.length ? eligible.map(c => `<option value="${c.code}">${c.code} · ${esc(c.name)} (${labels[c.sem]})</option>`).join('') : '<option value="">No eligible courses</option>';
    if (eligible.some(c => c.code === selected))
        $('examCourse').value = selected;
    let cap = type === 'improvement' ? 8 : 6;
    $('examGrade').innerHTML = grades.slice(1, cap + 1).map((g, i) => `<option value="${i + 1}">${g[0]} (${g[1].toFixed(2)})</option>`).join('');
    $('examGrade').value = old && +old <= cap ? old : cap;
    $('commitExam').disabled = !eligible.length;
    $('examHelp').textContent = eligible.length ? `Maximum grade ${gradeText(cap)} (${gp(cap).toFixed(2)}). Result will replace the previous grade in CGPA.` : 'Enter the original eligible regular grade first, or check exam limits.';
}
$('addExam').onclick = () => {
    $('examForm').hidden = false;
    populateExam();
};
$('cancelExam').onclick = () => {
    $('examForm').hidden = true;
};
$('examType').onchange = () => populateExam();
$('commitExam').onclick = () => {
    let code = $('examCourse').value;
    if (!code)
        return;
    exams.push({ code, type: $('examType').value, sem: page, grade: +$('examGrade').value });
    $('examForm').hidden = true;
    refresh();
    if (view === 'settings')
        renderSettings();
};
let trendSeries = new Set(['gpa', 'cum', 'raw']), trendIndex = null;
const trendFields = [['gpa', 'Semester GPA', 'var(--accent)'], ['cum', 'CGPA', 'var(--chart2)'], ['raw', 'Including F', 'var(--orange)'], ['orig', 'Original', 'var(--status-carry)']];
function renderAnalytics(m) {
    const last = m.terms.at(-1), valid = m.terms.map((t, i) => ({ t, i })).filter(({ t }) => Object.keys(t.term).length > 0), best = valid.filter(({ t }) => t.gpa.avg !== null).sort((a, b) => b.t.gpa.avg - a.t.gpa.avg)[0];
    $('statHighlights').innerHTML = [['Highest semester GPA', best ? fmt(best.t.gpa.avg) : '—', best ? `${labels[best.i]}${all.some(c => c.sem === best.i && !idx(c.code)) ? ' · partial' : ''}` : 'No grades yet'], ['Credit completion', `${total ? Math.round(100 * last.cum.credits / total) : 0}%`, `${num(total - last.cum.credits)} credits remaining`], ['Improvements left', `${Math.max(0, 8 - m.history.filter(r => r.type === 'improvement').length)}`, 'Of 8 modeled attempts']].map(([l, v, d]) => `<div><small>${l}</small><strong>${v}</strong><span>${d}</span></div>`).join('');
    $('trendLegend').innerHTML = trendFields.map(([f, l, c]) => `<button class="seriesToggle" type="button" aria-pressed="${trendSeries.has(f)}" data-series="${f}"><span style="background:${c}"></span>${l}</button>`).join('');
    $('trendLegend').querySelectorAll('button').forEach(b => b.onclick = () => {
        const f = b.dataset.series;
        if (trendSeries.has(f)) {
            if (trendSeries.size === 1)
                return;
            trendSeries.delete(f);
        }
        else
            trendSeries.add(f);
        renderTrend(m);
    });
    renderTrend(m);
    const counts = grades.map((g, i) => all.filter(c => (m.state[c.code] || 0) === i).length), max = Math.max(1, ...counts);
    $('distribution').innerHTML = `<h3>Grade distribution</h3><p>Latest grade · number of courses</p><div class="distRows">${counts.map((n, i) => `<div class="distRow"><span>${i === 0 ? 'Unset' : grades[i][0]}</span><div class="distTrack"><div style="width:${n / max * 100}%;background:var(--${i === 1 ? 'bad' : i === 0 ? 'muted' : 'grade-' + gradeTone(gp(i))})"></div></div><b>${n}</b></div>`).join('')}</div>`;
    $('creditProgress').innerHTML = `<h3>Credit completion</h3><p>Latest passing grades by course type</p>${['Theory', 'Lab / Sessional', 'Thesis'].map(t => {
        let list = all.filter(c => c.type === t), den = list.reduce((n, c) => n + c.credit, 0), done = list.filter(c => (m.state[c.code] || 0) > 1).reduce((n, c) => n + c.credit, 0);
        return `<div class="creditRow"><div><span>${t}</span><b>${num(done)} / ${num(den)}</b></div><div class="distTrack"><div style="width:${den ? 100 * done / den : 0}%;background:var(--accent)"></div></div></div>`;
    }).join('')}<h3>Repeat examinations</h3><div class="repeatBreakdown">${['improvement', 'carry', 'clearance'].map(t => `<div><span>${nameType(t)}</span><b>${m.history.filter(r => r.type === t).length}${t === 'improvement' ? ' / 8' : ''}</b></div>`).join('')}</div>`;
}

// Statistics and interactive charts
function renderTrend(m) {
    const ts = m.terms, available = ts.map((t, i) => Object.keys(t.term).length ? i : -1).filter(i => i >= 0);
    if (trendIndex === null || !available.includes(trendIndex))
        trendIndex = available.at(-1) ?? null;
    $('trendLegend').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', trendSeries.has(b.dataset.series)));
    if (!available.length) {
        $('chart').innerHTML = '<div class="chartEmpty">Enter grades to see your performance trend.</div>';
        $('trendReadout').innerHTML = '';
        return;
    }
    const vals = available.flatMap(i => trendFields.filter(([f]) => trendSeries.has(f)).map(([f]) => ts[i][f].avg)).filter(v => v !== null), focus = $('trendScale').value === 'focus', lo = focus && vals.length ? Math.max(0, Math.min(3, Math.floor(Math.min(...vals) * 2) / 2 - .5)) : 0, step = focus ? .5 : 1, W = Math.max(280, $('chart').clientWidth || 280, labels.length * 33 + 48), H = 258, L = 37, R = 19, T = 18, B = 31, plotW = W - L - R, plotH = H - T - B, x = i => labels.length === 1 ? L + plotW / 2 : L + i * plotW / (labels.length - 1), y = v => T + (4 - v) / (4 - lo) * plotH;
    let svg = `<svg class="trendSvg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="Academic progression chart"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--chart2)" stop-opacity=".10"/><stop offset="100%" stop-color="var(--chart2)" stop-opacity=".01"/></linearGradient></defs>`;
    for (let g = lo; g <= 4.001; g += step) {
        svg += `<line x1="${L}" y1="${y(g)}" x2="${W - R}" y2="${y(g)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 9}" y="${y(g) + 4}" text-anchor="end" fill="var(--muted)" font-size="11">${g.toFixed(1)}</text>`;
    }
    labels.forEach((l, i) => svg += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" fill="var(--muted)" font-size="11">${esc(l.length > 9 ? l.slice(0, 8) + '…' : l)}</text>`);
    for (const [f, l, c] of trendFields) {
        if (!trendSeries.has(f))
            continue;
        let segments = [], seg = [];
        ts.forEach((t, i) => {
            const v = t[f].avg;
            if (!available.includes(i) || v === null) {
                if (seg.length)
                    segments.push(seg);
                seg = [];
            }
            else
                seg.push([x(i), y(v), i, v]);
        });
        if (seg.length)
            segments.push(seg);
        for (const pts of segments) {
            let path = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
            if (f === 'cum' && pts.length > 1)
                svg += `<path d="${path} L${pts.at(-1)[0]} ${H - B} L${pts[0][0]} ${H - B} Z" fill="url(#trendFill)"/>`;
            svg += `<path d="${path}" stroke="${c}" stroke-width="${f === 'cum' ? 2.8 : 2.1}" stroke-linejoin="round" stroke-linecap="round" fill="none" ${f === 'raw' || f === 'orig' ? 'stroke-dasharray="5 4"' : ''}/>`;
            for (const [cx, cy, i, v] of pts)
                svg += `<circle cx="${cx}" cy="${cy}" r="${i === trendIndex ? 5 : 3.4}" fill="var(--surface)" stroke="${c}" stroke-width="2"><title>${esc(labels[i])} · ${l}: ${fmt(v)}</title></circle>`;
        }
    }
    if (trendIndex !== null)
        svg += `<line x1="${x(trendIndex)}" y1="${T}" x2="${x(trendIndex)}" y2="${H - B}" stroke="var(--muted)" stroke-opacity=".5" stroke-dasharray="3 5" pointer-events="none"/>`;
    for (const i of available) {
        let w = Math.min(42, plotW / Math.max(1, labels.length - 1));
        svg += `<rect class="trendHit" data-term="${i}" tabindex="0" role="button" aria-label="Show semester ${esc(labels[i])}" x="${Math.max(0, x(i) - w / 2)}" y="${T}" width="${w}" height="${plotH + 12}" fill="transparent"/>`;
    }
    $('chart').innerHTML = svg + '</svg>';
    const scroll = $('chart').scrollLeft;
    const choose = i => {
        trendIndex = i;
        renderTrend(m);
        $('chart').scrollLeft = scroll;
    };
    $('chart').querySelectorAll('.trendHit').forEach(el => {
        el.onclick = () => choose(+el.dataset.term);
        el.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const i = +el.dataset.term;
                choose(i);
                $('chart').querySelector(`[data-term="${i}"]`)?.focus();
            }
        };
    });
    const t = ts[trendIndex];
    $('trendReadout').innerHTML = `<label>Semester <select id="trendTerm" aria-label="Inspect semester">${available.map(i => `<option value="${i}" ${i === trendIndex ? 'selected' : ''}>${esc(labels[i])}${all.some(c => c.sem === i && !idx(c.code)) ? ' · partial' : ''}</option>`).join('')}</select></label><div class="readoutValues">${trendFields.map(([f, l, c]) => `<div><small>${l}</small><b style="color:${c}">${fmt(t[f].avg)}</b></div>`).join('')}</div>`;
    $('trendTerm').onchange = e => {
        trendIndex = +e.target.value;
        renderTrend(m);
        $('trendTerm').focus();
    };
}
function renderStats(m) {
    let types = ['Theory', 'Lab / Sessional', 'Thesis'], credit = (i, t) => all.filter(c => (i === null || c.sem === i) && c.type === t).reduce((a, c) => a + c.credit, 0);
    $('creditAudit').innerHTML = `<details><summary>Curriculum credit audit · ${total} credits</summary><div class="tablewrap"><table><thead><tr><th>Semester</th>${types.map(t => `<th>${t}</th>`).join('')}<th>Total</th></tr></thead><tbody>${[...labels, null].map((l, i) => {
        let j = l === null ? null : i;
        return `<tr><td>${l ?? 'Total'}</td>${types.map(t => `<td>${credit(j, t)}</td>`).join('')}<td>${types.reduce((a, t) => a + credit(j, t), 0)}</td></tr>`;
    }).join('')}</tbody></table></div><p>Credits are calculated from the current curriculum.</p></details>`;
    renderAnalytics(m);
    let q = $('search').value.toLowerCase().trim(), s = selectedFilters('filterSem'), g = selectedFilters('filterGrade'), sort = $('sort').value, st = selectedFilters('filterStatus');
    let rows = all.filter(c => (!q || (c.code + ' ' + c.name).toLowerCase().includes(q)) && (!s.length || s.includes(c.sem)) && (!g.length || g.includes(m.state[c.code] || 0)) && (!$('filterType').value || c.type === $('filterType').value) && (!st.length || st.some(i => matchesStatus(c, m, i))));
    const latest = c => m.state[c.code] || 0;
    const sorters = { asc: (a, b) => (latest(a) || 99) - (latest(b) || 99), desc: (a, b) => latest(b) - latest(a), nameAsc: (a, b) => a.name.localeCompare(b.name), nameDesc: (a, b) => b.name.localeCompare(a.name), credit: (a, b) => b.credit - a.credit };
    if (sorters[sort])
        rows.sort(sorters[sort]);
    $('courseTable').innerHTML = `<p>${rows.length} of ${all.length} courses</p>${legend}<table><thead><tr><th>Course</th><th>Semester</th><th>Type</th><th>Credits</th><th>Original</th><th>Latest</th><th>GP</th><th>Repeats</th></tr></thead><tbody>${rows.map(c => `<tr><td class="wrap"><small>${c.code}</small><br>${courseLink(c, m)}</td><td>${labels[c.sem]}</td><td>${c.type}</td><td>${c.credit}</td><td>${gradeMarkup(idx(c.code))}</td><td>${gradeMarkup(latest(c))}</td><td>${gradeMarkup(latest(c), true)}</td><td>${m.history.filter(r => r.code === c.code).map(r => nameType(r.type) + ' ' + labels[r.sem]).join(', ') || '—'}</td></tr>`).join('')}</tbody></table>`;
}
function planModel(m, goal, from, improve, caps = { Theory: 10, "Lab / Sessional": 10, Thesis: 10 }, maxNew = 8) {
    let slots = labels.map((_, i) => 2 - m.history.filter(r => r.sem === i && r.type !== 'improvement').length), is = labels.map((_, i) => 2 - m.history.filter(r => r.sem === i && r.type === 'improvement').length), remain = Math.min(maxNew, 8 - m.history.filter(r => r.type === 'improvement').length), base = calc(m.state, false).points, empty = all.filter(c => !m.state[c.code]), failed = all.filter(c => m.state[c.code] === 1), repeat = [], blocked = [];
    for (const c of failed.sort((a, b) => b.sem - a.sem)) {
        let h = m.history.filter(r => r.code === c.code), last = h.at(-1), earliest = Math.max(from, c.sem, last ? last.sem + 1 : 0), sem = -1;
        for (let j = earliest; j < labels.length; j++)
            if (slots[j] > 0 && c.theory) {
                sem = j;
                break;
            }
        if (sem < 0) {
            blocked.push(c);
            continue;
        }
        slots[sem]--;
        repeat.push({ c, sem, type: sem === c.sem ? 'Clearance' : 'Carry', n: 6 });
        base += 3 * c.credit;
    }
    let cand = all.filter(c => c.theory && c.credit === 3 && idx(c.code) >= 2 && idx(c.code) < 8 && !m.history.some(r => r.code === c.code)).map(c => ({ c, gain: (3.5 - gp(idx(c.code))) * c.credit })).sort((a, b) => b.gain - a.gain), options = [];
    if (improve)
        for (let a of cand) {
            if (remain <= 0)
                break;
            let sem = -1;
            for (let j = labels.length - 1; j >= Math.max(from, a.c.sem + 1); j--)
                if (is[j] > 0) {
                    sem = j;
                    break;
                }
            if (sem < 0)
                continue;
            is[sem]--;
            remain--;
            options.push({ ...a, sem, type: 'Improvement', n: 8 });
        }
    let maxNo = base + empty.reduce((a, c) => a + gp(caps[c.type]) * c.credit, 0), max = maxNo + options.reduce((a, r) => a + r.gain, 0), need = goal * total, chosen = [], sum = maxNo;
    for (const r of options) {
        if (sum + 1e-8 >= need)
            break;
        sum += r.gain;
        chosen.push(r);
    }
    if (blocked.length) {
        chosen = [...options];
        sum = max;
    }
    let targets = empty.map(c => ({ c, sem: c.sem, type: 'Regular', n: caps[c.type] }));
    if (sum >= need - 1e-8 && !blocked.length) {
        let changed = true;
        while (changed) {
            changed = false;
            for (let r of [...targets].sort((a, b) => b.n - a.n || a.c.credit - b.c.credit)) {
                if (r.n <= 2)
                    continue;
                let diff = (gp(r.n) - gp(r.n - 1)) * r.c.credit;
                if (sum - diff + 1e-8 >= need) {
                    r.n--;
                    sum -= diff;
                    changed = true;
                }
            }
        }
    }
    return { max, maxNo, base, targets, repeat, chosen, sum, blocked, need, empty, options };
}
function renderPlan(m) {
    let goal = Number($('target').value), from = +$('start').value;
    if (!Number.isFinite(goal) || goal < 2.2 || goal > 4) {
        $('plan').innerHTML = '<p class="bad">Enter a target between 2.200 and 4.000.</p>';
        return;
    }
    if (m.invalid.length) {
        $('plan').innerHTML = '<div class="notice">Resolve invalid exam records before calculating a target.</div>';
        return;
    }
    let p = planModel(m, goal, from, $('allowImprove').value === 'yes', { Theory: +$('capTheory').value, 'Lab / Sessional': +$('capLab').value, Thesis: +$('capThesis').value }, +$('maxNew').value), possible = !p.blocked.length && p.max + 1e-8 >= p.need, rows = [...p.targets, ...p.repeat, ...p.chosen].sort((a, b) => a.sem - b.sem || ['Theory', 'Lab / Sessional', 'Thesis'].indexOf(a.c.type) - ['Theory', 'Lab / Sessional', 'Thesis'].indexOf(b.c.type) || a.type.localeCompare(b.type)), late = p.empty.filter(c => c.sem < from), fixed = all.filter(c => idx(c.code)).length;
    $('plan').innerHTML = `<div class="metrics"><div class="metric"><small>Target</small><strong>${fmt(goal)}</strong></div><div class="metric"><small>Max without new improvement</small><strong>${fmt(p.maxNo / total)}</strong></div><div class="metric"><small>Max with selected rules</small><strong>${fmt(p.max / total)}</strong></div><div class="metric"><small>${possible ? 'Suggested plan' : 'Best-case scenario'}</small><strong>${fmt((possible ? p.sum : p.max) / total)}</strong></div></div><h3 class="${possible ? 'good' : 'bad'}">${possible ? 'Achievable under modeled limits' : p.blocked.length ? 'Cannot complete all required courses by the final semester under these limits' : 'Target exceeds modeled maximum'}</h3><p>${fixed} fixed grades · ${p.empty.length} unentered · ${p.repeat.length} recovery exams · ${p.chosen.length} new improvements.</p>${late.length ? `<div class="notice">${late.length} unentered course(s) are from semesters before your selected start. Enter their actual grades for a realistic graduation plan.</div>` : ''}${p.blocked.length ? `<div class="notice">Unresolved courses with no available recovery slot: ${p.blocked.map(c => c.code).join(', ')}. Graduation requires resolving all of them; failed sessionals require separate arrangements.</div>` : ''}<p>Repeat ceilings: B / A−.</p><div class="tablewrap"><table><thead><tr><th>Exam semester</th><th>Course (original semester)</th><th>Type</th><th>Exam</th><th>Target</th><th>Credits</th><th>CGPA gain¹</th></tr></thead><tbody>${labels.map((sem, i) => {
        let term = rows.filter(r => r.sem === i);
        if (!term.length)
            return '';
        let groups = [['Theory', term.filter(r => r.type === 'Regular' && r.c.type === 'Theory')], ['Lab / Sessional', term.filter(r => r.type === 'Regular' && r.c.type === 'Lab / Sessional')], ['Thesis', term.filter(r => r.type === 'Regular' && r.c.type === 'Thesis')], ['Repeat examinations', term.filter(r => r.type !== 'Regular')]];
        return `<tr class="planTerm"><td colspan="7">Semester ${sem}</td></tr>` + groups.map(([title, rs]) => rs.length ? `<tr class="planGroup"><td colspan="7">${title} · ${num(rs.reduce((a, r) => a + r.c.credit, 0))} credits</td></tr>` + rs.map(r => `<tr><td>${sem}</td><td class="wrap"><small>${r.c.code}</small><br>${courseLink(r.c, m)} <small>(${labels[r.c.sem]})</small></td><td>${r.c.type}</td><td>${r.type}</td><td><b>${gradeMarkup(r.n)}</b> (${gradeMarkup(r.n, true)})</td><td>${r.c.credit}</td><td>${r.type === 'Improvement' ? '+' + fmt((gp(r.n) - gp(idx(r.c.code))) * r.c.credit / total) : '—'}</td></tr>`).join('') : '').join('');
    }).join('') || '<tr><td colspan="7">No additional grades or exams required.</td></tr>'}</tbody></table></div><p class="foot">¹ Gain assumes all ${total} graduation credits are completed.</p>`;
}
$('bulk').innerHTML = '<option value="">Set all grades</option>' + grades.slice(1).map((g, i) => `<option value="${i + 1}">${g[0]}</option>`).join('');
$('bulk').onchange = () => {
    if ($('bulk').value !== '' && confirm('Set every regular grade in this semester? Repeat records will be retained and revalidated.')) {
        data[page].forEach(c => values[c[0]] = +$('bulk').value);
        show();
    }
    else
        $('bulk').selectedIndex = 0;
};

// Theme and navigation preferences
const uiKey = 'aust-cgpa-ui-v1';
let prefs = {};
try {
    prefs = JSON.parse(localStorage.getItem(uiKey) || '{}') || {};
}
catch (e) {
}
;
let dark = prefs.dark ?? (window.matchMedia('(prefers-color-scheme: dark)').matches), collapsed = window.matchMedia('(max-width: 1599px)').matches ? true : (prefs.collapsed ?? false);
function syncUI() {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.body.classList.toggle('sidebarHidden', collapsed);
    $('sidebar').inert = collapsed;
    $('sidebar').setAttribute('aria-hidden', String(collapsed));
    $('toggleSide').setAttribute('aria-expanded', String(!collapsed));
    $('themeToggle').setAttribute('aria-pressed', String(dark));
    $('themeToggle').title = dark ? 'Light mode' : 'Dark mode';
    $('themeToggle').innerHTML = dark ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.7"><path d="M20.7 15.3A9 9 0 0 1 8.7 3.3 9 9 0 1 0 20.7 15.3Z"/></svg>';
    try {
        localStorage.setItem(uiKey, JSON.stringify({ dark, collapsed }));
    }
    catch (e) {
    }
}
$('toggleSide').onclick = () => {
    collapsed = !collapsed;
    syncUI();
};
$('themeToggle').onclick = () => {
    dark = !dark;
    syncUI();
};
$('sidebarScrim').onclick = () => {
    collapsed = true;
    syncUI();
    $('toggleSide').focus();
};
document.addEventListener('click', e => {
    document.querySelectorAll('.filterMenu[open],.menu[open]').forEach(d => {
        if (!d.contains(e.target))
            d.open = false;
    });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.filterMenu[open],.menu[open]').forEach(d => d.open = false);
        if (!collapsed && !$('courseDialog').open) {
            collapsed = true;
            syncUI();
            $('toggleSide').focus();
        }
    }
});
syncUI();
function selectedFilters(id) {
    return Array.from($(id).querySelectorAll('input:checked'), el => +el.value);
}
function initFilter(id, items, word) {
    let root = $(id), body = root.querySelector('.filterBody');
    body.innerHTML = '<div class="filterActions"><button type="button" data-all>All</button><button type="button" data-none>Clear</button></div>' + items.map((x, i) => `<label><input type="checkbox" value="${i}"><span>${x}</span></label>`).join('');
    let update = () => {
        let n = selectedFilters(id).length;
        root.querySelector('summary').textContent = n && n < items.length ? `${n} ${word} selected` : `All ${word}`;
        renderStats(model());
    };
    body.onchange = update;
    body.querySelector('[data-all]').onclick = () => {
        body.querySelectorAll('input').forEach(x => x.checked = true);
        update();
    };
    body.querySelector('[data-none]').onclick = () => {
        body.querySelectorAll('input').forEach(x => x.checked = false);
        update();
    };
}
initFilter('filterSem', labels, 'semesters');
initFilter('filterGrade', grades.map(g => g[0]), 'grades');
initFilter('filterStatus', ['Improvement eligible', 'Already improved / attempted', 'Carried / attempted', 'Cleared / attempted', 'Unresolved F', 'No repeat history'], 'statuses');
for (const id of ['search', 'filterType', 'sort'])
    $(id).oninput = () => renderStats(model());
$('clearFilters').onclick = () => {
    for (const [id, word] of [['filterSem', 'semesters'], ['filterGrade', 'grades'], ['filterStatus', 'statuses']]) {
        $(id).querySelectorAll('input').forEach(x => x.checked = false);
        $(id).querySelector('summary').textContent = 'All ' + word;
    }
    $('search').value = '';
    $('filterType').value = '';
    $('sort').value = 'sem';
    renderStats(model());
};
$('start').innerHTML = labels.map((s, i) => `<option value="${i}">${s}</option>`).join('');
$('start').value = start;
$('target').value = target;
$('allowImprove').value = allowImprove;
for (const id of ['target', 'start', 'allowImprove'])
    $(id).oninput = () => {
        target = +$('target').value;
        start = +$('start').value;
        allowImprove = $('allowImprove').value;
        renderPlan(model());
        save();
    };
for (const id of ['capTheory', 'capLab', 'capThesis']) {
    $(id).innerHTML = grades.slice(2).map((g, i) => `<option value="${i + 2}">${g[0]} (${g[1].toFixed(2)})</option>`).join('');
    $(id).value = '10';
    $(id).onchange = () => renderPlan(model());
}
$('maxNew').onchange = () => renderPlan(model());
$('calculate').onclick = () => renderPlan(model());
const sample = { schemaVersion: 2, curriculum: { semesters: ['1-1', '1-2'], courses: [{ code: 'MAT 101', name: 'Mathematics', credits: 3, type: 'Theory', semester: 1 }, { code: 'PHY 102', name: 'Physics Lab', credits: 1.5, type: 'Lab / Sessional', semester: 1 }, { code: 'ENG 201', name: 'English', credits: 3, type: 'Theory', semester: 2 }] }, values: { 'MAT 101': 4, 'PHY 102': 9 }, exams: [{ code: 'MAT 101', type: 'improvement', sem: 1, grade: 8 }] };
function backup() {
    return { schemaVersion: 2, curriculum: curriculum(), values, exams, page, target, start, allowImprove };
}
function downloadJSON(obj, filename) {
    let a = document.createElement('a'), u = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    a.href = u;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function readJSON(fn) {
    let f = document.createElement('input');
    f.type = 'file';
    f.accept = '.json,application/json';
    f.onchange = async () => {
        try {
            if (f.files.length)
                fn(JSON.parse(await f.files[0].text()));
        }
        catch (e) {
            alert('Import failed: ' + e.message);
        }
    };
    f.click();
}
function syncCurriculumControls() {
    page = Math.min(page, labels.length - 1);
    start = Math.min(start, labels.length - 1);
    let opts = labels.map((l, i) => `<option value="${i}">${l}</option>`).join('');
    for (const id of ['start', 'manageSem', 'clearSem', 'editSem']) {
        $(id).innerHTML = opts;
    }
    $('start').value = start;
    $('manageSem').value = page;
    $('clearSem').value = page;
    $('semName').value = labels[page];
    $('editFilter').innerHTML = '<option value="">All semesters</option>' + opts;
    initFilter('filterSem', labels, 'semesters');
}
function updateCurriculum(c) {
    applyCurriculum(c);
    syncCurriculumControls();
    show();
}
function renderEditTable() {
    let q = $('editSearch').value.trim().toLowerCase(), f = $('editFilter').value;
    let list = all.filter(c => (f === '' || c.sem === +f) && `${c.code} ${c.name}`.toLowerCase().includes(q)).sort((a, b) => a.sem - b.sem);
    $('editTable').innerHTML = `<table><thead><tr><th>Code</th><th>Course</th><th>Semester</th><th>Type</th><th>Credits</th></tr></thead><tbody>${list.map(c => `<tr><td>${esc(c.code)}</td><td><button class="editLink" data-edit-course="${esc(c.code)}">${esc(c.name)}</button></td><td>${labels[c.sem]}</td><td>${c.type}</td><td>${c.credit}</td></tr>`).join('') || '<tr><td colspan="5">No matching courses</td></tr>'}</tbody></table>`;
}
function renderSettings() {
    $('curriculumSummary').textContent = `${labels.length} semesters · ${all.length} courses · ${num(total)} credits`;
    $('storageInfo').textContent = $('saveStatus').textContent;
    renderEditTable();
}

// Curriculum editor and data management
let editing = null;
function openEditor(code = null) {
    editing = code;
    let c = code ? byCode[code] : null;
    $('editTitle').textContent = c ? 'Edit course' : 'Add course';
    $('editCode').value = c?.code || '';
    $('editName').value = c?.name || '';
    $('editCredit').value = c?.credit || 3;
    $('editType').value = c?.type || 'Theory';
    $('editSem').value = c?.sem ?? page;
    $('deleteCourse').hidden = !c;
    $('editError').textContent = '';
    $('editDialog').showModal();
}
$('addCourse').onclick = () => openEditor();
$('closeEdit').onclick = () => $('editDialog').close();
$('editTable').onclick = e => {
    let b = e.target.closest('[data-edit-course]');
    if (b)
        openEditor(b.dataset.editCourse);
};
$('editSearch').oninput = renderEditTable;
$('editFilter').onchange = renderEditTable;
$('editForm').onsubmit = e => {
    e.preventDefault();
    try {
        let c = curriculum(), row = { code: $('editCode').value.trim(), name: $('editName').value.trim(), credits: Number($('editCredit').value), type: $('editType').value, semester: +$('editSem').value + 1 };
        if (editing)
            c.courses[c.courses.findIndex(r => r.code === editing)] = row;
        else
            c.courses.push(row);
        validateCurriculum(c);
        if (editing && row.code !== editing) {
            if (Object.hasOwn(values, editing)) {
                values[row.code] = values[editing];
                delete values[editing];
            }
            exams = exams.map(r => r.code === editing ? { ...r, code: row.code } : r);
        }
        $('editDialog').close();
        updateCurriculum(c);
    }
    catch (e) {
        $('editError').textContent = e.message;
    }
};
$('deleteCourse').onclick = () => {
    if (!editing)
        return;
    try {
        let c = curriculum();
        c.courses = c.courses.filter(r => r.code !== editing);
        validateCurriculum(c);
        if (!confirm('Delete this course and its grades and repeat records?'))
            return;
        delete values[editing];
        exams = exams.filter(r => r.code !== editing);
        $('editDialog').close();
        updateCurriculum(c);
    }
    catch (e) {
        $('editError').textContent = e.message;
    }
};
$('manageSem').onchange = () => {
    $('semName').value = labels[+$('manageSem').value];
};
$('renameSem').onclick = () => {
    try {
        let c = curriculum();
        c.semesters[+$('manageSem').value] = $('semName').value;
        updateCurriculum(c);
    }
    catch (e) {
        alert(e.message);
    }
};
$('appendSem').onclick = () => {
    try {
        let c = curriculum(), i = labels.length + 1, l = `${Math.ceil(i / 2)}-${i % 2 ? 1 : 2}`;
        while (c.semesters.includes(l))
            l += '+';
        if (l.includes('+'))
            l = 'Semester ' + i;
        while (c.semesters.includes(l))
            l += ' new';
        c.semesters.push(l);
        updateCurriculum(c);
    }
    catch (e) {
        alert(e.message);
    }
};
$('removeSem').onclick = () => {
    try {
        let c = curriculum();
        if (c.semesters.length === 1 || c.courses.some(r => r.semester === labels.length) || exams.some(r => r.sem === labels.length - 1))
            throw Error('The final semester must be empty of courses and repeat exams.');
        c.semesters.pop();
        updateCurriculum(c);
    }
    catch (e) {
        alert(e.message);
    }
};
$('clearTerm').onclick = () => {
    let i = +$('clearSem').value;
    if (confirm('Clear all regular grades in ' + labels[i] + '? Repeat exam records will remain and may need review.')) {
        data[i].forEach(c => delete values[c[0]]);
        show();
    }
};
$('resetAll').onclick = () => {
    if (confirm('Clear every grade and repeat exam record? Your curriculum will be kept.')) {
        values = {};
        exams = [];
        show();
    }
};
$('exportCurriculum').onclick = () => downloadJSON({ schemaVersion: 2, curriculum: curriculum() }, 'cgpa-curriculum.json');
$('sampleJSON').onclick = () => downloadJSON(sample, 'cgpa-sample.json');
$('backupOut').onclick = () => downloadJSON(backup(), 'cgpa-studio-backup.json');
$('jsonExample').textContent = JSON.stringify(sample, null, 2);
$('importCurriculum').onclick = () => readJSON(x => {
    let c = validateCurriculum(x.curriculum || x);
    if (!confirm('Replace the current curriculum? Export a backup first.'))
        return;
    let keep = confirm('Keep grades and repeat records for matching course codes? Cancel clears all results.');
    let oldLabels = [...labels];
    applyCurriculum(c);
    if (keep) {
        let kept = clean({ values, exams: exams.map(r => ({ ...r, sem: labels.indexOf(oldLabels[r.sem]) })) });
        values = kept.values;
        exams = kept.exams;
    }
    else {
        values = {};
        exams = [];
    }
    syncCurriculumControls();
    show();
});
$('backupIn').onclick = () => readJSON(x => {
    if (!x || !x.values || typeof x.values !== 'object' || Array.isArray(x.values))
        throw Error('Missing values object. Use Import curriculum for curriculum-only files.');
    if (x.exams !== undefined && !Array.isArray(x.exams))
        throw Error('exams must be an array.');
    if (x.curriculum) {
        let c = validateCurriculum(x.curriculum);
        if (!confirm('Restore this backup? This replaces the current curriculum and all results.'))
            return;
        applyCurriculum(c);
        let b = clean(x);
        ({ values, exams, page, target, start, allowImprove } = b);
        syncCurriculumControls();
        $('target').value = target;
        $('allowImprove').value = allowImprove;
        show();
    }
    else {
        let b = clean(x);
        if (!confirm('Merge matching regular grades? Repeat records will be replaced if included.'))
            return;
        values = { ...values, ...b.values };
        if (Array.isArray(x.exams))
            exams = b.exams;
        show();
    }
});
$('guideSample').onclick = () => downloadJSON(sample, 'cgpa-sample.json');
$('trendScale').onchange = () => renderTrend(model());
let trendResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(trendResizeTimer);
    trendResizeTimer = setTimeout(() => {
        if (view === 'stats')
            renderTrend(model());
    }, 120);
});
syncCurriculumControls();
show();
