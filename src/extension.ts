import * as vscode from 'vscode';
import { FolderReveal } from './revealer';

export function activate(context: vscode.ExtensionContext) {
	
	{
		const disposable = vscode.commands.registerCommand('finder.reveal', () => {
			const picker = vscode.window.createQuickPick();
			picker.onDidChangeValue((input: string) => {
				const info = FolderReveal.findFiles(input);

				if (info.base && info.base !== info.matched[0]) {
					info.matched.push(info.base);
				}

				picker.items = info?.matched?.map(file => ({
					label: file
				}));
			});
			picker.onDidAccept(() => {
				const selected = picker.selectedItems[0];
				if (selected.label === picker.value) {
					const uri = FolderReveal.toUri(picker.value);
					if (uri) {
						vscode.commands.executeCommand("revealInExplorer", uri);
						try {
							vscode.workspace.openTextDocument(uri).then(doc => {
								vscode.window.showTextDocument(doc);
							});
						} catch { }
					}
					picker.hide();
				} else {
					picker.value = selected.label;
				}
			});
			picker.value = FolderReveal.pwd() || "";
			picker.show();

		});
		context.subscriptions.push(disposable);
	}


}

export function deactivate() {}
