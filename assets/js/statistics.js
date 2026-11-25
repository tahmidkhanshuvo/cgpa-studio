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
