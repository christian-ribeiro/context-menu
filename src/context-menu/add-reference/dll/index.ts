import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

async function AddDllReference(uri: vscode.Uri) {
    const dllUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { "DLL Files": ["dll"] },
        openLabel: "Selecione um ou mais arquivos DLL",
        canSelectMany: true,
      });
    if (dllUris && dllUris.length > 0) {
        const csprojPath = uri.fsPath;
        const cwd = path.dirname(csprojPath);

        fs.readFile(csprojPath, "utf8", (err, data) => {
          if (err) {
            vscode.window.showErrorMessage(
              `Erro ao ler o arquivo .csproj: ${err.message}`
            );
            return;
          }

          let updatedData = data;

          dllUris.forEach((dllUri) => {
            const selectedDll = dllUri.fsPath;
            const relativeDllPath = path.relative(cwd, selectedDll);

            if (data.includes(relativeDllPath)) {
              vscode.window.showInformationMessage(
                `A referência ${relativeDllPath} já foi adicionada ao ${csprojPath}`
              );
              return;
            }

            const dllItemGroupMatch = updatedData.match(
              /<ItemGroup>([\s\S]*?)<\/ItemGroup>/g
            );

            if (dllItemGroupMatch) {
              const dllItemGroup = dllItemGroupMatch.find((itemGroup) =>
                itemGroup.includes("<Reference")
              );
              if (dllItemGroup) {
                const referenceXml = `
		  <Reference Include="${path.basename(selectedDll)}">
			<HintPath>${relativeDllPath}</HintPath>
		  </Reference>`;

                updatedData = updatedData.replace(
                  dllItemGroup,
                  `${dllItemGroup.replace(
                    "</ItemGroup>",
                    `${referenceXml}\n  </ItemGroup>`
                  )}`
                );
              }
            }

            if (
              !updatedData.includes(
                '<Reference Include="' + path.basename(selectedDll) + '"'
              )
            ) {
              const referenceXml = `
	<ItemGroup>
	  <Reference Include="${path.basename(selectedDll)}">
		<HintPath>${relativeDllPath}</HintPath>
	  </Reference>
	</ItemGroup>`;

              updatedData = updatedData.replace(
                "</Project>",
                `${referenceXml}\n</Project>`
              );
            }
          });

          fs.writeFile(csprojPath, updatedData, "utf8", (err) => {
            if (err) {
              vscode.window.showErrorMessage(
                `Erro ao atualizar o .csproj: ${err.message}`
              );
              return;
            }

            vscode.window.showInformationMessage(
              `Referências DLL adicionadas com sucesso ao ${csprojPath}`
            );
          });
        });
      }
}

export {AddDllReference};