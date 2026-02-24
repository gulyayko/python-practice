// Ждем загрузки Pyodide перед запуском кода
let pyodideReady;
let tasks = [];
let currentTaskIndex = 0;

async function init() {
    pyodideReady = await loadPyodide();
    await loadTasks();
}

async function loadTasks() {
    const response = await fetch("tasks.json");
    tasks = await response.json();
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

    select.addEventListener("change", e => loadTask(e.target.value));
    loadTask(0);
}

function loadTask(index) {
    currentTaskIndex = index;
    const task = tasks[index];

    document.getElementById("taskDescription").textContent = task.description;
    document.getElementById("code").value = task.template;
    document.getElementById("output").textContent = "";
}

async function runCode() {
    const pyodide = await pyodideReady;
    const userCode = document.getElementById("code").value;
    const task = tasks[currentTaskIndex];

    let testRunner = `
${userCode}

def run_tests():
    tests = ${JSON.stringify(task.tests)}
    results = []

    for i, test in enumerate(tests, start=1):
        try:
            result = ${task.functionName}(test["input"])
        except Exception as e:
            results.append(f"Test {i} crashed: {type(e).__name__}: {e}")
            continue

        if result != test["expected"]:
            results.append(
                f"Test {i} failed\\n"
                f"Input: {test['input']}\\n"
                f"Expected: {test['expected']}\\n"
                f"Got: {result}"
            )
        else:
            results.append(f"Test {i} passed")

    if all("passed" in r for r in results):
        return "All tests passed 🎉"
    return "\\n\\n".join(results)

run_tests()
`;

    try {
        const result = await pyodide.runPythonAsync(testRunner);
        const output = document.getElementById("output");
        output.textContent = result;
        output.className = result.includes("🎉") ? "success" : "error";
    } catch (err) {
        const output = document.getElementById("output");
        output.className = "error";
        output.textContent = "Syntax Error or invalid Python code:\n" + err;
    }
}

// Запуск
init();