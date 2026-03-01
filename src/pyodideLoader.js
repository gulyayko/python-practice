import { loadMainApp } from "./main.js";

window.pyodideReady = null;

async function loadPyodideAndStart() {
    window.pyodideReady = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/" });
    loadMainApp();
}

loadPyodideAndStart();
