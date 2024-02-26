/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-env browser */
/* global acquireVsCodeApi, WS_URL */

// This script will be run within the webview itself

(function () {
  const vscode = acquireVsCodeApi();
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "update-url": {
        updateUrl(message.url);
        break;
      }
    }
  });

  function updateUrl(url) {
    const input = document.body.querySelector("input");
    if (input) {
      input.value = url;
    }
  }

  const refreshButton = document.body.querySelector("#refresh");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      vscode.postMessage({
        command: "refresh",
      });
    });
  }

  const openBrowserButton = document.body.querySelector("#open-browser");
  if (openBrowserButton) {
    openBrowserButton.addEventListener("click", () => {
      vscode.postMessage({
        command: "open-browser",
      });
    });
  }

  const openDevToolsButton = document.body.querySelector("#open-devtools");
  if (openDevToolsButton) {
    openDevToolsButton.addEventListener("click", () => {
      vscode.postMessage({
        command: "open-devtools",
      });
    });
  }
})();
