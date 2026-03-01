export async function loadTranslations(lang = "en") {
    try {
        const res = await fetch(`data/ui/${lang}.json`);
        if (!res.ok) return {};
        return await res.json();
    } catch {
        return {};
    }
}

export async function applyTranslations(lang = "en") {
    const dict = await loadTranslations(lang);
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    });
}
