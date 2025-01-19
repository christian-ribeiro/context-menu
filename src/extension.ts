import * as vscode from 'vscode';
import { AddProjectReference } from './context-menu/add-reference/project';
import { AddDllReference } from './context-menu/add-reference/dll';

export function activate(context: vscode.ExtensionContext) {
	const addProjectReference = vscode.commands.registerCommand(
		"context-menu.AddProjectReference",
		async (uri: vscode.Uri) => { AddProjectReference(uri) }
	);

	const addDllReference = vscode.commands.registerCommand(
		"context-menu.AddDllReference",
		(uri: vscode.Uri) => { AddDllReference(uri) }
	);

	context.subscriptions.push(addProjectReference);
	context.subscriptions.push(addDllReference);
}

export function deactivate() { }