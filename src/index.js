const vscode = require("vscode");
const { DataProvider } = require("./dataProvider");
const { GithubIntegration } = require("./githubIntegration");
const { checkAndShowWeeklyNotification } = require("./utils");
const { CHECK_NOTIFICATION_FREQUENCY } = require("./constants");
/**
 * @param {vscode.ExtensionContext} context
 *
 */

async function activate(context) {
  try {
    const dataProvider = new DataProvider();
    let isSaveProcessStarted = false;
    const githubProvider = new GithubIntegration(context);

    checkAndShowWeeklyNotification(context);
    setInterval(async () => {
      checkAndShowWeeklyNotification(context);
    }, CHECK_NOTIFICATION_FREQUENCY);

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "devtrackr.refreshEntry",
        async function () {
          dataProvider.refresh();
          vscode.commands.executeCommand("workbench.action.reloadExtension");
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "devtrackr.deleteProject",
        async ({ label }) => {
          await dataProvider.deleteProject(label);
        }
      )
    );

    vscode.commands.registerCommand("devtrackr.save", async () => {
      try {
        let isAuthenticated = await githubProvider.authenticate();

        if (!Object.keys(dataProvider.projects).length) {
          return vscode.window.showInformationMessage(
            `Please add project then click on save button`
          );
        }
  
        if (!(isAuthenticated)) {
          return vscode.window.showErrorMessage(
            `GitHub authentication required to save projects`
          );
        }
  
        if(isSaveProcessStarted){
          return vscode.window.showInformationMessage("Process is already started. please wait !!")
        }

        isSaveProcessStarted = true;
  
        await githubProvider.processProjects(dataProvider);
        isSaveProcessStarted = false;
      }catch(e){
        isSaveProcessStarted = false;
      }
      
    });

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "devtrackr.addProject",
        async function () {
          const fileName = await vscode.window.showInputBox({
            prompt: "Enter project name",
          });

          if (!fileName?.trim()) {
            return;
          }

          await dataProvider.addProject(fileName?.trim());
        }
      )
    );

    const treeview = vscode.window.createTreeView("devtrackr", {
      treeDataProvider: dataProvider,
    });

    vscode.commands.registerCommand("devtrackr.open", (dependency) => {
      dataProvider.openProject(dependency.project);
    });

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "devtrackr.storeGithubToken",
        async () => {
          try {
            const isAuthenticated = await githubProvider.authenticate();

            if(!isAuthenticated){
              return vscode.window.showErrorMessage(
                `GitHub authentication required to save projects`
              );
            }else {
              return vscode.window.showInformationMessage("You already authenticated")
            } 

          }catch(err){
            return 
          }
        }
      )
    );

    context.subscriptions.push(treeview);
  } catch (e) {}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
