import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function findCsprojFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const csprojFiles = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return await findCsprojFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".csproj")) {
            return [fullPath];
        } else {
            return [];
        }
    }));
    return csprojFiles.flat();
}

function addProjectReference(command: string, cwd: string): Promise<void> {
    return execAsync(command, { cwd }).then(({ stderr }) => {
        if (stderr) {
            return Promise.reject(new Error(stderr));
        }
    });
}

async function AddProjectReference(uri: vscode.Uri) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
    }

    const solutionDir = workspaceFolders[0].uri.fsPath;
    const csprojFiles = await findCsprojFiles(solutionDir);

    if (csprojFiles.length === 0) {
        vscode.window.showErrorMessage("No .csproj files found in the workspace.");
        return;
    }

    const currentCsprojPath = uri.fsPath;
    const filteredCsprojFiles = csprojFiles.filter(file => file !== currentCsprojPath);

    const selectedProjects = await vscode.window.showQuickPick(
        filteredCsprojFiles.map(file => path.relative(solutionDir, file)),
        {
            canPickMany: true,
            placeHolder: "Select one or more projects to add as reference"
        }
    );

    if (selectedProjects && selectedProjects.length > 0) {
        const cwd = path.dirname(currentCsprojPath);
        
        selectedProjects.reduce((promiseChain, selectedProject) => {
            const relativeProjectPath = path.join(solutionDir, selectedProject);
            const command = `dotnet add "${currentCsprojPath}" reference "${relativeProjectPath}"`;

            return promiseChain
                .then(() => addProjectReference(command, cwd))
                .then(() => {
                    vscode.window.showInformationMessage(
                        `Reference added successfully from ${relativeProjectPath} to ${currentCsprojPath}`
                    );
                })
                .catch(error => {
                    vscode.window.showErrorMessage(`Error adding reference: ${error.message}`);
                });
        }, Promise.resolve());
    }
}

export { AddProjectReference };
