# Changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-

## [0.4.0] - 10/06/2023

-   add process name prefix to logging
-   performance: don't pad terminal in production
-   added `getEnvVar` cross-platform util for getting an environment variable

## [0.3.1] - 03/05/2023

-   `copyDirRecursive` debug logs don't show full paths, only basename
-   added `isProd` util
-   debug logs won't show without LOG_DEBUG var & will never show in production

## [0.3.0] - 03/05/2023

-   add customisation of namespace colour for logger
-   improve error stack formatting for logger
-   flatten export structure
-   build project using our build package
-   added `fs.pathExists()`
-   added `fs.copyFile()`
-   added `fs.copyDirRecursive()`
-   added `shell.runAsync()`
-   added `shell.parseArgs()`

## [0.2.3] - 02/05/2023

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
