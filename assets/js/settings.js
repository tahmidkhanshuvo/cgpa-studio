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
