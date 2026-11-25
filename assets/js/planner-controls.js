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
