# Changelog

**Don't manually update unreleased if using publish script!**<br />
All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-   added cli accessible via `ninja-cli ...` with scripts:
    -   copy (copies lib to project/lib for easy testing in real applications)
    -   publish (publishes packages)
    -   node (node runtime compatible with ESM, Typescript & TS paths)
    -   test (test runner script)
-   added shared tsconfigs for project/playgrounds that projects/libs can use from this lib
