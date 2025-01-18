import * as path from "path";
import * as vscode from "vscode";

import { exec } from "child_process";

async function AddProjectReference(uri: vscode.Uri) {
    const projectUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { "C# Project Files": ["csproj"] },
        openLabel: "Selecione um projeto",
    });

    if (projectUris && projectUris.length > 0) {
        const selectedProject = projectUris[0].fsPath;
        const csprojPath = uri.fsPath;
        const relativeProjectPath = path.relative(
            path.dirname(csprojPath),
            selectedProject
        );
        const cwd = path.dirname(csprojPath);
        const command = `dotnet add "${csprojPath}" reference "${relativeProjectPath}"`;

        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(
                    `Erro ao adicionar referência: ${error.message}`
                );
                return;
            }
            if (stderr) {
                vscode.window.showErrorMessage(
                    `Erro ao adicionar referência: ${stderr}`
                );
                return;
            }
            vscode.window.showInformationMessage(
                `Referência adicionada com sucesso ao ${csprojPath}`
            );
        });
    }
}

export { AddProjectReference };