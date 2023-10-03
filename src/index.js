const vscode = require("vscode");
const { DataProvider } = require("./dataProvider");
const { GithubIntegration } = require("./githubIntegration");
const { checkAndShowWeeklyNotification } = require("./utils");
const { CHECK_NOTIFICATION_FREQUENCY } = require("./constants");
const {
  refreshEntry,
  deleteProject,
  saveProject,
  addProject,
  openProject,
  storeGithubToken,
} = require("./commands");

/**
 * @param {vscode.ExtensionContext} context
 *
 */
async function activate(context) {
  try {
    const dataProvider = new DataProvider();

    const githubProvider = new GithubIntegration(context);

    checkAndShowWeeklyNotification(context);
    setInterval(async () => {
      checkAndShowWeeklyNotification(context);
    }, CHECK_NOTIFICATION_FREQUENCY);

    context.subscriptions.push(refreshEntry(dataProvider));

    context.subscriptions.push(deleteProject(dataProvider));

    saveProject(dataProvider, githubProvider);

    context.subscriptions.push(addProject(dataProvider));

    const treeview = vscode.window.createTreeView("devtrackr", {
      treeDataProvider: dataProvider,
    });

    openProject(dataProvider);

    context.subscriptions.push(storeGithubToken(githubProvider));

    context.subscriptions.push(treeview);
  } catch (e) {}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
