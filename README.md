# Devtrackr

Effortlessly document your weekly work with this extension.Say goodbye to the hassle of recalling past projects and save time when crafting resumes.

## Demo Video

[![Devtrackr](https://img.youtube.com/vi/U-rP7Ryb9_s/0.jpg)](https://www.youtube.com/watch?v=U-rP7Ryb9_s&t=7s&ab_channel=Yashrajbasan)

## Story behind extension

https://basanyash627.medium.com/introducing-devtrackr-effortlessly-document-your-work-2ad82c8bca65

## Features

- Weekly Work Documentation: DevTrackr prompts you to write down your weekly achievements, enabling you to stay organized and recall your progress easily.

- GitHub Integration: Seamlessly connect with your GitHub account to link your projects and sync your updates to a private repository named "devtrackr-data".

- Enhanced Job Security: In times of layoffs or when updating your resume, DevTrackr allows you to access your private repository and review your documented achievements. It enables you to highlight your valuable work and skills.

- Save and Sync: Once you complete your updates, simply click "Save" within the web view panel, and DevTrackr will automatically save and sync your records to your private repository.

## Requirements

- Visual Studio Code version 1.78.0 or later.
- GitHub personal token: Your extension requires a valid GitHub personal token with the following permissions:
  - Create repositories
  - Update files
  - Check file existence
  - Get file content

To generate a personal token with the necessary permissions, please visit [Create Personal Token](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) to understand more.

- Github username: Your GitHub username is required to associate the extension with your GitHub account and access your private repositories.

## Known Issues

- Deleting the "data.json" file manually from the file system while the VSCode extension is running may cause the extension to continue displaying projects and their associated data. This occurs because the extension loads the data during startup, and the deletion may not immediately take effect until you reopen VSCode. Please note that restarting VSCode after deleting the "data.json" file will resolve this issue.

## About Developer

- [website](https://yashrajb.github.io)
- [blog](https://medium.com/@basanyash627)
- [github](https://github.com/yashrajb)
- [twitter](https://twitter.com/yashrajbasan2)
- [instagram](https://www.instagram.com/yashraj.dev/)
- [linkedin](https://www.linkedin.com/in/yashraj-basan-11b915157/)
