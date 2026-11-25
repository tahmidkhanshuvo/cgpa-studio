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
