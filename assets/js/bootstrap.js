$('trendScale').onchange = () => renderTrend(model());
let trendResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(trendResizeTimer);
    trendResizeTimer = setTimeout(() => {
        if (view === 'stats')
            renderTrend(model());
    }, 120);
});
syncCurriculumControls();
show();
