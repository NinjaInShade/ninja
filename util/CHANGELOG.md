# Changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-   update grey ANSI colour code in utils

## [0.2.2] - 02/05/2023

-   added Logger class

## [0.2.1] - 10/03/2023

-   updated tsconfig location as it's not local anymore

## [0.2.0] - 09/03/2023

-   add @ninjalib/build dependency
-   switched to build cli commands for testing and node runtime
-   updated tsconfig to extend from build
-   switched to modern package.json exports structure
-   added support for specific exports for browser/server which makes this package compatible to use with vite

## [0.1.1] - 04/03/2023

-   add runtime support and ts path alias support for both run & build time support
-   updated to use path aliases
-   updated build script
-   added non-default exports

## [0.1.0] - 01/03/2023

-   import util and using it doesn't require the client/server/shared methods first anymore

## [0.0.4] - 26/02/2023

-   added type declarations

## [0.0.3] - 25/02/2023

-   moved where trimming happens in `loadEnv()`

## [0.0.2] - 25/02/2023

-   added trimming to value in `loadEnv()`

## [0.0.1] - 25/02/2023

-   added shared functions:
    -   `isBrowser()`
    -   `isNode()`
-   added server function:
    -   `loadEnv()`
-   added tests
-   added initial CHANGELOG and README
