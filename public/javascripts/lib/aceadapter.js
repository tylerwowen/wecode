var firepad,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

if (typeof firepad === "undefined" || firepad === null) {
    firepad = {};
}

firepad.ACEAdapter = (function() {
    ACEAdapter.prototype.ignoreChanges = false;

    function ACEAdapter(aceInstance) {
        this.onCursorActivity = bind(this.onCursorActivity, this);
        this.onFocus = bind(this.onFocus, this);
        this.onBlur = bind(this.onBlur, this);
        this.onChange = bind(this.onChange, this);
        var ref;
        this.ace = aceInstance;
        this.aceSession = this.ace.getSession();
        this.aceDoc = this.aceSession.getDocument();
        this.aceDoc.setNewLineMode('unix');
        this.grabDocumentState();
        this.ace.on('change', this.onChange);
        this.ace.on('blur', this.onBlur);
        this.ace.on('focus', this.onFocus);
        this.aceSession.selection.on('changeCursor', this.onCursorActivity);
        if (this.aceRange == null) {
            this.aceRange = ((ref = ace.require) != null ? ref : require)("ace/range").Range;
        }
    }

    ACEAdapter.prototype.grabDocumentState = function() {
        this.lastDocLines = this.aceDoc.getAllLines();
        return this.lastCursorRange = this.aceSession.selection.getRange();
    };

    ACEAdapter.prototype.detach = function() {
        this.ace.removeListener('change', this.onChange);
        this.ace.removeListener('blur', this.onBlur);
        this.ace.removeListener('focus', this.onCursorActivity);
        return this.aceSession.selection.removeListener('changeCursor', this.onCursorActivity);
    };

    ACEAdapter.prototype.onChange = function(change) {
        var pair;
        if (!this.ignoreChanges) {
            updateColabrativeString();
            return this.grabDocumentState();
        }
    };

    ACEAdapter.prototype.onBlur = function() {
        if (this.ace.selection.isEmpty()) {
            return this.trigger('blur');
        }
    };

    ACEAdapter.prototype.onFocus = function() {
        return this.trigger('focus');
    };

    ACEAdapter.prototype.onCursorActivity = function() {
        return setTimeout((function(_this) {
            return function() {
                return _this.trigger('cursorActivity');
            };
        })(this), 0);
    };

    // Converts an ACE change object into a TextOperation and its inverse
    // and returns them as a two-element array.
    ACEAdapter.prototype.operationFromACEChange = function(change) {
        console.log('operation from ace change called');
    };

    // Apply an operation to an ACE instance.
    ACEAdapter.prototype.applyOperationToACE = function(event) {

        var startPos = this.aceDoc.indexToPosition(event.index, 0);
        if (event.type == 'text_inserted') {
            this.aceDoc.insert(startPos, event.text);
        }
        else {
            var endPos = this.aceDoc.indexToPosition(event.index + event.text.length, 0);
            var aceRange = ace.require('ace/range').Range;
            var range = new aceRange(startPos.row, startPos.column, endPos.row, endPos.column);
            this.aceDoc.remove(range);
        }
    };

    ACEAdapter.prototype.posFromIndex = function(index) {
        var j, len, line, ref, row;
        ref = this.aceDoc.$lines;
        for (row = j = 0, len = ref.length; j < len; row = ++j) {
            line = ref[row];
            if (index <= line.length) {
                break;
            }
            index -= line.length + 1;
        }
        return {
            row: row,
            column: index
        };
    };

    ACEAdapter.prototype.indexFromPos = function(pos, lines) {
        var i, index, j, ref;
        if (lines == null) {
            lines = this.lastDocLines;
        }
        index = 0;
        for (i = j = 0, ref = pos.row; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            index += this.lastDocLines[i].length + 1;
        }
        return index += pos.column;
    };

    ACEAdapter.prototype.getValue = function() {
        return this.aceDoc.getValue();
    };

    ACEAdapter.prototype.getCursor = function() {
        var e, e2, end, ref, ref1, start;
        try {
            start = this.indexFromPos(this.aceSession.selection.getRange().start, this.aceDoc.$lines);
            end = this.indexFromPos(this.aceSession.selection.getRange().end, this.aceDoc.$lines);
        } catch (_error) {
            e = _error;
            try {
                start = this.indexFromPos(this.lastCursorRange.start);
                end = this.indexFromPos(this.lastCursorRange.end);
            } catch (_error) {
                e2 = _error;
                console.log("Couldn't figure out the cursor range:", e2, "-- setting it to 0:0.");
                ref = [0, 0], start = ref[0], end = ref[1];
            }
        }
        if (start > end) {
            ref1 = [end, start], start = ref1[0], end = ref1[1];
        }
        return new firepad.Cursor(start, end);
    };

    ACEAdapter.prototype.setCursor = function(cursor) {
        var end, ref, start;
        start = this.posFromIndex(cursor.position);
        end = this.posFromIndex(cursor.selectionEnd);
        if (cursor.position > cursor.selectionEnd) {
            ref = [end, start], start = ref[0], end = ref[1];
        }
        return this.aceSession.selection.setSelectionRange(new this.aceRange(start.row, start.column, end.row, end.column));
    };

    ACEAdapter.prototype.setOtherCursor = function(cursor, color, clientId) {
        var clazz, css, cursorRange, end, justCursor, ref, self, start;
        if (this.otherCursors == null) {
            this.otherCursors = {};
        }
        cursorRange = this.otherCursors[clientId];
        if (cursorRange) {
            cursorRange.start.detach();
            cursorRange.end.detach();
            this.aceSession.removeMarker(cursorRange.id);
        }
        start = this.posFromIndex(cursor.position);
        end = this.posFromIndex(cursor.selectionEnd);
        if (cursor.selectionEnd < cursor.position) {
            ref = [end, start], start = ref[0], end = ref[1];
        }
        clazz = "other-client-selection-" + (color.replace('#', ''));
        justCursor = cursor.position === cursor.selectionEnd;
        if (justCursor) {
            clazz = clazz.replace('selection', 'cursor');
        }
        css = "." + clazz + " {\n  position: absolute;\n  background-color: " + (justCursor ? 'transparent' : color) + ";\n  border-left: 2px solid " + color + ";\n}";
        this.addStyleRule(css);
        this.otherCursors[clientId] = cursorRange = new this.aceRange(start.row, start.column, end.row, end.column);
        self = this;
        cursorRange.clipRows = function() {
            var range;
            range = self.aceRange.prototype.clipRows.apply(this, arguments);
            range.isEmpty = function() {
                return false;
            };
            return range;
        };
        cursorRange.start = this.aceDoc.createAnchor(cursorRange.start);
        cursorRange.end = this.aceDoc.createAnchor(cursorRange.end);
        cursorRange.id = this.aceSession.addMarker(cursorRange, clazz, "text");
        return {
            clear: (function(_this) {
                return function() {
                    cursorRange.start.detach();
                    cursorRange.end.detach();
                    return _this.aceSession.removeMarker(cursorRange.id);
                };
            })(this)
        };
    };

    ACEAdapter.prototype.addStyleRule = function(css) {
        var styleElement;
        if (typeof document === "undefined" || document === null) {
            return;
        }
        if (!this.addedStyleRules) {
            this.addedStyleRules = {};
            styleElement = document.createElement('style');
            document.documentElement.getElementsByTagName('head')[0].appendChild(styleElement);
            this.addedStyleSheet = styleElement.sheet;
        }
        if (this.addedStyleRules[css]) {
            return;
        }
        this.addedStyleRules[css] = true;
        return this.addedStyleSheet.insertRule(css, 0);
    };

    ACEAdapter.prototype.registerCallbacks = function(callbacks) {
        this.callbacks = callbacks;
    };

    ACEAdapter.prototype.trigger = function() {
        var args, event, ref, ref1;
        event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return (ref = this.callbacks) != null ? (ref1 = ref[event]) != null ? ref1.apply(this, args) : void 0 : void 0;
    };

    ACEAdapter.prototype.applyOperation = function(event) {
        this.ignoreChanges = true;
        this.applyOperationToACE(event);
        return this.ignoreChanges = false;
    };

    ACEAdapter.prototype.registerUndo = function(undoFn) {
        return this.ace.undo = undoFn;
    };

    ACEAdapter.prototype.registerRedo = function(redoFn) {
        return this.ace.redo = redoFn;
    };

    ACEAdapter.prototype.invertOperation = function(operation) {
        return operation.invert(this.getValue());
    };

    return ACEAdapter;

})();
