import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { basicSetup } from "codemirror";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";

// Базовые ключевые слова Python для автодополнения
const pythonKeywords = [
    "def", "return", "if", "elif", "else", "for", "while",
    "import", "from", "as", "class", "try", "except", "finally",
    "with", "lambda", "True", "False", "None", "and", "or", "not", "in", "is"
];

export function createEditor(parent, doc = "") {
    const state = EditorState.create({
        doc,
        extensions: [
            basicSetup,
            python(),
            autocompletion({
                override: [completeFromList(pythonKeywords)]
            }),
            EditorState.tabSize.of(4),
            EditorView.theme({
                "&": { height: "350px", backgroundColor: "#1e1e1e", color: "#ffffff" },
                ".cm-content": { fontFamily: "'JetBrains Mono', monospace", fontSize: "16px" },
                ".cm-cursor": { borderLeft: "1px solid #f8f8f0" },
                "&.cm-focused .cm-selectionBackground": { backgroundColor: "#3a3f4b" },
                ".cm-gutters": { backgroundColor: "#212121", color: "#5c6370", borderRight: "0" },
            })
        ]
    });

    return new EditorView({ state, parent });
}
