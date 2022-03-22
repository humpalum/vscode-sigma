![sigma_logo](./images/Sigma_0.3.png)

# sigma README

This extension will enhance your VSCode for the [Sigma signature format](https://github.com/SigmaHQ/sigma)

Checkout Ideas.md for planned features!

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

Quickfixes for some of the Diagnostics.

## Requirements

None

## Extension Settings

- sigma.author: Set this for the newRule and author snippet
- sigma.debug: If true, debug dessages will be printed in console

## Known Issues

Every '.yml' file will be detected as Sigma. Go upvote this [issue](https://github.com/microsoft/vscode/issues/145659) to get it fixed :)

## Release Notes

### 0.0.3
New Icon.
Provide Diagnostics only for sigma files.
Some fixes for diagnostics.

### 0.0.2
Fixed some Snippets
First Diagnostics!

### 0.0.1

Initial commit
Snippets!

-----------------------------------------------------------------------------------------------------------

