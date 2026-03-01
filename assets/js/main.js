let pyodideReady;
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

// ---------------- INIT ----------------
async function init() {
    pyodideReady = await loadPyodide();
    await populateLevels();

    // Инициализация CodeMirror
    const textarea = document.getElementById("code");
    if (textarea) {
        window.editor = CodeMirror.fromTextArea(textarea, {
            mode: "python",
            theme: "my-monokai",
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            smartIndent: true,
            tabSize: 4,
            rulers: [{column: 130, color: "#444"}]
        });
    }

    // Рисуем пустые слоты прогресса
    updateProgressUI();
}

window.addEventListener("DOMContentLoaded", init);

// ---------------- LEVELS ----------------
async function populateLevels() {
    const levelSelect = document.getElementById("levelSelect");

    levels.forEach(level => {
        const option = document.createElement("option");
        option.value = level.value;   // системное имя
        option.textContent = level.label; // красивое имя
        levelSelect.appendChild(option);
    });

    levelSelect.addEventListener("change", async () => {
        const level = levelSelect.value;
        await loadAllTasksForLevel(level);
        populateTopics(level);
        updateProgressUI();
    });

    const firstLevel = levels[0].value;
    await loadAllTasksForLevel(firstLevel);
    populateTopics(firstLevel);
    updateProgressUI();
}

// ---------------- TOPICS ----------------
function populateTopics(level) {
    const topicSelect = document.getElementById("topicSelect");
    topicSelect.innerHTML = "";

    const topics = Object.keys(window.allTasksByLevelTopic[level] || {});
    topics.forEach(topic => {
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        topicSelect.appendChild(option);
    });

    topicSelect.onchange = () => loadTasks(level, topicSelect.value);

    if (topics.length > 0) loadTasks(level, topics[0]);
}

// ---------------- LOAD TASK FILES ----------------
async function loadAllTasksForLevel(level) {
    window.allTasksByLevelTopic[level] = {};

    try {
        const indexResponse = await fetch(`data/tasks/python/${level}/index.json`);
        if (!indexResponse.ok) return;

        const files = await indexResponse.json();

        for (const file of files) {
            try {
                const response = await fetch(`data/tasks/python/${level}/${file}`);
                if (!response.ok) continue;

                const data = await response.json();
                window.allTasksByLevelTopic[level][data.topic] = data.tasks || [];

            } catch (err) {
                console.warn(`Failed loading ${file}`, err);
            }
        }

    } catch (err) {
        console.error(`Failed loading level ${level}`, err);
    }
}

// ---------------- TASKS ----------------
async function loadTasks(level, topic) {
    tasks = window.allTasksByLevelTopic[level][topic] || [];
    populateTasks();
}

function populateTasks() {
    const select = document.getElementById("taskSelect");
    select.innerHTML = "";

    tasks.forEach((task, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = task.title;
        select.appendChild(option);
    });

    select.onchange = e => loadTask(e.target.value);
    loadTask(0);
}

function loadTask(index) {
    currentTaskIndex = index;
    const task = tasks[index];

    document.getElementById("taskDescription").textContent = task.description;

    if (window.editor) {
        window.editor.setValue(task.template);
    } else {
        document.getElementById("code").value = task.template;
    }

    renderTestTable(task);
    attemptStartTime = Date.now();
    currentAttempts = 1;

    updateProgressUI();
}

// ---------------- TEST TABLE ----------------
function renderTestTable(task, results = null) {
    const container = document.getElementById("testTableContainer");
    container.innerHTML = "";

    const table = document.createElement("table");

    table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>Input</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Status</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement("tbody");

    task.tests.forEach((test, i) => {
        const tr = document.createElement("tr");
        const got = results?.[i]?.got ?? "";
        const passed = results?.[i]?.passed ?? false;

        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><pre>${JSON.stringify(test.input)}</pre></td>
            <td><pre>${JSON.stringify(test.expected)}</pre></td>
            <td class="${passed ? "correct" : "incorrect"}"><pre>${JSON.stringify(got)}</pre></td>
            <td style="text-align:left">${results ? (passed ? "✅" : "❌") : ""}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------- RUN CODE ----------------
async function runCode() {
    const pyodide = await pyodideReady;
    const userCode = window.editor ? window.editor.getValue() : document.getElementById("code").value;
    const task = tasks[currentTaskIndex];

    const output = document.getElementById("output");
    output.textContent = "";
    output.className = "";

    try {
        const timeoutMs = 3000;
        let timeoutHandle;

        const runPromise = (async () => {
            const namespace = pyodide.toPy({});

            const wrapped = `
results = []
error = None

try:
    exec(${JSON.stringify(userCode)})
except Exception as e:
    error = f"{type(e).__name__}: {e}"

if error:
    results = [{"got": error, "passed": False}]
else:
    tests = ${JSON.stringify(task.tests)}
    for test in tests:
        try:
            if "${task.functionName}" not in globals():
                raise NameError("Function not defined")
            result = ${task.functionName}(test["input"])
            passed = result == test["expected"]
        except Exception as e:
            result = f"Error: {type(e).__name__}: {e}"
            passed = False
        results.append({"got": result, "passed": passed})

results
`;

            return await pyodide.runPythonAsync(wrapped, { globals: namespace });
        })();

        const timeoutPromise = new Promise((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error("Execution timeout")), timeoutMs);
        });

        const results = await Promise.race([runPromise, timeoutPromise]);
        clearTimeout(timeoutHandle);

        const jsResults = results.toJs({ dict_converter: Object.fromEntries });
        results.destroy();

        renderTestTable(task, jsResults);

        const allPassed = jsResults.every(r => r.passed);

        if (allPassed) {
            output.textContent = "All tests passed 🎉";
            output.className = "success";
            markTaskComplete();
        } else {
            output.textContent = "Some tests failed ❌";
            output.className = "error";
            currentAttempts++;
        }

    } catch (err) {
        output.className = "error";
        output.textContent =
            err.message?.includes("timeout")
                ? "Execution stopped: infinite loop detected ⛔"
                : "Syntax Error or invalid Python code:\n" + err;

        renderTestTable(task);
    }
}

// ---------------- PROGRESS ----------------
function markTaskComplete() {
    const level = document.getElementById("levelSelect").value;
    const topic = document.getElementById("topicSelect").value;

    let progress = JSON.parse(localStorage.getItem("progress") || "{}");

    progress[level] ??= {};
    progress[level][topic] ??= {};

    const task = tasks[currentTaskIndex];
    const now = Date.now();
    const timeSpent = Math.max(1, (now - attemptStartTime) / 1000);

    const basePoints = 10;
    const attemptsFactor = Math.pow(0.8, currentAttempts - 1);
    const timeFactor = Math.max(0.5, 1 - timeSpent / 180);

    const score = Math.round(basePoints * (task.weight || 1) * attemptsFactor * timeFactor);

    progress[level][topic][currentTaskIndex] = {
        completed: true,
        score,
        attempts: currentAttempts,
        time: Math.round(timeSpent)
    };

    localStorage.setItem("progress", JSON.stringify(progress));
    updateProgressUI();
}

function updateProgressUI() {
    const progressBar = document.getElementById("progressBar");
    const scoreValue = document.getElementById("scoreValue");
    if (!progressBar || !scoreValue) return;

    const level = document.getElementById("levelSelect")?.value;
    if (!level || !window.allTasksByLevelTopic) return;

    const progress = JSON.parse(localStorage.getItem("progress") || "{}");
    const topics = Object.keys(window.allTasksByLevelTopic[level] || {});

    // Общее количество задач
    const allTasks = [];
    topics.forEach(topic => {
        const topicTasks = window.allTasksByLevelTopic[level][topic] || [];
        topicTasks.forEach((task, idx) => {
            allTasks.push({topic, idx});
        });
    });

    // Очистка контейнера
    progressBar.innerHTML = "";
    let totalScore = 0;

    // Создаем элементы
    allTasks.forEach(({topic, idx}) => {
        const item = document.createElement("div");
        item.classList.add("progress-item");

        // Проверка, выполнена ли задача
        const taskProgress = progress[level]?.[topic]?.[idx];
        if (taskProgress?.completed) {
            item.classList.add("filled");
            totalScore += taskProgress.score || 0;
        }

        progressBar.appendChild(item);
    });

    scoreValue.textContent = totalScore;
}