const vscode = require("vscode");

/**
 *
 * @param {string} name
 * @param { (...args: any[]) => any} callBack
 */
function registerCommand(name, callBack) {
  try {
    return vscode.commands.registerCommand(name, callBack);
  } catch (error) {
    vscode.window.showErrorMessage(`Registering command failed!!`, error);
  }
}

/**
 *
 * @param {string} name
 */
function executeCommand(name) {
  try {
    return vscode.commands.executeCommand(name);
  } catch (error) {
    vscode.window.showErrorMessage(`Executing command failed!!`, error);
  }
}

function refreshEntry(dataProvider) {
  try {
    return registerCommand("devtrackr.refreshEntry", async function () {
      dataProvider.refresh();
      executeCommand("workbench.action.reloadExtension");
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Reloading extension failed!!`, error);
  }
}

function deleteProject(dataProvider) {
  try {
    return registerCommand("devtrackr.deleteProject", async ({ label }) => {
      await dataProvider.deleteProject(label);
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Deleting project failed!!`, error);
  }
}

function saveProject(dataProvider, githubProvider) {
  try {
    return registerCommand("devtrackr.save", async () => {
      await githubProvider.setCredentials();

      if (!Object.keys(dataProvider.projects).length) {
        return vscode.window.showInformationMessage(
          `Please add project then click on save button`
        );
      }

      if (!(await githubProvider.getSecrets())) {
        return vscode.window.showErrorMessage(
          `Please set your GitHub personal access token and username by clicking on "Github Config" Button`
        );
      }

      await githubProvider.processProjects(dataProvider);
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Saving project failed!!`, error);
  }
}

function addProject(dataProvider) {
  try {
    return registerCommand("devtrackr.addProject", async function () {
      const folderName = await vscode.window.showInputBox({
        prompt: "Enter project name",
      });

      if (!folderName) {
        return;
      }

      await dataProvider.addProject(folderName);
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Adding project failed!!`, error);
  }
}

function openProject(dataProvider) {
  try {
    return registerCommand("devtrackr.open", (dependency) => {
      dataProvider.openProject(dependency.project);
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Opening project failed!!`, error);
  }
}

function storeGithubToken(githubProvider) {
  try {
    return registerCommand("devtrackr.storeGithubToken", async () => {
      const token = await vscode.window.showInputBox({
        prompt: "Enter your GitHub personal access token",
        password: true,
      });

      const username = await vscode.window.showInputBox({
        prompt: "Enter your username",
      });

      if (username && token) {
        await githubProvider.setSecrets(username, token);
      } else {
        vscode.window.showInformationMessage(
          `Please don't leave it github username or token empty`
        );
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Storing github token failed!!`, error);
  }
}

module.exports = {
  registerCommand,
  executeCommand,
  refreshEntry,
  deleteProject,
  saveProject,
  addProject,
  openProject,
  storeGithubToken,
};
