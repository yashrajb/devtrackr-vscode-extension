const vscode = require("vscode");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { OS_PATHS } = require("./constants");

class DataProvider {
  constructor() {
    this.dirPath = this.getDataFilePath();
    this.projects = this.getFilesFromDirectory() || {};
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getDataFilePath() {
    let platform = os.platform();

    if (OS_PATHS.hasOwnProperty(platform)) {
      let dir = OS_PATHS[platform];
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return dir;
    }

    return new Error("Unsupported operating system");
  }

  getFilesFromDirectory() {
    const files = fs.readdirSync(this.dirPath);
    const allFiles = {};
    files.forEach((file) => {
      const filePath = path.join(this.dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const { name } = path.parse(file);
        allFiles[name] = {
          path: filePath,
        };
      }
    });
    return allFiles;
  }

  async openProject(project) {
    const projectName = project.name;
    const pathFile = `${this.dirPath}/${projectName}.md`;

    // Check if the project file is already open in an editor
    const openEditor = vscode.window.visibleTextEditors.find(
      (editor) => editor.document.fileName === this.projects[projectName].path
    );

    if (openEditor) {
      // If the project file is already open, reveal the editor
      await vscode.window.showTextDocument(openEditor.document, {
        viewColumn: openEditor.viewColumn,
        preview: false,
      });
    } else {
      // If the project file is not open, open it in a new editor
      const document = await vscode.workspace.openTextDocument(
        vscode.Uri.file(pathFile)
      );

      await vscode.window.showTextDocument(document, {
        preview: false,
      });
    }

    this._onDidChangeTreeData.fire();
  }

  async addProject(name) {
    if (this.projects.hasOwnProperty(name)) {
      vscode.window.showInformationMessage(`
        ${name} project is already added.
      `);
      return;
    }

    const filePath = `${this.dirPath}/${name}.md`;
    fs.writeFileSync(filePath, "");

    this.projects[name] = {
      path: filePath,
    };

    this.refresh();
  }

  async deleteProject(name) {
    let filePath = `${this.dirPath}/${name}.md`;
    fs.unlinkSync(filePath);
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.fileName === filePath) {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    }
    delete this.projects[name];
    this.refresh();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (element) {
      return Promise.resolve([]);
    }

    const children = Object.entries(this.projects).map(([key, value]) => {
      return new Dependency(key, vscode.TreeItemCollapsibleState.None, {
        name: key,
        ...value,
      });
    });
    return Promise.resolve(children);
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

class Dependency extends vscode.TreeItem {
  constructor(label, collapsibleState, project) {
    super(label, collapsibleState);
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.tooltip = this.label;
    this.project = project;
    this.command = {
      title: "Open Project",
      command: "devtrackr.open",
      arguments: [this],
    };
  }

  contextValue = "dependency";
}

module.exports = {
  DataProvider,
  Dependency,
};
