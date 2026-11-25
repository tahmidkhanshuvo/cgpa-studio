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
