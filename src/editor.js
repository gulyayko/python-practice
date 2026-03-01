import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { autocompletion } from "@codemirror/autocomplete";

export function createEditor(parent) {
    const state = EditorState.create({
        doc: `def hello(name: str) -> str:
    """
    Return greeting.
    :param name: person's name
    """
    return f"Hello, {name}"`,
        extensions: [
            basicSetup,
            python(),
            oneDark,
            autocompletion(),  // <- добавили автодополнение
            indentUnit.of("    "), // <- 4 пробела
            EditorView.theme({
                "&": { height: "400px" }
            })
        ]
    });

    return new EditorView({
        state,
        parent
    });
}
