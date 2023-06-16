const vscode = require("vscode");
const { Octokit } = require("@octokit/rest");
const { throttling } = require("@octokit/plugin-throttling");
const ThrottleOctokit = Octokit.plugin(throttling);
const {
  DEVTRACKR_GITHUB_TOKEN,
  DEVTRACKR_GITHUB_USERNAME,
  REPO_NAME,
} = require("./constants");
const fs = require("fs");
const { showStatusMessage } = require("./utils");

const commonGithubErrorMessage =
  "Please ensure that your GitHub credentials are correct, reconfigure them if necessary, check your internet connection, and try again";

class GithubIntegration {
  #username = "";
  #token = "";
  #octokit = {};

  constructor(context) {
    this.context = context;
    this.isProcessStarted = false;
  }

  async setCredentials() {
    this.#username = await this.context.secrets.get(DEVTRACKR_GITHUB_USERNAME);
    this.#token = await this.context.secrets.get(DEVTRACKR_GITHUB_TOKEN);
    this.#octokit = new ThrottleOctokit({
      auth: this.#token,
      throttle: {
        onRateLimit: (retryAfter, options) => {
          vscode.window.showErrorMessage(
            `GitHub rate limit exceeded. Please try again later.`
          );
          return;
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          vscode.window.showErrorMessage(
            `GitHub rate limit exceeded. Please try again later.`
          );
          return;
        },
      },
    });
  }
  async setSecrets(username, token) {
    await this.context.secrets.store(DEVTRACKR_GITHUB_TOKEN, token);
    await this.context.secrets.store(DEVTRACKR_GITHUB_USERNAME, username);
  }

  async getSecrets() {
    let username = await this.context.secrets.get(DEVTRACKR_GITHUB_USERNAME);
    let token = await this.context.secrets.get(DEVTRACKR_GITHUB_TOKEN);
    return username && token;
  }

  async checkRepo() {
    return new Promise(async (resolve) => {
      return await this.#octokit.rest.repos
        .get({
          owner: this.#username,
          repo: REPO_NAME,
        })
        .then((data) => {
          return resolve(data && data.status == 200 ? true : false);
        })
        .catch((error) => {
          const errorMessage = `An error occurred while checking the repository. ${commonGithubErrorMessage}`;
          vscode.window.showErrorMessage(errorMessage);
          // eslint-disable-next-line no-console
          console.error("Error in checkRepo", error);
          return resolve(false);
        });
    });
  }

  async createRepo() {
    return new Promise((resolve, reject) => {
      return this.#octokit.rest.repos
        .createForAuthenticatedUser({
          name: REPO_NAME,
          private: true,
        })
        .then(() => {
          vscode.window.showInformationMessage(
            `Private Repo with name ${REPO_NAME} is created in your github account`
          );
          resolve(true);
        })
        .catch((e) => {
          const errorMessage = `An error occurred while creating the repository.${commonGithubErrorMessage}`;
          vscode.window.showErrorMessage(errorMessage);
          // eslint-disable-next-line no-console
          console.error("Error in createRepo", e);
          return reject(e);
        });
    });
  }

  async getFileContent(filePath) {
    return new Promise((resolve) => {
      return this.#octokit
        .request("GET /repos/{owner}/{repo}/contents/{path}", {
          owner: this.#username,
          repo: REPO_NAME,
          path: filePath,
        })
        .then((response) => {
          const existingContent = Buffer.from(
            response.data.content || "",
            "base64"
          ).toString();
          return resolve({ ...response.data, existingContent });
        })
        .catch((err) => {
          const errorMessage = `An error occurred while fetching the file content.${commonGithubErrorMessage}`;
          vscode.window.showErrorMessage(errorMessage);
          // eslint-disable-next-line no-console
          console.error("Error in getFileContent", err);
          return resolve(false);
        });
    });
  }

  async checkFileExists(filePath) {
    return new Promise(async (resolve) => {
      this.#octokit
        .request("HEAD /repos/{owner}/{repo}/contents/{path}", {
          owner: this.#username,
          repo: REPO_NAME,
          path: filePath,
        })
        .then((response) => {
          return resolve(response.status === 200);
        })
        .catch((e) => {
          const errorMessage = `An error occurred while checking the file existence.${commonGithubErrorMessage}`;
          vscode.window.showErrorMessage(errorMessage);
          // eslint-disable-next-line no-console
          console.error("Error in checkFileExists", e);
          return resolve(false);
        });
    });
  }

  async createFile(filePath, content) {
    try {
      return await this.#octokit.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner: this.#username,
          repo: REPO_NAME,
          path: filePath,
          message: `Created new ${filePath} file`,
          content: Buffer.from(content).toString("base64"),
        }
      );
    } catch (error) {
      const errorMessage = `An error occurred while creating the file.${commonGithubErrorMessage}`;
      vscode.window.showErrorMessage(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error in createFile function", error);
      return null;
    }
  }

  async appendToFile(filePath, content) {
    try {
      const { sha } = await this.getFileContent(filePath);
      return await this.#octokit.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
          owner: this.#username,
          repo: REPO_NAME,
          path: filePath,
          message: `Append content to ${filePath} file`,
          content: Buffer.from(`${content}`).toString("base64"),
          sha,
        }
      );
    } catch (error) {
      const errorMessage = `An error occurred while appending content to the file.${commonGithubErrorMessage}`;
      vscode.window.showErrorMessage(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error in appendToFile function", error);
      return null;
    }
  }

  async processProjects(dataProviderInstance) {
    if (this.isProcessStarted) {
      return;
    }
    const projects = dataProviderInstance.projects;
    const projectChanged = dataProviderInstance.projectChanged;

    const statusMessage = showStatusMessage(
      "$(loading~spin) Please wait. Saving changes to your GitHub repository..."
    );
    let updatedFiles = {
      appended: [],
      created: [],
    };
    const repoUrl = `https://github.com/${this.#username}/${REPO_NAME}`;
    for (const project of Object.keys(projects)) {
      const projectName = `${project}.txt`;
      const filePath = `${dataProviderInstance.dirPath}/${projectName}`;
      if (projectChanged[projectName]) {
        const content = fs.readFileSync(filePath, "utf-8");
        const fileExists = await this.checkFileExists(projectName);

        if (fileExists) {
          const appendedFileRes = await this.appendToFile(projectName, content);

          if (appendedFileRes && appendedFileRes.data) {
            updatedFiles.appended.push(projectName);
          }
        }

        if (!fileExists) {
          const createdFileRes = await this.createFile(projectName, content);

          if (createdFileRes && createdFileRes.data) {
            updatedFiles.created.push(projectName);
          } else {
            vscode.window.showErrorMessage(
              `An error occurred while creating the file "${projectName}". ${commonGithubErrorMessage}`
            );
          }
        }
        dataProviderInstance.fileChanged(projectName);
      }
    }

    this.isProcessStarted = false;
    statusMessage.dispose();

    if (!updatedFiles.appended.length && !updatedFiles.created.length) {
      showStatusMessage("No changes to store in your GitHub repo", 1000);
      return;
    }
    if (updatedFiles.appended.length || updatedFiles.created.length) {
      let appendedFileMessage = updatedFiles.appended.length
        ? `File Updated:${updatedFiles.appended}\n\n`
        : "";
      let createdFileMessage = updatedFiles.created.length
        ? `File Created:${updatedFiles.created}`
        : "";
      vscode.window
        .showInformationMessage(
          `The process is complete. You can now check your repository.\n\n${appendedFileMessage}${createdFileMessage}`,
          "Open Repo"
        )
        .then((selectedOption) => {
          if (selectedOption) {
            vscode.env.openExternal(vscode.Uri.parse(repoUrl));
          }
        });
    }

    return;
  }
}

module.exports = {
  GithubIntegration,
};
