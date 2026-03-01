/* global CodeMirror */
CodeMirror.defineMode("python-plus", function(config, parserConfig) {
    const pythonMode = CodeMirror.getMode(config, "python");

    return CodeMirror.multiplexingMode(
        pythonMode,
        {
            open: '"""', close: '"""',
            mode: CodeMirror.getMode(config, "python"),
            delimStyle: "docstring"
        },
        {
            open: "'''", close: "'''",
            mode: CodeMirror.getMode(config, "python"),
            delimStyle: "docstring"
        }
    );
});