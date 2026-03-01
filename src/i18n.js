export const translations = {
    en: {
        selectLevel: "Level",
        selectTopic: "Topic",
        selectTask: "Task",
        selectLanguage: "Language",
        runTests: "Run Tests",
        allTestsPassed: "All tests passed 🎉",
        attempt: "Attempt",
        score: "Score"
    },
    ru: {
        selectLevel: "Уровень",
        selectTopic: "Тема",
        selectTask: "Задача",
        selectLanguage: "Язык",
        runTests: "Запустить тесты",
        allTestsPassed: "Все тесты пройдены 🎉",
        attempt: "Попытка",
        score: "Очки"
    }
};

export function applyTranslations(lang = "en") {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang]?.[key]) el.textContent = translations[lang][key];
    });
}
