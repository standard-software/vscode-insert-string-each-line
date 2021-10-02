const vscode = require('vscode');
const split = require('graphemesplit');

const isBoolean = (value) => typeof value === 'boolean';
const isUndefined = (value) => typeof value === 'undefined';
const isNumber = (value) => {
  return (typeof value === 'number' && (isFinite(value)));
};

const __max = (array) => {
  if (array.length === 0) {
    return null;
  }
  let result = array[0];
  for (let i = 0, l = array.length; i < l; i += 1) {
    if (!isNumber(array[i])) {
      throw new TypeError(
        '__max args(array) element is not number',
      );
    }
    if (result < array[i]) {
      result = array[i];
    }
  }
  return result;
};

const _indexOfFirst = (str, search, indexStart) => {
  if (search === '') {
    return -1;
  }
  return str.indexOf(search, indexStart);
};

const _indexOfLast = (
  str, search, indexStart = __max([0, str.length - 1]),
) => {
  if (search === '') {
    return -1;
  }
  return str.lastIndexOf(search, indexStart);
};

const _isFirst = (str, search) => {
  return _indexOfFirst(str, search) === 0;
};

const _isLast = (str, search) => {
  const result = _indexOfLast(str, search);
  if (result === -1) {
    return false;
  }
  return result === str.length - search.length;
};

const _findFirstIndex = (array, func) => {
  for (let i = 0, l = array.length; i < l; i += 1) {
    const resultFunc = func(array[i], i, array);
    if (!isBoolean(resultFunc)) {
      throw new TypeError(
        '_findFirstIndex args(compareFunc) result is not boolean',
      );
    }
    if (resultFunc) {
      return i;
    }
  }
  return -1;
};

const _findFirst = (array, func) => {
  const resultIndex = _findFirstIndex(array, func);
  if (resultIndex === -1) {
    return undefined;
  }
  return array[resultIndex];
};

const _deleteIndex = (
  str, indexStart, indexEnd = indexStart,
) => {
  const startStr = str.slice(0, indexStart);
  const endStr = str.slice(indexEnd + 1, str.length);
  return startStr + endStr;
};

const _deleteLength = (
  str, index, length = str.length - index,
) => {
  return _deleteIndex(str, index, index + length - 1);
};

const _deleteFirst = (str, length = 1) => {
  return _deleteLength(
    str, 0, length,
  );
};

const _deleteLast = (str, length = 1) => {
  return _deleteLength(
    str, str.length - length, length,
  );
};

const _trimFirst = (
  str,
  valueArray = [' ', '\t', '\r', '\n'],
) => {
  while (true) {
    const value = _findFirst(
      valueArray, value => _isFirst(str, value),
    );
    if (isUndefined(value)) {
      break;
    }
    str = _deleteFirst(str, value.length);
  }
  return str;
};

const _trimLast = (
  str,
  valueArray = [' ', '\r', '\n'],
) => {
  while (true) {
    const value = _findFirst(
      valueArray, value => _isLast(str, value),
    );
    if (isUndefined(value)) {
      break;
    }
    str = _deleteLast(str, value.length);
  }
  return str;
};

const _subLength = (
  str, index, length = str.length - index,
) => {
  return str.substring(index, index + length);
};

const _subFirst = (str, length = 1) => {
  return _subLength(
    str, 0, length,
  );
};

const _subLast = (str, length = 1) => {
  return _subLength(
    str, str.length - length, length,
  );
};

const _insert = (str, value, index = 0) => {
  str = _subFirst(str, index)
    + value + _subLast(str, str.length - index);
  return str;
};

function activate(context) {

  const extensionMain = (commandName) => {

    const editor = vscode.window.activeTextEditor;
    if ( !editor ) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    const insertString = vscode.workspace.getConfiguration(`InsertStringEachLine`).get(`insertString`);

    const options = {
      ignoreFocusOut: true,
      placeHolder: ``,
      prompt: `Insert String`,
      value: insertString,
    };

    vscode.window.showInputBox(options).then(inputInsertString => {
      if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage( `No editor is active` );
        return;
      }
      editor.edit(ed => {

        const editorSelectionsLoop = (f) => {
          editor.selections.forEach(select => {
            const range = new vscode.Range(
              select.start.line, 0, select.end.line, select.end.character
            );
            const text = editor.document.getText(range);
            f(range, text);
          });
        }

        const editorSelectionsLoopUnsupportTab = (f) => {
          let includeTabFlag = false;
          editor.selections.forEach(select => {
            const range = new vscode.Range(
              select.start.line, 0, select.end.line, select.end.character
            );
            const text = editor.document.getText(range);
            if (text.includes(`\t`)) {
              includeTabFlag = true
            }
            f(range, text);
          });
          if (includeTabFlag) {
            vscode.window.showInformationMessage( 'This feature of Insert String Each Line Extension does not support tabs.');
          }
        }

        const getIndent = (line) => {
          return line.length - _trimFirst(line, [' ', '\t']).length;
        }

        const getMinIndent = (lines) => {
          let minIndent = Infinity;
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].trim() === '') { continue; }
            const indent = getIndent(lines[i])
            if (indent < minIndent) {
              minIndent = indent
            }
          }
          if (minIndent === Infinity) { minIndent = 0; }
          return minIndent;
        }

        const textLength = (str) => {
          let result = 0;
          for(const char of split(str)){
            const codePoint = char.codePointAt(0);
            const len = 0x00 <= codePoint && codePoint <= 0xFF ? 1 : 2;
            result += len;
          }
          return result;
        }

        const getMaxLength = (lines) => {
          let maxLength = 0;
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].trim() === '') { continue; }
            const length = textLength(_trimLast(lines[i], ['\r']))
            if (maxLength < length) {
              maxLength = length
            }
          }
          return maxLength;
        }

        switch (commandName) {

          case `InsertBeginLineAllLines`:
            editorSelectionsLoop((range, text) => {
              const lines = text.split(`\n`);
              for (let i = 0; i < lines.length; i += 1) {
                lines[i] = inputInsertString + lines[i];
              };
              ed.replace(range, lines.join(`\n`));
            })
            break;

          case `InsertBeginLineOnlyTextLines`:
            editorSelectionsLoop((range, text) => {
              const lines = text.split(`\n`);
              for (let i = 0; i < lines.length; i += 1) {
                if (lines[i].trim() === '') { continue; }
                lines[i] = inputInsertString + lines[i];
              };
              ed.replace(range, lines.join(`\n`));
            })
            break;

          case `InsertBeginLineOnlyMinIndent`:
            editorSelectionsLoop((range, text) => {
              const lines = text.split(`\n`);
              const minIndent = getMinIndent(lines);

              for (let i = 0; i < lines.length; i += 1) {
                if (lines[i].trim() === '') { continue; }
                const indent = getIndent(lines[i])
                if (indent !== minIndent) { continue; }
                lines[i] = inputInsertString + lines[i];
              };
              ed.replace(range, lines.join(`\n`));
            })
            break;

            case `InsertBeginTextAllLines`:
              editorSelectionsLoop((range, text) => {
                const lines = text.split(`\n`);
                for (let i = 0; i < lines.length; i += 1) {
                  const indent = getIndent(lines[i])
                  lines[i] = _insert(
                    lines[i], inputInsertString,
                    indent
                  );
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `InsertBeginTextOnlyTextLines`:
              editorSelectionsLoop((range, text) => {
                const lines = text.split(`\n`);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  const indent = getIndent(lines[i])
                  lines[i] = _insert(
                    lines[i], inputInsertString,
                    indent
                  );
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `InsertBeginTextOnlyMinIndent`:
              editorSelectionsLoopUnsupportTab((range, text) => {
                const lines = text.split(`\n`);
                const minIndent = getMinIndent(lines);

                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  const indent = getIndent(lines[i])
                  if (indent !== minIndent) { continue; }
                  lines[i] = _insert(
                    lines[i], inputInsertString,
                    indent
                  );
                };
                ed.replace(range, lines.join(`\n`));
              });
              break;

            case `InsertMinIndentAllLines`:
              editorSelectionsLoopUnsupportTab((range, text) => {
                const lines = text.split(`\n`);
                const minIndent = getMinIndent(lines);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') {
                    lines[i] = ' '.repeat(minIndent) + inputInsertString;
                    continue;
                  }
                  lines[i] = _insert(lines[i], inputInsertString, minIndent)
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `InsertMinIndentOnlyTextLines`:
              editorSelectionsLoopUnsupportTab((range, text) => {
                const lines = text.split(`\n`);
                const minIndent = getMinIndent(lines);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  lines[i] = _insert(lines[i], inputInsertString, minIndent)
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `InsertMaxLengthAllLines`:
              editorSelectionsLoopUnsupportTab((range, text) => {
                const lines = text.split(`\n`);
                const maxLength = getMaxLength(lines);
                for (let i = 0; i < lines.length; i += 1) {
                  const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                  const trimLine = _trimLast(lines[i], ['\r']);
                  if (trimLine === '') {
                    lines[i] = ' '.repeat(maxLength) + inputInsertString + lastLineBreak;
                    continue;
                  }
                  lines[i] = trimLine + ' '.repeat(maxLength - textLength(trimLine)) + inputInsertString + lastLineBreak;
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `InsertMaxLengthOnlyTextLines`:
              editorSelectionsLoopUnsupportTab((range, text) => {
                const lines = text.split(`\n`);
                const maxLength = getMaxLength(lines);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                  const trimLine = _trimLast(lines[i], ['\r']);
                  if (trimLine === '') {
                    lines[i] = ' '.repeat(maxLength) + inputInsertString + lastLineBreak;
                    continue;
                  }
                  lines[i] = trimLine + ' '.repeat(maxLength - textLength(trimLine)) + inputInsertString + lastLineBreak;
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `DeleteBeginText`:
              editorSelectionsLoop((range, text) => {
                const lines = text.split(`\n`);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  const trimLine = _trimFirst(lines[i], [' ', '\t']);
                  const trimFirstInput = _trimFirst(inputInsertString, [' ']);
                  if (_isFirst(trimLine, trimFirstInput)) {
                    lines[i] = lines[i].replace(inputInsertString, '');
                  }
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

            case `DeleteEndText`:
              editorSelectionsLoop((range, text) => {
                const lines = text.split(`\n`);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                  const trimLine = _trimLast(lines[i], [' ', '\t', '\r']);
                  const trimLastInput = _trimLast(inputInsertString, [' ']);
                  if (_isLast(trimLine, trimLastInput)) {
                    lines[i] = _trimLast(_deleteLast(trimLine, trimLastInput.length), [' ', '\t']) + lastLineBreak;
                  }
                };
                ed.replace(range, lines.join(`\n`));
              })
              break;

          default:
            new Error(`insertLineHeadMain`);
        }
      } );
    } );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginLineAllLines`, () => {
      extensionMain(`InsertBeginLineAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginLineOnlyTextLines`, () => {
      extensionMain(`InsertBeginLineOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginLineOnlyMinIndent`, () => {
      extensionMain(`InsertBeginLineOnlyMinIndent`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginTextAllLines`, () => {
      extensionMain(`InsertBeginTextAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginTextOnlyTextLines`, () => {
      extensionMain(`InsertBeginTextOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginTextOnlyMinIndent`, () => {
      extensionMain(`InsertBeginTextOnlyMinIndent`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertMinIndentAllLines`, () => {
      extensionMain(`InsertMinIndentAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertMinIndentOnlyTextLines`, () => {
      extensionMain(`InsertMinIndentOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertMaxLengthAllLines`, () => {
      extensionMain(`InsertMaxLengthAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertMaxLengthOnlyTextLines`, () => {
      extensionMain(`InsertMaxLengthOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.DeleteBeginText`, () => {
      extensionMain(`DeleteBeginText`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.DeleteEndText`, () => {
      extensionMain(`DeleteEndText`);
    })
  );

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
