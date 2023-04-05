# General requirements

-   Libs should be easy to setup and use
-   Libs should use minimal dependencies

# Input widget requirements

-   Error handling
-   Loading handling
-   All state handling (disabled, focus, click, etc...)
-   Be able to pass in style`, `class`and`title` props
-   Await any function props (e.g. onClick/onChange) and set loading to true whilst awaiting

# Nav requirements

-   Expose these methods:
    -   `create(routes, ??)`: creates the navigation with specified routes
    -   `back(x = 1)`: go `x` steps backwards in nav history
    -   `openModal(viewPath, props?, opts?)`: opens the view path specified in arg in a modal context (renders with overlay) and requires this context
    -   `closeModal(x = 1, returnVal?)`: closes `x` modals in the stack, resolving with `returnVal` if modal promisified

## TODOs

-   Create all main widgets (input/textarea/checkbox/radios/select/modal/table(?))
-   Re-think error handling -> move to Fieldset and position absolutely?
