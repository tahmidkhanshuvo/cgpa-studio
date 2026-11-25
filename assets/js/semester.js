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
    $('summary').innerHTML = m.terms.map((t, i) => `<tr><td>${labels[i]}</td><td>${t.gpa.credits} / ${data[i].reduce((a, c) => a + c[2], 0)}</td>${[t.gpa.avg, t.cum.avg, t.raw.avg, t.orig.avg].map(v => Object.keys(t.term).length ? v : null).map(v => `<td class="gradeTone" data-tone="${gradeTone(v)}">${fmt(v)}</td>`).join('')}<td>${t.failed.length}</td></tr>`).join('');
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
    if (view === 'overview')
        renderOverview(m);
    if (view === 'stats')
        renderStats(m);
    if (view === 'target')
        renderPlan(m);
    save();
}
function show() {
    $('pageHeading').textContent = view === 'semester' ? 'Semester ' + labels[page] : ({ overview: 'Overview', stats: 'Statistics', target: 'Target CGPA', rules: 'Rules & sources', settings: 'Settings' })[view];
    document.body.dataset.view = view;
    $('globalMetrics').hidden = !['overview', 'semester', 'stats'].includes(view);
    $('semesterMetric').hidden = view !== 'semester';
    $('globalMetrics').classList.toggle('threeMetrics', view !== 'semester');
    $('headerProgress').hidden = view !== 'semester';
    $('semesterView').hidden = view !== 'semester';
    $('statsView').hidden = view !== 'stats';
    $('targetView').hidden = view !== 'target';
    $('overviewView').hidden = view !== 'overview';
    $('rulesView').hidden = view !== 'rules';
    $('settingsView').hidden = view !== 'settings';
    $('tabs').innerHTML = `<button class="navLink ${view === 'overview' ? 'active' : ''}" data-view="overview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Overview</button><button class="navLink ${view === 'stats' ? 'active' : ''}" data-view="stats"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 20h16M7 16V9m5 7V4m5 12v-5"/></svg> Statistics</button><button class="navLink ${view === 'target' ? 'active' : ''}" data-view="target"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg> Target CGPA</button><div class="navLabel">Semesters</div>` + labels.map((s, i) => `<button class="navLink semLink ${view === 'semester' && i === page ? 'active' : ''}" data-page="${i}"><span>Semester ${s}</span><span class="navGpa" id="tabg${i}">—</span></button>`).join('') + `<button class="navLink ${view === 'rules' ? 'active' : ''}" data-view="rules"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></svg> Rules & sources</button><button class="navLink ${view === 'settings' ? 'active' : ''}" data-view="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M19 5l-3 3m-8 8-3 3"/></svg> Settings</button>`;
    for (const b of $('tabs').querySelectorAll('button')) {
        if (b.classList.contains('active')) b.setAttribute('aria-current', 'page');
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
    }
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

$('bulk').innerHTML = '<option value="">Set all grades</option>' + grades.slice(1).map((g, i) => `<option value="${i + 1}">${g[0]}</option>`).join('');
$('bulk').onchange = () => {
    if ($('bulk').value !== '' && confirm('Set every regular grade in this semester? Repeat records will be retained and revalidated.')) {
        data[page].forEach(c => values[c[0]] = +$('bulk').value);
        show();
    }
    else
        $('bulk').selectedIndex = 0;
};
