import * as vscode from "vscode";
import * as path from "path";

import { startDevServer } from "@web/dev-server";
import { PreviewViewProvider } from "./WebDevServerPanel";

export async function activate(context: vscode.ExtensionContext) {
  const rootDir = vscode?.workspace?.workspaceFolders?.[0]?.uri?.fsPath || "";

  if (!rootDir) {
    vscode.window.showErrorMessage(
      `VS Code Web Dev Server only works with a single workspace`
    );
  }

  const devServer = await startDevServer({
    config: {
      rootDir,
      watch: true,
      nodeResolve: true,
    },
  });
  const url = `http://localhost:${devServer.config.port}`;
  const preview = new PreviewViewProvider(context.extensionUri, url);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PreviewViewProvider.viewType,
      preview
    )
  );

  vscode.window.onDidChangeActiveTextEditor((ev) => {
    const fsPath = ev?.document?.uri?.fsPath || "";
    if (fsPath.endsWith(".html") && fsPath.startsWith(rootDir)) {
      const newPathname = path.relative(rootDir, fsPath);
      // vscode.window.showInformationMessage(`changed to 👋! ${newPathname}`);
      devServer.webSockets?.sendImport(
        `data:text/javascript,window.location.pathname='${newPathname}';`
      );
      preview.url = `${url}/${newPathname}`;
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
