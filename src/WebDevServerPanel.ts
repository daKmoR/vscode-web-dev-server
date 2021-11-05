import * as vscode from "vscode";

/**
 * Manages cat coding webview panels
 */
export class WebDevServerPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: WebDevServerPanel | undefined;

  public static readonly viewType = "webDevServer";

  private _panel: vscode.WebviewPanel;
  private _extensionUri: vscode.Uri;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();
  }

  private async _update() {
    this._panel.title = "Web Dev Server";
    const uri = "http://localhost:3000";

    const dynamicWebServerPort = 3000;
    const fullWebServerUri = await vscode.env.asExternalUri(
      vscode.Uri.parse(`http://localhost:${dynamicWebServerPort}`)
    );

    const cspSource = this._panel.webview.cspSource;

    this._panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Preview</title>
          <style>iframe { position: absolute; right: 0; bottom: 0; left: 0; top: 200px; border: 0; background-color: white } </style>
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${cspSource} https:; script-src ${cspSource}; style-src ${cspSource};"
          />
      </head>
      <body>
      <p>${fullWebServerUri}</p>
      <p>${cspSource}</p>
        <iframe src="${fullWebServerUri}" frameBorder="0" width="100%" height="100%" />
      </body>
      </html>
    `;
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (WebDevServerPanel.currentPanel) {
      WebDevServerPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      WebDevServerPanel.viewType,
      "Cat Coding",
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    WebDevServerPanel.currentPanel = new WebDevServerPanel(panel, extensionUri);
  }
}
