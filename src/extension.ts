import * as vscode from 'vscode';
import { AddProjectReference } from './context-menu';

export function activate(context: vscode.ExtensionContext) {
	const addReferenceProject = vscode.commands.registerCommand(
		"code-generator.AddReferenceProject",
		async (uri: vscode.Uri) => {
			AddProjectReference(uri);
		}
	);

	context.subscriptions.push(addReferenceProject);
}

export function deactivate() { }