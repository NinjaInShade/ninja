# Changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-   updated tsconfig location to be from installed @ninjalib/build

## [0.2.0] - 09/03/2023

-   add @ninjalib/build dependency
-   switched to build cli commands for testing and node runtime
-   updated tsconfig to extend from build

## [0.1.2] - 04/03/2023

-   updated @ninjalib/util to 0.1.1
-   add runtime support and ts path alias support for both run & build time support
-   updated to use path aliases
-   updated build script
-   added non-default exports

## [0.1.1] - 26/02/2023

-   added template .env file
-   added `USE` query to getQueryType method
-   fixed cannot read properties of 0 in getQueryType method

## [0.1.0] - 26/02/2023

-   updated @ninjalib/util to 0.0.4 for type declarations
-   updated docs
-   added private `getQueryType` method
-   banned use of manual transaction handling
-   adding check to make sure user is in transaction if running certain query types (INSERT, DELETE, etc...)
-   added transaction tests
-   added helpers
    -   `insertOne`
    -   `insertMany`

## [0.0.4] - 26/02/2023

-   fixed type declarations

## [0.0.3] - 26/02/2023

-   added CHANGELOG
-   added tests
-   added type declarations
-   added to/improved docs
-   fixed query param undefined error message displaying wrong param index
-   added helpers
    -   `getRows()`
    -   `getRow()`

## [0.0.2] - 19/02/23

-   removed logs,
-   updated README

## [0.0.1] - 19/02/23

-   added base MySQL class
    -   `connect()` method
    -   `query()` method
    -   `db.transaction()` method
