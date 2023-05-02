# Changelog

**Don't manually update unreleased if using publish script!**<br />
All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-

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
