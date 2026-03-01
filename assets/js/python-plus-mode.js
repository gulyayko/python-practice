/* global CodeMirror */

// overlay mode для Python docstring
(function() {
    const tripleQuoteOverlay = {
        token: function(stream, state) {
            // проверяем начало тройных кавычек
            if (stream.match('"""') || stream.match("'''")) {
                state.inDocstring = true;
                return "docstring"; // токен для CSS
            }
            if (state.inDocstring) {
                // ищем закрывающие тройные кавычки
                if (stream.skipTo('"""') || stream.skipTo("'''")) {
                    state.inDocstring = false;
                    return "docstring";
                }
                stream.skipToEnd();
                return "docstring";
            }
            while (stream.next() != null && !stream.match('"""', false) && !stream.match("'''", false)) {}
            return null;
        },
        startState: function() {
            return { inDocstring: false };
        }
    };

    // создаём overlay поверх стандартного Python режима
    CodeMirror.defineMode("python-plus", function(config) {
        const pythonMode = CodeMirror.getMode(config, "python");
        return CodeMirror.overlayMode(pythonMode, tripleQuoteOverlay);
    });
})();