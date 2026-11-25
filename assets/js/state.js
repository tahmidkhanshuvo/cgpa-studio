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
let values = {}, exams = [], page = 0, view = 'overview', target = 3.5, start = 6, allowImprove = 'yes';

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
