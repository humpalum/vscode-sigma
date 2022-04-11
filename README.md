![sigma_logo](./images/Sigma_0.3.png)

# sigma README

This [extension](https://marketplace.visualstudio.com/items?itemName=humpalum.sigma) will enhance your VSCode for the [Sigma signature format](https://github.com/SigmaHQ/sigma)

Checkout Ideas.md for planned features!
## Installation
Simply grab it in the [VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=humpalum.sigma). 
Install it from VSCode in the Extension Tab (Ctrl + Shift + X) and search for Sigma.
![image](https://user-images.githubusercontent.com/11175099/162737795-6e3b09df-355e-471d-babc-78125120ddc0.png)

## Features

Various Snippets:
- new Rule Snippet
- automatic Author
- Date/modifiedDate
- ...

Diagnostics:
- Title too Long
- Description too Short
- 'contains' at wrong position in modifiers
- Whitespace at end of Line

Quickfixes for some of the Diagnostics

Webextension Support (Quite untested)
## Requirements

None

## Extension Settings

- sigma.author: Set this for the newRule and author snippet
- sigma.debug: If true, debug dessages will be printed in console

## Known Issues
Only Files that are opened and begin with `title:` are set as `sigma`

## Release Notes


-----------------------------------------------------------------------------------------------------------
#### 1.0.0

- Initial Release!
- Snippets
- Diagnostics
- Lagnuage Detecion
- Webextension Support (Quite untested)

-----------------------------------------------------------------------------------------------------------

