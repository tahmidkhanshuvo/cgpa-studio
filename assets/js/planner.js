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
