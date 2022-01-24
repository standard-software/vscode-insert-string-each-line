# VSCode extension - Insert String Each Line (deprecated)

[![Version][version-badge]][marketplace]
[![Ratings][ratings-badge]][marketplace-ratings]
[![Installs][installs-badge]][marketplace]
[![License][license-badge]][license]

This extension inserts or removes strings at the beginning of a line, at the beginning of a line string, at the end of a line string.

## Information

This extension is deprecated.

Please use the following extension. It is upward compatible and has more features.

- vscode-begin-of-line  
https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-begin-of-line  
Begin of Line | Input

- vscode-end-of-line  
https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-end-of-line  
End of Line | Input

## Install

Search for "Insert String Each Line" in the Marketplace  
https://marketplace.visualstudio.com/vscode

or here  
https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-insert-string-each-line

## Usage

Processing is performed according to the following command for each line in the selected range.
Enter the character string after selecting the command.

Following commands are available:

- `Insert String Each Line : Begin Line : All Lines`
- `Insert String Each Line : Begin Line : Only Text Lines`
- `Insert String Each Line : Begin Line : Only Min Indent Text Lines`
- `Insert String Each Line : Begin Text : All Lines`
- `Insert String Each Line : Begin Text : Only Text Lines`
- `Insert String Each Line : Begin Text : Only Min Indent Text Lines`
- `Insert String Each Line : Min Indent : All Lines`
- `Insert String Each Line : Min Indent : Only Text Lines`
- `Insert String Each Line : End Line : All Lines`
- `Insert String Each Line : End Line : Only Text Lines`
- `Insert String Each Line : Max Line Length : All Lines`
- `Insert String Each Line : Max Line Length : Only Text Lines`
- `Insert String Each Line : Delete String Begin of Text`
- `Insert String Each Line : Delete String End of Text`

Begin Line = Beginning of line.(line[0])  
Begin Text = The beginning of the text on each line.  
Min Indent = Minimum indentation position in the selection.  
End Line = End of line.
Max Line Length = End of line at maximum length of selection.  

## License

Released under the [MIT License][license].

[version-badge]: https://vsmarketplacebadge.apphb.com/version/SatoshiYamamoto.vscode-insert-string-each-line.svg
[ratings-badge]: https://vsmarketplacebadge.apphb.com/rating/SatoshiYamamoto.vscode-insert-string-each-line.svg
[installs-badge]: https://vsmarketplacebadge.apphb.com/installs/SatoshiYamamoto.vscode-insert-string-each-line.svg
[license-badge]: https://img.shields.io/github/license/standard-software/vscode-insert-string-each-line.svg

[marketplace]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-insert-string-each-line
[marketplace-ratings]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-insert-string-each-line#review-details
[license]: https://github.com/standard-software/vscode-insert-string-each-line/blob/master/LICENSE

## Version

### 1.3.2
2022/01/24(Mon)
- update (deprecated)

### 1.3.1
2021/11/15(Mon)
- bug fix menu select insert undefined

### 1.3.0
2021/10/06(Wed)
- Refactoring Divide into modules

### 1.2.0
2021/10/03(Sun)
- Readme
- Add InsertEndLineAllLines
- Add InsertEndLineOnlyTextLines

### 1.1.1
2021/10/02(Sat)
- Refactoring

### 1.1.0
2021/10/02(Sat)
- support Japanese Charactor

### 1.0.0
2021/10/02(Sat)
- publish

### 0.2.0
2021/10/02(Sat)

- Add DeleteEndText
- Add InsertMaxLengthAllLines
- Add InsertMaxLengthOnlyTextLines

### 0.1.1
2021/10/02(Sat)

- Add InsertBeginTextAllLines

### 0.1.0
2021/10/02(Sat)

Initial release of vscode-insert-string-each-line

- InsertBeginLineAllLines",
- InsertBeginLineOnlyTextLines",
- InsertBeginLineOnlyMinIndent",
- InsertBeginTextOnlyTextLines",
- InsertBeginTextOnlyMinIndent",
- InsertMinIndentAllLines",
- InsertMinIndentOnlyTextLines",
- DeleteBeginText"

### beta
2021/09/20
- Min Indent Position
- Delete String

2021/09/18
- Begin of Text

2021/09/16
- Begin of Line

