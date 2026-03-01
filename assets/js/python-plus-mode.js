/* global CodeMirror */
CodeMirror.defineMode("", function(config, parserConfig) {
    const pythonMode = CodeMirror.getMode(config, "python-plus");

    return CodeMirror.multiplexingMode(
        pythonMode,
        {
            open: '"""', close: '"""',
            mode: CodeMirror.getMode(config, "python-plus"),
            delimStyle: "docstring"
        },
        {
            open: "'''", close: "'''",
            mode: CodeMirror.getMode(config, "python-plus"),
            delimStyle: "docstring"
        }
    );
});