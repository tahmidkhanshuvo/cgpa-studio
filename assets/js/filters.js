function selectedFilters(id) {
    return Array.from($(id).querySelectorAll('input:checked'), el => +el.value);
}
function initFilter(id, items, word) {
    let root = $(id), body = root.querySelector('.filterBody');
    root.querySelector('summary').textContent = 'All ' + word;
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
