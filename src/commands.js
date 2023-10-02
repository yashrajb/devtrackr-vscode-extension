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
    console.error(error);
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
    console.error(error);
  }
}

function refreshEntry(dataProvider) {
  return registerCommand("devtrackr.refreshEntry", async function () {
    dataProvider.refresh();
    executeCommand("workbench.action.reloadExtension");
  });
}

function deleteProject(dataProvider) {
  return registerCommand("devtrackr.deleteProject", async ({ label }) => {
    await dataProvider.deleteProject(label);
  });
}

function saveProject(dataProvider, githubProvider) {
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
}

function addProject(dataProvider) {
  return registerCommand("devtrackr.addProject", async function () {
    const folderName = await vscode.window.showInputBox({
      prompt: "Enter project name",
    });

    if (!folderName) {
      return;
    }

    await dataProvider.addProject(folderName);
  });
}

function openProject(dataProvider) {
  return registerCommand("devtrackr.open", (dependency) => {
    dataProvider.openProject(dependency.project);
  });
}

function storeGithubToken(githubProvider) {
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
