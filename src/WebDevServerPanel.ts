import * as vscode from "vscode";

/**
 * Manages cat coding webview panels
 */
export class PreviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "webDevServer.previewView";

  private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._update(webviewView.webview);

		// webviewView.webview.onDidReceiveMessage(data => {
		// 	switch (data.type) {
		// 		case 'colorSelected':
		// 			{
		// 				vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
		// 				break;
		// 			}
		// 	}
		// });
	}  

  private _update(webview: vscode.Webview) {
    // this._panel.title = "Web Dev Server";
    const uri = "http://localhost:3000";

    const dynamicWebServerPort = 3000;
    // const fullWebServerUri = await vscode.env.asExternalUri(
    //   vscode.Uri.parse(`http://localhost:${dynamicWebServerPort}`)
    // );
    const fullWebServerUri = `http://localhost:${dynamicWebServerPort}`;

    const cspSource = webview.cspSource;

    return `
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

  // public static createOrShow(extensionUri: vscode.Uri) {
  //   const column = vscode.window.activeTextEditor
  //     ? vscode.window.activeTextEditor.viewColumn
  //     : undefined;

  //   // If we already have a panel, show it.
  //   if (WebDevServerPanel.currentPanel) {
  //     WebDevServerPanel.currentPanel._panel.reveal(column);
  //     return;
  //   }

  //   // Otherwise, create a new panel.
  //   const panel = vscode.window.createWebviewPanel(
  //     WebDevServerPanel.viewType,
  //     "Cat Coding",
  //     vscode.ViewColumn.Two,
  //     {
  //       enableScripts: true,
  //       retainContextWhenHidden: true,
  //     }
  //   );

  //   WebDevServerPanel.currentPanel = new WebDevServerPanel(panel, extensionUri);
  // }
}
