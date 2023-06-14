const os = require("os");
const { OS_PATHS } = require("../constants");
const fs = require("fs");

let platform = os.platform();
let dirPath = OS_PATHS[platform];

if (fs.existsSync(dirPath)) {
  fs.rmSync(dirPath, { recursive: true });
}
