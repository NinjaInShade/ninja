# Ninja widgets changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

-   Added NW.Table
-   added NW.Select

## [0.0.6] - 30/03/2023

-   fix dynamic view imports

## [0.0.5] - 10/03/2023

-   improved error message when loading view fails
-   shows "View not found" on the UI too

## [0.0.4] - 10/03/2023

-   updated tsconfig
-   updated build

## [0.0.3] - 09/03/2023

-   fix cannot find @ninjalib/build tsconfigs

## [0.0.2] - 09/03/2023

-   updated tsconfig location as it's not local anymore (so it's from @ninjalib/build)

## [0.0.1] - 09/03/2023

-   Added playground
-   Added \_Template for components
-   Added `<NW.Fieldset />` component
-   Added `<NW.TextArea />` component
-   Added `<NW.Input />` component
-   Added `<NW.Checkbox />` component
-   Added `<NW.Button />` component
-   Added `<NW.Icon />` component
-   Added `<NW.TabStrip />` component
-   Added `<NW.Spinner />` component
-   Added `<NW.AppRoot />` component
    -   This is where you initialize routes (map path to view) and add your layout (if desired)
-   Added `NW.nav` API
    -   Added `NW.nav.back()` to navigate back 1 or more steps
    -   Added `NW.nav.go(url)` to navigate to a page
    -   Added automatic anchor tag navigation linking e.g. `<a href='/admin'/>`
    -   404 `'*'` wildcard matching supported
    -   Layout support included
