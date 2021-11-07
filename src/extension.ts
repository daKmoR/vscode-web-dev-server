// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";

import { startDevServer } from "@web/dev-server";
import { PreviewViewProvider } from "./WebDevServerPanel";

export async function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "helloworld.helloWorld",
    () => {
      vscode.window.showInformationMessage(`Howdy2 👋!`);
    }
  );

  const rootDir = vscode?.workspace?.workspaceFolders?.[0]?.uri?.fsPath || "";
  const devServer = await startDevServer({
    config: {
      rootDir,
      port: 3000,
      watch: true,
    },
  });

  const preview = new PreviewViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PreviewViewProvider.viewType,
      preview
    )
  );

  vscode.window.onDidChangeActiveTextEditor((ev) => {
    const fsPath = ev?.document?.uri?.fsPath || "";
    if (fsPath.endsWith('.html') && fsPath.startsWith(rootDir)) {
      const newUrl = path.relative(rootDir, fsPath);
      vscode.window.showInformationMessage(`changed to 👋! ${newUrl}`);
      devServer.webSockets.sendImport(
        `data:text/javascript,window.location.pathname='${newUrl}';`
      );
      preview.url = `http://localhost:3000/${newUrl}`;
    }
  });

  // context.subscriptions.push(
  //   vscode.commands.registerCommand("helloworld.start", () => {

  //     WebDevServerPanel.createOrShow(context.extensionUri);
  //   })
  // );

  // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
