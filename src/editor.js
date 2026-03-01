import { EditorView, basicSetup } from "@codemirror/basic-setup";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

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
