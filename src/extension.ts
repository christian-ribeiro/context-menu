import * as vscode from 'vscode';
import { AddProjectReference } from './context-menu/add-reference/project';

export function activate(context: vscode.ExtensionContext) {
	const addProjectReference = vscode.commands.registerCommand(
		"context-menu.AddProjectReference",
		async (uri: vscode.Uri) => {
			AddProjectReference(uri);
		}
	);

	context.subscriptions.push(addProjectReference);
}

export function deactivate() { }