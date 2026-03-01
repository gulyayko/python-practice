import { createEditor } from "./editor.js";

const container = document.getElementById("editor");

const editor = createEditor(container);

// Debug helper
window.getCode = () => editor.state.doc.toString();
