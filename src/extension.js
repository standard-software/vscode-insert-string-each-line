const vscode = require('vscode');
const split = require('graphemesplit');
const {
  _isFirst, _isLast,
  _deleteLast,
  _trimFirst, _trimLast,
  _insert,
} = require('./parts.js')

function activate(context) {

  const extensionMain = (commandName) => {

    const editor = vscode.window.activeTextEditor;
    if ( !editor ) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: ``,
      prompt: `Input Insert/Delete String`,
      value: vscode.workspace.getConfiguration(`InsertStringEachLine`).get(`insertString`),
    }).then(inputInsertString => {
      if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage( `No editor is active` );
        return;
      }
      editor.edit(ed => {

        const editorSelectionsLoop = (func) => {
          editor.selections.forEach(select => {
            const range = new vscode.Range(
              select.start.line, 0, select.end.line, select.end.character
            );
            const text = editor.document.getText(range);
            func(range, text);
          });
        }

        const editorSelectionsLoopUnsupportTab = (func) => {
          let includeTabFlag = false;
          editor.selections.forEach(select => {
            const range = new vscode.Range(
              select.start.line, 0, select.end.line, select.end.character
            );
            const text = editor.document.getText(range);
            if (text.includes(`\t`)) {
              includeTabFlag = true
            }
            func(range, text);
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

        const textLoopAllLines = (text, func, linesFunc = () => {}) => {
          const lines = text.split(`\n`);
          const linesFuncResult = linesFunc(lines);
          for (let i = 0; i < lines.length; i += 1) {
            func(lines, i, linesFuncResult);
          };
          return lines.join('\n');
        }

        const textLoopOnlyTextLines = (text, func, linesFunc = () => {}) => {
          const lines = text.split(`\n`);
          const linesFuncResult = linesFunc(lines);
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].trim() === '') { continue; }
            func(lines, i, linesFuncResult);
          };
          return lines.join('\n');
        }

        const textLoopOnlyMinIndent = (text, func) => {
          const lines = text.split(`\n`);
          const minIndent = getMinIndent(lines);
          for (let i = 0; i < lines.length; i += 1) {
            if (lines[i].trim() === '') { continue; }
            const indent = getIndent(lines[i]);
            if (indent !== minIndent) { continue; }
            func(lines, i, indent);
          };
          return lines.join('\n');
        }

        switch (commandName) {

          case `InsertBeginLineAllLines`:
            editorSelectionsLoop((range, text) => {
              text = textLoopAllLines(text, (lines, i) => {
                lines[i] = inputInsertString + lines[i];
              })
              ed.replace(range, text);
            })
            break;

          case `InsertBeginLineOnlyTextLines`:
            editorSelectionsLoop((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                lines[i] = inputInsertString + lines[i];
              })
              ed.replace(range, text);
            })
            break;

          case `InsertBeginLineOnlyMinIndent`:
            editorSelectionsLoop((range, text) => {
              text = textLoopOnlyMinIndent(text, (lines, i) => {
                lines[i] = inputInsertString + lines[i];
              })
              ed.replace(range, text);
            })
            break;

          case `InsertBeginTextAllLines`:
            editorSelectionsLoop((range, text) => {
              text = textLoopAllLines(text, (lines, i) => {
                lines[i] = _insert(
                  lines[i], inputInsertString,
                  getIndent(lines[i]),
                );
              })
              ed.replace(range, text);
            })
            break;

          case `InsertBeginTextOnlyTextLines`:
            editorSelectionsLoop((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                lines[i] = _insert(
                  lines[i], inputInsertString,
                  getIndent(lines[i]),
                );
              })
              ed.replace(range, text);
            })
            break;

          case `InsertBeginTextOnlyMinIndent`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopOnlyMinIndent(text, (lines, i, indent) => {
                lines[i] = _insert(
                  lines[i], inputInsertString,
                  indent,
                );
              })
              ed.replace(range, text);
            })
            break;

          case `InsertMinIndentAllLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopAllLines(text, (lines, i, minIndent) => {
                if (lines[i].trim() === '') {
                  lines[i] = ' '.repeat(minIndent) + inputInsertString;
                  return;
                }
                lines[i] = _insert(lines[i], inputInsertString, minIndent)
              }, getMinIndent)
              ed.replace(range, text);
            })
            break;

          case `InsertMinIndentOnlyTextLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i, minIndent) => {
                lines[i] = _insert(lines[i], inputInsertString, minIndent)
              })
              ed.replace(range, text);
            }, getMinIndent)
            break;

          case `InsertEndLineAllLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopAllLines(text, (lines, i) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + inputInsertString + lastLineBreak;
              })
              ed.replace(range, text);
            })
            break;

          case `InsertEndLineOnlyTextLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + inputInsertString + lastLineBreak;
              })
              ed.replace(range, text);
            })
            break;

          case `InsertMaxLengthAllLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopAllLines(text, (lines, i, maxLength) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + ' '.repeat(maxLength - textLength(trimLine))
                  + inputInsertString + lastLineBreak;
              }, getMaxLength)
              ed.replace(range, text);
            })
            break;

          case `InsertMaxLengthOnlyTextLines`:
            editorSelectionsLoopUnsupportTab((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i, maxLength) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], ['\r']);
                lines[i] = trimLine
                  + ' '.repeat(maxLength - textLength(trimLine))
                  + inputInsertString + lastLineBreak;
              }, getMaxLength)
              ed.replace(range, text);
            })
            break;

          case `DeleteBeginText`:
            editorSelectionsLoop((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                const trimLine = _trimFirst(lines[i], [' ', '\t']);
                const trimFirstInput = _trimFirst(inputInsertString, [' ']);
                if (_isFirst(trimLine, trimFirstInput)) {
                  lines[i] = lines[i].replace(inputInsertString, '');
                }
              })
              ed.replace(range, text);
            })
            break;

          case `DeleteEndText`:
            editorSelectionsLoop((range, text) => {
              text = textLoopOnlyTextLines(text, (lines, i) => {
                const lastLineBreak = _isLast(lines[i], '\r') ? '\r' : '';
                const trimLine = _trimLast(lines[i], [' ', '\t', '\r']);
                const trimLastInput = _trimLast(inputInsertString, [' ']);
                if (_isLast(trimLine, trimLastInput)) {
                  lines[i] = _trimLast(_deleteLast(trimLine, trimLastInput.length), [' ', '\t']) + lastLineBreak;
                }
              })
              ed.replace(range, text);
            })
            break;

          default:
            new Error(`insertLineHeadMain`);
        }
      } );
    } );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertBeginLineAllLines`, () => {
      extensionMain(`InsertBeginLineAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertBeginLineOnlyTextLines`, () => {
      extensionMain(`InsertBeginLineOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertBeginLineOnlyMinIndent`, () => {
      extensionMain(`InsertBeginLineOnlyMinIndent`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertBeginTextAllLines`, () => {
      extensionMain(`InsertBeginTextAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertBeginTextOnlyTextLines`, () => {
      extensionMain(`InsertBeginTextOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertBeginTextOnlyMinIndent`, () => {
      extensionMain(`InsertBeginTextOnlyMinIndent`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertMinIndentAllLines`, () => {
      extensionMain(`InsertMinIndentAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertMinIndentOnlyTextLines`, () => {
      extensionMain(`InsertMinIndentOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertEndLineAllLines`, () => {
      extensionMain(`InsertEndLineAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertEndLineOnlyTextLines`, () => {
      extensionMain(`InsertEndLineOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertMaxLengthAllLines`, () => {
      extensionMain(`InsertMaxLengthAllLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.InsertMaxLengthOnlyTextLines`, () => {
      extensionMain(`InsertMaxLengthOnlyTextLines`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.DeleteBeginText`, () => {
      extensionMain(`DeleteBeginText`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `InsertStringEachLine.DeleteEndText`, () => {
      extensionMain(`DeleteEndText`);
    })
  );

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
