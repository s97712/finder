import * as vscode from 'vscode';
import { Finder } from './revealer';

export function activate(context: vscode.ExtensionContext) {
	

	const disposable = vscode.commands.registerCommand('finder.reveal', () => {
		Finder.open()
	});


	context.subscriptions.push(disposable);
	//context.subscriptions.push(picker)

}

export function deactivate() {}
