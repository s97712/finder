import * as vscode from 'vscode';
import { Quicklist } from './revealer';

export function activate(context: vscode.ExtensionContext) {
	
	const disposable = vscode.commands.registerCommand('finder.reveal', () => {
		Quicklist.open();
	});


	context.subscriptions.push(disposable);

}

export function deactivate() {}
