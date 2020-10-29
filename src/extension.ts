// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	var os = require('os'), pathDelimiter: string;
	if (os.platform() === "win32") {
		pathDelimiter = "\\";
	} else {
		pathDelimiter = "/";
	}


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cfml-open-path.openpath', () => {
		// The code you place here will be executed every time your command is executed
		//  Get current line content in vscode extension 
		var currentLineText = vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor?.selection.active.line).text;
		if (typeof currentLineText === "undefined") {
			currentLineText = "";
		}
		var currentFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
		if (typeof currentFilePath === "undefined") {
			currentFilePath = "";
		}

		if (currentLineText === "") {
			vscode.window.showErrorMessage("Error: current line is empty");
		} else if (currentFilePath === "") {
			vscode.window.showErrorMessage("Error: current filePath is unknown");
		} else {
			var currentLineTextMatches = currentLineText.match(/\"[\w|\/.|\-]+\"/);
			if (currentLineTextMatches !== null && currentLineTextMatches.length >= 1) {
				var filepathToOpen = "";

				var currentLineTextMatch = currentLineTextMatches[0].replace('"', '').replace('"', '');
				var currentLineTextMatchSplit = currentLineTextMatch.split("/");

				var goUpCount = 0;
				var afterPath = "";
				if (currentLineTextMatchSplit.length > 0) {
					currentLineTextMatchSplit.forEach(element => {
						if(element === "..") {
							goUpCount++;
						} else {
							afterPath += pathDelimiter + element;
						}
					});
				}

				var currentFilePathArray = currentFilePath.split(pathDelimiter);
				currentFilePath = "";
				var bool = false;
				for (let i = 0; i < currentFilePathArray.length - 1 - goUpCount; i++) {
					if (bool) {
						currentFilePath += pathDelimiter;
					} else {
						bool = true;
					}
					currentFilePath += currentFilePathArray[i];
				}

				filepathToOpen = currentFilePath + afterPath;
				
				vscode.workspace
					.openTextDocument(filepathToOpen)
					.then(document => {
                            vscode.window.showTextDocument(document);
                        }, (err) => {
                            vscode.window.showErrorMessage("Error: cannot open: " + filepathToOpen);
                            console.error(err);
                        }
                    );
			} else {
                vscode.window.showErrorMessage("Error: could not parse path from current line");
            }
		}
		// Display a message box to the user

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
