/* Landing dashboard. Derived from the same model as semester pages and statistics. */
function renderOverview(m) {
    const last = m.terms.at(-1);
    const entered = all.filter(c => idx(c.code)).length;
    const passed = all.filter(c => (m.state[c.code] || 0) > 1).length;
    const pending = all.length - entered;
    const failed = last.failed.length;
    const used = m.history.filter(r => r.type === 'improvement').length;
    const eligible = all.filter(c => statusFor(c, m).kind === 'eligible').length;
    const creditPct = total ? 100 * last.cum.credits / total : 0;
    const next = labels.findIndex((_, i) => all.some(c => c.sem === i && !idx(c.code)));
    const active = m.terms.map((t, i) => Object.keys(t.term).length ? i : -1).filter(i => i >= 0).at(-1);
    $('overviewProgress').innerHTML = `<div class="overviewHero"><div class="overviewHeroMain"><div class="overviewHeading"><h2>Degree progress</h2><strong class="completionPercent">${Math.round(creditPct)}%</strong></div><div class="degreeTrack" role="progressbar" aria-label="Passed degree credits" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(creditPct)}"><div style="width:${creditPct}%"></div></div><div class="overviewMeta"><span>${num(last.cum.credits)} of ${num(total)} credits passed</span><span>${num(total - last.cum.credits)} remaining</span></div></div><div class="overviewMini"><div><small>Grades entered</small><strong>${entered}<span> / ${all.length}</span></strong></div><div><small>Courses passed</small><strong>${passed}<span> / ${all.length}</span></strong></div></div></div>`;
    $('overviewTerms').innerHTML = labels.map((label, i) => {
        const courses = all.filter(c => c.sem === i), n = courses.filter(c => idx(c.code)).length;
        const count = courses.length, t = m.terms[i], partial = n > 0 && n < count;
        const state = !count ? 'Empty semester' : n === count ? 'Grades complete' : partial ? `${n} / ${count} entered` : 'Not started';
        return `<button type="button" class="overviewTerm" data-overview-sem="${i}" aria-label="Open semester ${esc(label)}, ${state}"><span class="termLabel"><b>${esc(label)}</b><small>${state}</small></span><span class="termTrack" aria-hidden="true"><span style="width:${count ? 100*n/count : 0}%"></span></span><span class="termGpa"><small>GPA${partial ? '*' : ''}</small><b class="gradeTone" data-tone="${gradeTone(t.gpa.avg)}">${fmt(t.gpa.avg)}</b></span></button>`;
    }).join('');
    const row = (title, desc, attrs, tone = '') => `<button type="button" class="overviewAction" ${attrs}><span><b ${tone ? `class="${tone}"` : ''}>${title}</b><small>${desc}</small></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>`;
    $('overviewActions').innerHTML = [
        next >= 0 ? row(entered ? 'Continue entering grades' : 'Enter your first grades', `Semester ${esc(labels[next])} · ${pending} unset overall`, `data-overview-sem="${next}"`) : row('Review your results', 'All regular grades entered', 'data-overview-view="stats"'),
        row(`${failed} unresolved failed ${failed === 1 ? 'course' : 'courses'}`, failed ? 'Review recovery options' : 'No unresolved failures', 'data-overview-filter="4"', failed ? 'bad' : ''),
        row(`${eligible} improvement-eligible ${eligible === 1 ? 'course' : 'courses'}`, `${Math.max(0, 8-used)} of 8 modeled attempts remaining`, 'data-overview-filter="0"'),
        row('Plan graduation CGPA', `Target ${fmt(target)} · explore possible grades`, 'data-overview-view="target"'),
        row('Manage data', 'Curriculum, import and backups', 'data-overview-view="settings"')
    ].join('') + (active !== undefined && pending ? '<p class="overviewHint">* Partial GPA is based on entered grades only.</p>' : '');
}
$('overviewView').addEventListener('click', e => {
    const button = e.target.closest('button[data-overview-sem], button[data-overview-view], button[data-overview-filter]');
    if (!button) return;
    if (button.hasAttribute('data-overview-sem')) {
        page = Number(button.dataset.overviewSem);
        view = 'semester';
    } else if (button.hasAttribute('data-overview-filter')) {
        view = 'stats';
        // Start from an unfiltered explorer, then select the requested status.
        for (const [id, word] of [['filterSem','semesters'],['filterGrade','grades'],['filterStatus','statuses']]) {
            $(id).querySelectorAll('input').forEach(x => x.checked = false);
            $(id).querySelector('summary').textContent = 'All ' + word;
        }
        $('search').value = '';
        $('filterType').value = '';
        $('sort').value = 'sem';
        $('filterStatus').querySelector(`input[value="${button.dataset.overviewFilter}"]`).checked = true;
        $('filterStatus').querySelector('summary').textContent = '1 status selected';
        show();
        $('courseTable').scrollIntoView({block:'start'});
        return;
    } else view = button.dataset.overviewView;
    show();
    window.scrollTo(0,0);
});
