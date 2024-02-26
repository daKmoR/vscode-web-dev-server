import * as vscode from "vscode";
import { getNonce } from "./getNonce";

function html(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] || "");
  }, "");
}

export class PreviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "webDevServer.previewView";

  private _view?: vscode.WebviewView;
  private _url: string = "http://localhost:3000/";

  constructor(private readonly _extensionUri: vscode.Uri, url: string) {
    this._url = url;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "refresh":
          console.log("refreshing");
          vscode.window.showInformationMessage(`refreshing`);
          this._update();
          return;
        case "open-browser":
          vscode.env.openExternal(vscode.Uri.parse(this._url));
          return;
        case "open-devtools":
          vscode.commands.executeCommand(
            "workbench.action.webview.openDeveloperTools"
          );
      }
    });

    this._update();
  }

  public set url(url: string) {
    if (!this._view) {
      return;
    }
    this._view.webview.postMessage({ type: "update-url", url });
  }

  private async _update() {
    if (!this._view) {
      return;
    }
    const fullWebServerUri = await vscode.env.asExternalUri(
      vscode.Uri.parse(this._url)
    );

    const cspSource = this._view.webview.cspSource;
    const scriptUri = this._view.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );
    const styleUri = this._view.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
    );
    const codiconsUri = this._view.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );
    const nonce = getNonce();

    this._view.webview.html = html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Web Dev Server Preview</title>
          <link href="${styleUri}" rel="stylesheet" />
          <link href="${codiconsUri}" rel="stylesheet" />
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${cspSource} https:; script-src ${cspSource} 'nonce-${nonce}'; style-src ${cspSource}; font-src ${cspSource};"
          />
        </head>
        <body>
          <div id="header">
            <button id="refresh" title="Refresh">
              <i class="codicon codicon-refresh"></i>
            </button>
            <input type="text" readonly value="${this._url}" />
            <button id="open-browser" title="Open in external Browser">
              <i class="codicon codicon-browser"></i>
            </button>
            <button id="open-devtools" title="Open Dev Tools">
              <i class="codicon codicon-terminal"></i>
            </button>
          </div>
          <script nonce="${nonce}" src="${scriptUri}"></script>
          <iframe
            src="${fullWebServerUri}"
            frameborder="0"
            width="100%"
            height="100%"
          ></iframe>
        </body>
      </html>
    `;
  }
}
