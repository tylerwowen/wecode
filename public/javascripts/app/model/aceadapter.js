define(function(require) {
    "use strict";
    
    var Cursor = require('app/model/cursor');
    var ace = require('ace/ace');

    var bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        },
        slice = [].slice;

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

    (function () {

        this.ignoreChanges = false;

        this.realtimeData = null;

        this.currentUserId = null;

        this.addListeners = function(realtimeData, currentUserId) {
            this.realtimeData = realtimeData;
            this.currentUserId = currentUserId;
            this.ace.on('change', this.onChange);
            this.ace.on('blur', this.onBlur);
            this.ace.on('focus', this.onFocus);
            return this.aceSession.selection.on('changeCursor', this.onCursorActivity);
        }

        this.grabDocumentState = function () {
            this.lastDocLines = this.aceDoc.getAllLines();
            return this.lastCursorRange = this.aceSession.selection.getRange();
        };

        this.detach = function () {
            this.ace.removeListener('change', this.onChange);
            this.ace.removeListener('blur', this.onBlur);
            this.ace.removeListener('focus', this.onCursorActivity);
            return this.aceSession.selection.removeListener('changeCursor', this.onCursorActivity);
        };

        this.onChange = function (change) {
            var pair;
            if (!this.ignoreChanges) {
                this.operationFromACEChange();
                return this.grabDocumentState();
            }
        };

        this.onBlur = function () {
            if (this.ace.selection.isEmpty()) {
                return this.trigger('blur');
            }
        };

        this.onFocus = function () {
            return this.trigger('focus');
        };

        this.onCursorActivity = function () {
            if (this.currentUserId) {
                this.realtimeData.cursors.set(this.currentUserId, this.getCursor());
            }
            return setTimeout((function (_this) {
                return function () {
                    return _this.trigger('cursorActivity');
                };
            })(this), 0);
        };

        // Converts an ACE change object into a TextOperation and its inverse
        // and returns them as a two-element array.
        this.operationFromACEChange = function (change) {
            if (this.realtimeData) {
                this.realtimeData.text.setText(this.aceDoc.getValue());
            }
        };

        // Apply an operation to an ACE instance.
        this.applyOperationToACE = function (event) {

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

        this.posFromIndex = function (index) {
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

        this.indexFromPos = function (pos, lines) {
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

        this.getValue = function () {
            return this.aceDoc.getValue();
        };

        this.getCursor = function () {
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
            return new Cursor(start, end);
        };

        this.setCursor = function (cursor) {
            var end, ref, start;
            start = this.posFromIndex(cursor.position);
            end = this.posFromIndex(cursor.selectionEnd);
            if (cursor.position > cursor.selectionEnd) {
                ref = [end, start], start = ref[0], end = ref[1];
            }
            return this.aceSession.selection.setSelectionRange(new this.aceRange(start.row, start.column, end.row, end.column));
        };

        this.setOtherCursor = function (cursor, color, userId) {
            var clazz, css, cursorRange, end, justCursor, ref, self, start;
            if (this.otherCursors == null) {
                this.otherCursors = {};
            }
            cursorRange = this.otherCursors[userId];
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
            this.otherCursors[userId] = cursorRange = new this.aceRange(start.row, start.column, end.row, end.column);
            self = this;
            cursorRange.clipRows = function () {
                var range;
                range = self.aceRange.prototype.clipRows.apply(this, arguments);
                range.isEmpty = function () {
                    return false;
                };
                return range;
            };
            cursorRange.start = this.aceDoc.createAnchor(cursorRange.start);
            cursorRange.end = this.aceDoc.createAnchor(cursorRange.end);
            cursorRange.id = this.aceSession.addMarker(cursorRange, clazz, "text");
            return {
                clear: (function (_this) {
                    return function () {
                        cursorRange.start.detach();
                        cursorRange.end.detach();
                        return _this.aceSession.removeMarker(cursorRange.id);
                    };
                })(this)
            };
        };

        this.addStyleRule = function (css) {
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

        this.registerCallbacks = function (callbacks) {
            this.callbacks = callbacks;
        };

        this.trigger = function () {
            var args, event, ref, ref1;
            event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return (ref = this.callbacks) != null ? (ref1 = ref[event]) != null ? ref1.apply(this, args) : void 0 : void 0;
        };

        this.applyOperation = function (event) {
            this.ignoreChanges = true;
            this.applyOperationToACE(event);
            return this.ignoreChanges = false;
        };

        this.registerUndo = function (undoFn) {
            return this.ace.undo = undoFn;
        };

        this.registerRedo = function (redoFn) {
            return this.ace.redo = redoFn;
        };

        this.invertOperation = function (operation) {
            return operation.invert(this.getValue());
        };

    }).call(ACEAdapter.prototype);

    return ACEAdapter;
});