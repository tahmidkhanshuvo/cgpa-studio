// Theme and navigation preferences
const uiKey = 'aust-cgpa-ui-v1';
let prefs = {};
try {
    prefs = JSON.parse(localStorage.getItem(uiKey) || '{}') || {};
}
catch (e) {
}
;
let dark = prefs.dark ?? (window.matchMedia('(prefers-color-scheme: dark)').matches), collapsed = window.matchMedia('(max-width: 1599px)').matches ? true : (prefs.collapsed ?? false);
function syncUI() {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.body.classList.toggle('sidebarHidden', collapsed);
    $('sidebar').inert = collapsed;
    $('sidebar').setAttribute('aria-hidden', String(collapsed));
    $('toggleSide').setAttribute('aria-expanded', String(!collapsed));
    $('themeToggle').setAttribute('aria-pressed', String(dark));
    $('themeToggle').title = dark ? 'Light mode' : 'Dark mode';
    $('themeToggle').innerHTML = dark ? '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="1.7"><path d="M20.7 15.3A9 9 0 0 1 8.7 3.3 9 9 0 1 0 20.7 15.3Z"/></svg>';
    try {
        localStorage.setItem(uiKey, JSON.stringify({ dark, collapsed }));
    }
    catch (e) {
    }
}
$('toggleSide').onclick = () => {
    collapsed = !collapsed;
    syncUI();
};
$('themeToggle').onclick = () => {
    dark = !dark;
    syncUI();
};
$('sidebarScrim').onclick = () => {
    collapsed = true;
    syncUI();
    $('toggleSide').focus();
};
document.addEventListener('click', e => {
    document.querySelectorAll('.filterMenu[open],.menu[open]').forEach(d => {
        if (!d.contains(e.target))
            d.open = false;
    });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.filterMenu[open],.menu[open]').forEach(d => d.open = false);
        if (!collapsed && !$('courseDialog').open) {
            collapsed = true;
            syncUI();
            $('toggleSide').focus();
        }
    }
});
syncUI();
