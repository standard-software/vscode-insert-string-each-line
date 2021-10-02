const vscode = require('vscode');

const isBoolean = (value) => typeof value === 'boolean';
const isUndefined = (value) => typeof value === 'undefined';

const _indexOfFirst = (str, search, indexStart) => {
  if (search === '') {
    return -1;
  }
  return str.indexOf(search, indexStart);
};

const _isFirst = (str, search) => {
  return _indexOfFirst(str, search) === 0;
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

  const insertLineHeadMain = (commandName) => {

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
      if (!inputInsertString) {
        return;
      }
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
            vscode.window.showInformationMessage( 'This feature of Insert Line Head Extension does not support tabs.');
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
                console.log({lines})
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

            case `DeleteBeginText`:
              editorSelectionsLoop((range, text) => {
                const lines = text.split(`\n`);
                for (let i = 0; i < lines.length; i += 1) {
                  if (lines[i].trim() === '') { continue; }
                  const trimLine = _trimFirst(lines[i], [' ', '\t']);
                  if (_isFirst(trimLine, inputInsertString)) {
                    lines[i] = lines[i].replace(inputInsertString, '');
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
      insertLineHeadMain(`InsertBeginLineAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginLineOnlyTextLines`, () => {
      insertLineHeadMain(`InsertBeginLineOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginLineOnlyMinIndent`, () => {
      insertLineHeadMain(`InsertBeginLineOnlyMinIndent`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginTextAllLines`, () => {
      insertLineHeadMain(`InsertBeginTextAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginTextOnlyTextLines`, () => {
      insertLineHeadMain(`InsertBeginTextOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertBeginTextOnlyMinIndent`, () => {
      insertLineHeadMain(`InsertBeginTextOnlyMinIndent`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertMinIndentAllLines`, () => {
      insertLineHeadMain(`InsertMinIndentAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.InsertMinIndentOnlyTextLines`, () => {
      insertLineHeadMain(`InsertMinIndentOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`InsertStringEachLine.DeleteBeginText`, () => {
      insertLineHeadMain(`DeleteBeginText`);
    })
  );

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
