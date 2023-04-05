# Ninja widgets changelog

All changes worth documenting will be listed in this file. The convention of versions used is semantic versioning.<br />
Refer to https://keepachangelog.com/en/1.0.0/ for how to maintain changelog<br />

## [Unreleased]

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