# Changelog

**Don't manually update unreleased if using publish script!**<br />
All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-   fix `ninja-cli start` script not starting node with --watch by default

## [0.3.1] - 20/08/2023

-   changed node/vite scripts to use `npx ...`

## [0.3.0] - 20/08/2023

-   add `ninja-cli start` with wtfnode dump support via `WTF=ms` env

## [0.2.1] - 04/06/2023

-   renamed `file` to `entry` option for node script
-   removed `--no-install` option from copy script
-   copy script now remembers previously selected target
-   use utils from @ninjalib/util
-   use new logger

## [0.1.18] - 21/04/2023

-   add rules to shared TSConfig
-   project TSConfig extends from shared config now

## [0.1.17] - 14/04/2023

-   use node instead of -S npx tsx for CLI script as the former would not give back input prompt on the terminal
-   use build script to build the project
-   remove .js suffix in imports

## [0.1.16] - 13/04/2023

-   publish script "--omit-publish" arg is not a thing anymore
-   publish script can now publish if git is unclean in other libraries
-   vite script added "configFile" arg for overriding config

## [0.1.15] - 06/04/2023

-   node script "file" arg has default so is now optional
-   node script "outDir" arg has default so is now optional
-   node script "--dev" flag renamed to "--watch"
-   node script "--build" now removes old build before creating new one
-   vite script doesn't clear screen

## [0.1.14] - 02/04/2023

-   run vite with npx

## [0.1.13] - 02/04/2023

-   switched to tsx for node runtime integration

## [0.1.12] - 01/04/2023

-   trying to fix bin cli not installing locally

## [0.1.11] - 01/04/2023

-   trying to fix bin cli not installing locally

## [0.1.10] - 30/03/2023

-   added vite script for running dev server, building and previewing build
-   add building support to node script using --build flag
-   added playground to rootDirs for a easier out the box configuration

## [0.1.9] - 09/03/2023

-   exposing shared tsconfig files in package.json

## [0.1.8] - 09/03/2023

-   changed devDeps to be actual deps

## [0.1.7] - 09/03/2023

-   changed how tagging in publish script works, it now adds library/project name as well to avoid duplicate tags in the monorepo

## [0.1.6] - 09/03/2023

-   added optional --omit-publish arg for the publish script to allow updating version/changelog without publishing to npm

## [0.1.5] - 09/03/2023

-   since doing manual committing, added manual runtime replacement of %s in commit message

## [0.1.4] - 09/03/2023

-   adding/committing/tagging manually when running publish script

## [0.1.3] - 09/03/2023

-   making last attempt at fixing npm version not committing

## [0.1.2] - 09/03/2023

-   remove log
-   potential fix for publish not committing using npm version command

## [0.1.1] - 09/03/2023

-   fix is git clean check in publish script
-   fix npm version command in publish script

## [0.1.0] - 09/03/2023

-   added cli accessible via `ninja-cli ...` with scripts:
    -   copy (copies lib to project/lib for easy testing in real applications)
    -   publish (publishes packages)
    -   node (node runtime compatible with ESM, Typescript & TS paths)
    -   test (test runner script)
-   added shared tsconfigs for project/playgrounds that projects/libs can use from this lib
