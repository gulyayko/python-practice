import { createEditor } from "./editor.js";
import { applyTranslations } from "./i18n.js";

let editor;
let tasks = [];
let currentTaskIndex = 0;
let currentAttempts = 1;
let attemptStartTime;
const levels = [
    { value: "beginner", label: "Beginner" },
    { value: "junior", label: "Junior" },
    { value: "junior_plus", label: "Junior Plus" }
];

window.allTasksByLevelTopic = {};

export async function loadMainApp() {
    editor = createEditor(document.querySelector(".editor-container"));
    setupLanguageSelect();
    await populateLevels();
    document.getElementById("runButton").addEventListener("click", runCode);
}

function setupLanguageSelect() {
    const select = document.getElementById("languageSelect");
    select.addEventListener("change", () => applyTranslations(select.value));
    applyTranslations(select.value);
}

// --- populateLevels(), populateTopics(), loadTasks(), populateTasks(), loadTask() ---
// --- renderTestTable(), runCode(), markTaskComplete(), updateProgressUI() ---
// Остальной код полностью переносится из CM5 версии, только заменяем editor.setValue / editor.getValue
// на CM6:

function loadTask(index) {
    currentTaskIndex = index;
    const task = tasks[index];

    document.getElementById("taskDescription").textContent = task.description;
    editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: task.template }
    });

    renderTestTable(task);
    attemptStartTime = Date.now();
    currentAttempts = 1;

    updateProgressUI();
}

async function runCode() {
    const pyodide = await window.pyodideReady;
    const userCode = editor.state.doc.toString();
    const task = tasks[currentTaskIndex];
    // --- остальной код из старого проекта без изменений ---
}