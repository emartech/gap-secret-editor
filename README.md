# GAP Secret Editor

> Secret and config editor with GUI for Emarsys applications in Google Application Platform

## Installation

Download the application from the [releases](https://github.com/emartech/gap-secret-editor/releases) page of the GitHub 
repository.

For macOS download the .dmg file, double-click on it, and drag the "GAP Secret Editor" icon onto "Applications".

## For developers

``` bash
# set appropriate NodeJS version
nvm use

# install dependencies
npm ci

# start application locally
npm run dev

# run all tests (with npm audit and linter checks)
npm test

# run only unit tests once
npm run test:once

# run only unit tests in watch mode
npm run test:watch

# build electron application
npm run build

# build, sign and release electron application
npm run release

```

#### Releasing a new version

To build the application locally, you only need to run `npm run build`.
However, to sign and release it, some additional setup is required:
* to sign the application you need a certificate
  * download the certificate from [secret server](https://secret.emarsys.net/cred/detail/7636/)
    * DO NOT download into the project directory, so you will not commit it accidentally
  * set the `CSC_LINK` environment variable to the path of the downloaded certificate
  * set the `CSC_KEY_PASSWORD` environment variable to the password of the certificate
* after the application is signed, it has to be notarized by apple
  * make sure you have a personal [Apple ID](https://appleid.apple.com), and with that you are a member of the team 
    (at https://developer.apple.com) who issued the certificate above
  * set the `APPLEID` environment variable to your apple id
  * set the `APPLEIDPASS` environment variable to the password of your apple id
    * it is highly recommended to [generate](https://appleid.apple.com/account/manage) and use an application specific 
      password
  * install the latest Xcode
* after the application is signed and notarized, you have to publish it as a new release
  * set the `GH_TOKEN` environment variable to you [GitHub Token](https://github.com/settings/tokens)
    * make sure the token has access to the *repo* role (and all its sub-roles)
    
If you set all the environment variables above, increase the version number in [package.json](package.json)
and run `npm run release`.

(Note: the scripts usually hangs for a couple of minutes at the notarization step (just after "signing"),
be patient and wait for the apple servers to do their job)

The script will create a draft release under the [releases](https://github.com/emartech/gap-secret-editor/releases)
page, which you have to edit and publish manually.

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

The application icon <img src="build/icons/settings.png" height="16px"> is based on the [icon](https://www.flaticon.com/free-icon/settings_126363) made by [Gregor Cresnar](https://www.flaticon.com/authors/gregor-cresnar) from [www.flaticon.com](https://www.flaticon.com/).
