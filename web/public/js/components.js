async function loadComponent(id, file, script = null) {
    const html = await fetch(file).then(r => r.text());
    document.getElementById(id).innerHTML = html;

    if (script) {
        const scriptEl = document.createElement('script');
        scriptEl.src = script;
        scriptEl.defer = true;
        document.body.appendChild(scriptEl);
    }
}

loadComponent('header', 'components/header.html', '../js/auth.js');
loadComponent('footer', 'components/footer.html');
