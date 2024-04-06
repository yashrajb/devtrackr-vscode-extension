const os = require("os");
const path = require("path");

const DEVTRACKR_GITHUB_TOKEN = "__devtrackrGithubToken";
const DEVTRACKR_GITHUB_USERNAME = "__devtrackrGithubUsername";
const REPO_NAME = "devtrackr-data";
const CHECK_NOTIFICATION_FREQUENCY = 30 * 60 * 1000;
const REMINDER_TIME = "__devtrackrReminderTime";
const SCHEDULED_DAYS = 6;

const OS_PATHS = {
  win32: path.join(os.homedir(), "AppData", "Local", ".devtrackr"),
  darwin: path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "devtrackr"
  ),
  linux: path.join(os.homedir(), ".config", "devtrackr"),
};

module.exports = {
  DEVTRACKR_GITHUB_TOKEN,
  DEVTRACKR_GITHUB_USERNAME,
  REPO_NAME,
  REMINDER_TIME,
  CHECK_NOTIFICATION_FREQUENCY,
  OS_PATHS,
  SCHEDULED_DAYS,
};
