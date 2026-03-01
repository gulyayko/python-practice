/* global CodeMirror */
(function() {
    const tripleQuoteOverlay = {
        token: function(stream, state) {
            // Если уже в docstring
            if (state.inDocstring) {
                if (stream.match(state.quote)) {  // нашли закрывающую кавычку
                    state.inDocstring = false;
                    state.quote = null;
                    return "docstring";
                }
                stream.next();  // съедаем символ
                return "docstring";
            }
            // Ищем открывающую тройную кавычку
            if (stream.match('"""') || stream.match("'''")) {
                state.inDocstring = true;
                state.quote = stream.current(); // сохраняем какой тип кавычек
                return "docstring";
            }
            stream.next();
            return null;
        },
        startState: function() {
            return { inDocstring: false, quote: null };
        }
    };

    CodeMirror.defineMode("python-docstring", function(config) {
        const pythonMode = CodeMirror.getMode(config, "python");
        return CodeMirror.overlayMode(pythonMode, tripleQuoteOverlay);
    });
})();