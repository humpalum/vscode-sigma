import * as vscode from "vscode"
import { attackTags } from "./extension"
const cp = require("child_process")
import { SigmaSearchResultEntry } from "./types"
import { execQuery, escapeString, cleanField } from "./sse_util"
import * as sanitizeHtml from "sanitize-html"
import axios, { AxiosError, AxiosResponse } from "axios"
import { SIGMACONVERTERHEAD } from "./sigmaconverter/sigmaconverter"
import {
    TranslatedSigConverterConfigItem,
    setOnSigconverterConfigUpdated,
    sigconverterConfigs,
    sigconverterUrl,
    translatedSigconverterConfigs,
} from "./configuration"

export function sigmaCompile(cfg: any, rulepath: string) {
    let configs = ""
    // Check if cfg.config is not array
    if (!Array.isArray(cfg.config)) {
        configs = `--config ${cfg.config}`
    } else {
        for (let entry of cfg.config) {
            configs = `${configs} --config ${entry}`
        }
    }
    let command = `sigmac ${configs} --target ${cfg.target} ${cfg.additionalArgs || ""} ${rulepath}`
    return new Promise<any>((resolve, reject) =>
        cp.exec(command, (err: string, stdout: string, stderr: string) => {
            if (err) {
                reject(`${err} --- ${stderr}`)
            } else {
                vscode.env.clipboard.writeText(stdout).then(nil => {
                    vscode.window.showInformationMessage("Sigma rule copied to clipboard")
                })
                resolve(stdout)
            }
        }),
    )
}
export async function addTagQuickpick() {
    const buildQuickPickItems = (callback: (value: vscode.QuickPickItem[]) => void) => {
        callback(
            attackTags
                .map((tag: any) => {
                    return { label: `${tag["tag"]} - ${tag["name"]}`, detail: `${tag["description"]}` }
                })
                .sort()
                .reverse(),
        )
    }

    const target = await vscode.window.showQuickPick<vscode.QuickPickItem>(
        new Promise<vscode.QuickPickItem[]>(buildQuickPickItems),
        {
            placeHolder: "Registry ...",
            matchOnDescription: true,
            matchOnDetail: true,
        },
    )
    if (target !== undefined && vscode.window.activeTextEditor!.selection) {
        const tagsRegex = new RegExp("^tags:\r?\n(\s*-.+\r?\n)*", "m")
        let docText = vscode.window.activeTextEditor?.document.getText()!
        let tags = tagsRegex.exec(docText)
        let tab = "    "
        if (
            vscode.window.activeTextEditor?.options.tabSize &&
            typeof vscode.window.activeTextEditor?.options.tabSize !== "string"
        ) {
            tab = ` `.repeat(vscode.window.activeTextEditor?.options.tabSize)
        }
        let tagtoadd = target?.label.match("(.+?) -")![1].toLowerCase()
        if (tagtoadd.match(/^ta.*/)) {
            // Use actual name instead
            tagtoadd = target?.label.match(".+ - (.+)")![1].replace(/\s/g, "-").toLocaleLowerCase()
        }
        if (tags) {
            let index = docText.indexOf(tags[0]) + tags[0].length

            let pos = vscode.window.activeTextEditor?.document.positionAt(index)
            vscode.window.activeTextEditor?.edit(textEdit => {
                if (tagtoadd.slice(0, 2) == "d3") {
                    textEdit.insert(
                        vscode.window.activeTextEditor?.document.positionAt(index)!,
                        `${tab}- d3fend.${tagtoadd}\n`,
                    )
                } else {
                    textEdit.insert(
                        vscode.window.activeTextEditor?.document.positionAt(index)!,
                        `${tab}- attack.${tagtoadd}\n`,
                    )
                }
            })
        } else {
            vscode.window.activeTextEditor!.document.lineAt(vscode.window.activeTextEditor!.selection.active.line).range
            vscode.window.activeTextEditor?.edit(textEdit => {
                if (tagtoadd.slice(0, 2) === "d3") {
                    textEdit.insert(vscode.window.activeTextEditor?.selection.end!, `${tab}- d3fend.${tagtoadd}`)
                } else {
                    textEdit.insert(vscode.window.activeTextEditor?.selection.end!, `${tab}- attack.${tagtoadd}`)
                }
            })
        }
    }
}

// Try to expand List

export function onEnterKey(modifiers?: string) {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        return
    }
    let cursorPos: vscode.Position = editor.selection.active
    let line = editor.document.lineAt(cursorPos.line)
    let textBeforeCursor = line.text.substring(0, cursorPos.character)
    let textAfterCursor = line.text.substring(cursorPos.character)

    let lineBreakPos = cursorPos
    if (modifiers === "ctrl") {
        lineBreakPos = line.range.end
    }

    if (modifiers === "shift") {
        return asNormal("enter", modifiers)
    }

    const lineTextNoSpace = line.text.replace(/\s/g, "")
    if (
        lineTextNoSpace.length > 2 &&
        (lineTextNoSpace.replace(/\-/g, "").length === 0 || lineTextNoSpace.replace(/\*/g, "").length === 0)
    ) {
        return asNormal("enter", modifiers)
    }
    let matches: RegExpExecArray | null
    //// If it's an empty list item, remove it
    if ((matches = /^(\s*)-\s*(''|""|)$/.exec(line.text)) !== null) {
        return editor
            .edit(editBuilder => {
                let listHeader = /:\s*$/.test(editor!.document.lineAt(line.lineNumber - 1).text)
                editBuilder.delete(line.range)
                let tab = editor?.options.tabSize
                if (typeof tab === "number" && !listHeader) {
                    editBuilder.insert(line.range.end, matches![1].substring(0, matches![1].length - tab))
                } else {
                    editBuilder.insert(line.range.end, matches![1].substring(0, matches![1].length))
                }
            })
            .then(() => {
                editor!.revealRange(editor!.selection)
            })
    }

    let sep = false
    if ((matches = /^(\s*-\s*)(.)/.exec(textBeforeCursor)) !== null) {
        // Unordered list
        return editor
            .edit(editBuilder => {
                // when using ' as seperator
                if (matches![2] === "'") {
                    sep = true
                    if (lineBreakPos.isEqual(line.range.end)) {
                        editBuilder.insert(lineBreakPos, `\n${matches![1]}''`)
                    } else {
                        editBuilder.insert(lineBreakPos, `'\n${matches![1]}'`)
                    }
                }
                // When using " as seperator
                else if (matches![2] === '"') {
                    sep = true
                    if (lineBreakPos.isEqual(line.range.end)) {
                        editBuilder.insert(lineBreakPos, `\n${matches![1]}""`)
                    } else {
                        editBuilder.insert(lineBreakPos, `"\n${matches![1]}"`)
                    }
                } else {
                    editBuilder.insert(lineBreakPos, `\n${matches![1]}`)
                }
            })
            .then(() => {
                // Fix cursor position
                console.log(cursorPos.isEqual(lineBreakPos))
                if (modifiers === "ctrl" && !cursorPos.isEqual(lineBreakPos)) {
                    let newCursorPos = cursorPos.with(line.lineNumber + 1, matches![1].length)
                    if (sep === true) {
                        newCursorPos = cursorPos.with(line.lineNumber + 1, matches![1].length + 1)
                    }
                    editor!.selection = new vscode.Selection(newCursorPos, newCursorPos)
                } else if (sep === true) {
                    let newCursorPos = cursorPos.with(line.lineNumber + 1, matches![1].length + 1)
                    editor!.selection = new vscode.Selection(newCursorPos, newCursorPos)
                }
            })
            .then(() => {
                editor!.revealRange(editor!.selection)
            })
    } else if ((matches = /^(\s*).*:\s*$/.exec(textBeforeCursor)) !== null) {
        // Create new Table
        return editor
            .edit(editBuilder => {
                let tab = editor?.options.tabSize
                if (typeof tab === "number") {
                    editBuilder.insert(lineBreakPos, `\n${matches![1]}${" ".repeat(tab)}- `)
                } else {
                    editBuilder.insert(lineBreakPos, `\n${matches![1]}\t- `)
                }
            })
            .then(() => {
                // Fix cursor position
                if (modifiers === "ctrl" && !cursorPos.isEqual(lineBreakPos)) {
                    let newCursorPos = cursorPos.with(line.lineNumber + 1, matches![1].length)
                    editor!.selection = new vscode.Selection(newCursorPos, newCursorPos)
                }
            })
    } else {
        return asNormal("enter", modifiers)
    }
}

function asNormal(key: string, modifiers?: string) {
    switch (key) {
        case "enter":
            if (modifiers === "ctrl") {
                return vscode.commands.executeCommand("editor.action.insertLineAfter")
            } else {
                return vscode.commands.executeCommand("type", { source: "keyboard", text: "\n" })
            }
        case "tab":
            if (modifiers === "shift") {
                return vscode.commands.executeCommand("editor.action.outdentLines")
            } else if (
                vscode.window.activeTextEditor!.selection.isEmpty &&
                vscode.workspace.getConfiguration("emmet").get<boolean>("triggerExpansionOnTab")
            ) {
                return vscode.commands.executeCommand("editor.emmet.action.expandAbbreviation")
            } else {
                return vscode.commands.executeCommand("tab")
            }
        case "backspace":
            return vscode.commands.executeCommand("deleteLeft")
    }
}

export async function related(idx: number) {
    let document = vscode.window.activeTextEditor?.document
    if (!document) {
        return
    }

    let stopDefinition = new RegExp("^[a-z].*", "i")
    let idDefinition = new RegExp(
        "^\\s*-\\sid:\\s([0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12})",
        "i",
    )
    let cur = idx + 1
    let ids = []
    while (true) {
        let line = document.lineAt(cur).text
        const matchs = stopDefinition.exec(line)
        if (matchs) {
            break
        } else {
            const idmatch = idDefinition.exec(line)
            if (idmatch) {
                ids.push(idmatch[1])
            }
        }
        cur++
    }

    console.log(ids)

    let resultM = new Map<string, SigmaSearchResultEntry>()
    for (var id of ids) {
        let results = execQuery('id:"' + id + '"')
        for (var r of await results) {
            resultM.set(id, r)
        }
    }

    const result = Array.from(resultM.values())
    result.sort((n1, n2) => {
        if (n1.score > n2.score) {
            return -1
        }

        if (n1.score < n2.score) {
            return 1
        }

        return 0
    })

    let webviewPanel = vscode.window.createWebviewPanel("panel", "Related Sigma Rules", vscode.ViewColumn.Beside, {
        enableScripts: true,
    })

    let html = ""
    html = `<html>` + HEAD
    result.forEach((rule: SigmaSearchResultEntry) => {
        html += `<button class="accordion">`
        html += `<div style="float:left">`
        html +=
            `<a href="` +
            sanitizeHtml(rule.url, { allowedTags: [], allowedAttributes: {} }) +
            `">` +
            sanitizeHtml(rule.title, { allowedTags: [], allowedAttributes: {} }) +
            `</a>`
        html += `</div>`
        html +=
            `<div style="float:right">` + sanitizeHtml(rule.id, { allowedTags: [], allowedAttributes: {} }) + `</div>`

        html +=
            `<br><div style="float:left">` +
            sanitizeHtml(rule.description, { allowedTags: [], allowedAttributes: {} }) +
            `</div>`

        html +=
            `<div style="float:left">File: ` +
            sanitizeHtml(rule.file, { allowedTags: [], allowedAttributes: {} }) +
            `</div>`
        html +=
            `<br><div style="float:right">Level: ` +
            sanitizeHtml(rule.level, { allowedTags: [], allowedAttributes: {} }) +
            `</div>`

        html += `</button>`
        html += `<div class="panel">`
        html += "<pre>" + sanitizeHtml(rule.detection, { allowedTags: [], allowedAttributes: {} }) + "</pre>"
        html += `</div><br>`
    })

    html += SCRIPT + `</html>`

    webviewPanel.webview.html = html
}

export async function lookup() {
    let sels = vscode.window.activeTextEditor?.selections
    let document = vscode.window.activeTextEditor?.document
    let strings = []
    let indices = []
    let stringDefinition = new RegExp("[:-]\\s[\"'](.+)[\"']", "i")
    let fieldDefinition = new RegExp("^\\s*[-\\s]?(.+):", "i")
    if (!(sels && document)) {
        return
    }

    for (var sel of sels) {
        for (let i = sel.start.line; i <= sel.end.line; i++) {
            if (i === sel.end.line && sel.end.character === 0) {
                continue
            }
            let line = document.lineAt(i).text
            if (!line.trim()) {
                continue
            }

            const matchs = stringDefinition.exec(line)
            if (matchs) {
                strings.push(matchs[1])
                indices.push(i)
            }
        }
    }

    if (strings.length === 0) {
        return
    }

    let queryFieldMust = ""
    let queryFieldShould = ""
    let queryFullMust = ""
    let queryFullShould = ""
    let c = 0
    for (var s of strings) {
        s = escapeString(s)
        queryFullMust += '+"' + s + '" '
        queryFullShould += '"' + s + '" '
        let cur = indices[c]
        while (cur >= 0) {
            let line = document.lineAt(cur).text
            const matchs = fieldDefinition.exec(line)
            if (matchs) {
                queryFieldMust += "+" + cleanField(matchs[1]) + ':"' + s + '" '
                queryFieldShould += cleanField(matchs[1]) + ':"' + s + '" '
                break
            }
            cur--
        }
        c++
    }

    console.log(queryFieldMust)
    console.log(queryFieldShould)
    console.log(queryFullMust)
    console.log(queryFullShould)

    let queries = [queryFieldMust, queryFieldShould, queryFullMust, queryFullShould]
    let resultM = new Map<string, SigmaSearchResultEntry>()
    for (var q of queries) {
        let results = execQuery(q)
        for (var r of await results) {
            let tmp = resultM.get(r.title)
            if (!tmp) {
                resultM.set(r.title, r)
            } else {
                if (r.score > tmp.score) {
                    resultM.set(r.title, r)
                }
            }
        }
    }

    let webviewPanel = vscode.window.createWebviewPanel("panel", "Sigma Search", vscode.ViewColumn.Beside, {
        enableScripts: true,
    })

    const result = Array.from(resultM.values())
    result.sort((n1, n2) => {
        if (n1.score > n2.score) {
            return -1
        }

        if (n1.score < n2.score) {
            return 1
        }

        return 0
    })

    let html = ""
    html = `<html>` + HEAD
    html += "<pre>Query ~ " + sanitizeHtml(queryFullShould, { allowedTags: [], allowedAttributes: {} }) + "</pre>"
    result.forEach((rule: SigmaSearchResultEntry) => {
        html += `<button class="accordion">`
        html += `<div style="float:left">`
        html +=
            `<a href="` +
            sanitizeHtml(rule.url, { allowedTags: [], allowedAttributes: {} }) +
            `">` +
            sanitizeHtml(rule.title, { allowedTags: [], allowedAttributes: {} }) +
            `</a>`
        html += `</div>`
        html +=
            `<div style="float:right">String Similarity: ` +
            sanitizeHtml(rule.score.toFixed(2), { allowedTags: [], allowedAttributes: {} }) +
            `</div>`

        html +=
            `<br><div style="float:left">` +
            sanitizeHtml(rule.description, { allowedTags: [], allowedAttributes: {} }) +
            `</div>`

        html +=
            `<div style="float:left">File: ` +
            sanitizeHtml(rule.file, { allowedTags: [], allowedAttributes: {} }) +
            `</div>`
        html +=
            `<br><div style="float:right">Level: ` +
            sanitizeHtml(rule.level, { allowedTags: [], allowedAttributes: {} }) +
            `</div>`

        html += `</button>`
        html += `<div class="panel">`
        html += "<pre>" + sanitizeHtml(rule.detection, { allowedTags: [], allowedAttributes: {} }) + "</pre>"
        html += `</div><br>`
    })

    html += SCRIPT + `</html>`

    webviewPanel.webview.html = html
}

var HEAD: string = `
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline' ; script-src 'sha256-FYRAROSVI6vQbzhKsGMuKn53wS19N+92X8KtvdD843s='">
<style>
.accordion {
  cursor: pointer;
  padding: 12px;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  transition: 0.4s;
  color: white;
  background-color: #32302f;
}

.active, .accordion:hover {
  background-color: #464a43;
}

.panel {
  padding: 0 18px;
  display: none;
  overflow: hidden;
} 

.arrow {
    border: solid grey;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 4px;
  }

.down {
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
  }
</style>
</head>
`

var SCRIPT: string = `
<script>
var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}
</script>
`

export async function openSigconverter() {
    let enabled: boolean = vscode.workspace.getConfiguration("sigma").get("sigconverterEnabled") || false
    if (!enabled) {
        let webviewPanelEnable = vscode.window.createWebviewPanel("panel", "sigconverter", vscode.ViewColumn.Beside, {
            enableScripts: true,
        })
        let htmlEnable = `<!DOCTYPE html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                /* Color Definitions */
                :root {
                    --sigma-blue: var(--vscode-foreground);
                    --sigma-dark: var(--vscode-editor-background);
                }
                .button {
                    background-color: var(--vscode-editor-background);
                    border: solid 2px var(--sigma-blue);
                    border-radius: 4px;
                    color: var(--sigma-blue);
                    padding: 7px 16px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    cursor: pointer;
                }
                .url {
                    color: var(--vscode-textLink-foreground)
                }
            </style>

                <body height="100vh">
                    <script>
                            const vscode = acquireVsCodeApi();
                    </script>
                    The following feature will access <span class="url"> ${sanitizeHtml(
                        sigconverterUrl,
                    )} </span> in order to convert your sigma rules to different SIEM query languages. 
                    <br>
                    In addition to that, it'll use the following Javascript libraries for styling:
                        <ul>
                            <li>Tailwind UI</li>
                            <li>PrismJS</li>
                            <li>FontAwesome</li>
                        </ul>
                    <br>
                    <span id="enable-feature-btn" class="button">
                        I'm Aware. Enable Feature
                    </span>
                    <script>
                        var enableFeatureBtn = document.getElementById("enable-feature-btn");
                        enableFeatureBtn.addEventListener('click', () => {
                            const message = {
                                command: 'enableFeature',
                            };
                            vscode.postMessage(message);
                        });
                    </script>
                    <span id="cancel-feature-btn"  class="button">
                        Cancel
                    </span>
                    <script>
                        var cancel-feature-btn = document.getElementById("cancel-feature-btn");
                        cancel-feature-btn.addEventListener('click', () => {
                            const message = {
                                command: 'cancel',
                            };
                            vscode.postMessage(message);
                        });
                </body>
        </html>
    `
        webviewPanelEnable.webview.html = htmlEnable
        webviewPanelEnable.webview.onDidReceiveMessage(message => {
            console.log(message)
            switch (message.command) {
                case "enableFeature":
                    console.log("Enable Feature")
                    vscode.workspace
                        .getConfiguration("sigma")
                        .update("sigconverterEnabled", true, true)
                        .then(() => {
                            vscode.window.showInformationMessage(
                                "Sigma Converter Feature enabled. Please Reuse the Codelens.",
                            )
                            //close the webview
                            webviewPanelEnable.dispose()
                        })
                    return
                case "cancel":
                    vscode.window.showInformationMessage("Sigma Converter Feature disabled.")
                    //close the webview
                    webviewPanelEnable.dispose()
                    return
            }
        }, undefined)
        return
    }
    let backend: string = vscode.workspace.getConfiguration("sigma").get("sigconverterBackend") || "splunk"

    let editor = vscode.window.activeTextEditor
    if (!editor) {
        return
    }
    let html = `<!DOCTYPE html>
    ${SIGMACONVERTERHEAD}
    <body height="100vh">
        <code id="query-code" class="text-sm language-splunk-spl">
        Loading...
        </code>
    </body>
    </html>
`
    let webviewPanel = vscode.window.createWebviewPanel("panel", "sigconverter", vscode.ViewColumn.Beside, {
        enableScripts: true,
    })
    //webviewPanel.webview.html = generateWebviewContent(rule64, backend);
    webviewPanel.webview.html = html

    const updateSigconverter = async () => {
        if (editor) {
            let rule = editor?.document.getText()
            let html = `<!DOCTYPE html>
                        ${SIGMACONVERTERHEAD}
                        <body height="100vh">
                        <script>
                        const vscode = acquireVsCodeApi();
                        </script>
             `
            const unsolvedPromises = translatedSigconverterConfigs?.map(async (config, index) => {
                const res = await translateRule(rule, config)
                return `
                <div class="mb-6 border border-sigma-blue rounded" >
                                <div class="flex flex-row items-center gap-2  p-2" >
                                <span class="px-3 py-2 border-x border-t rounded border-sigma-blue">
                                    <i id="rule-share-btn-${index}" class="fas fa-share-nodes px-1 py-0 my-0 text-sm text-sigma-blue cursor-pointer"></i>
                                </span>
                                <span  id="query-copy-btn-${index}" class="px-3 py-2 border-x border-t rounded border-sigma-blue text-sigma-blue cursor-pointer select-none">
                                <i class="fas fa-copy px-1 py-0 my-0 text-sm"></i>
                                Query
                                </span>
                                <p class="text-lg">
                                ${
                                    (config.name &&
                                        `<span class="text-sigma-blue">${sanitizeHtml(config.name)}</span>`) ||
                                    ""
                                }
                                <span>Backend:</span> <span class="text-sigma-blue">${sanitizeHtml(
                                    config.backend,
                                )}</span>
                                </p>
                                
                                <script>
                                    
                                    var ruleShareBtn${index} = document.getElementById("rule-share-btn-${index}");
                                    ruleShareBtn${index}.addEventListener('click', () => {
                                        const message = {
                                            command: 'shareLink',
                                            index: '${index}',
                                        };
                                        vscode.postMessage(message);
                                        ruleShareBtn${index}.classList.toggle("text-sigma-blue");
                                        ruleShareBtn${index}.classList.toggle("text-green-400");
                                    
                                        setTimeout(function () {
                                        ruleShareBtn${index}.classList.toggle("text-sigma-blue");
                                        ruleShareBtn${index}.classList.toggle("text-green-400");
                                        }, 1200);
                                    });
                                        var copyBtn${index} = document.getElementById("query-copy-btn-${index}");
                                        copyBtn${index}.addEventListener('click', () => {
                                            const message = {
                                                command: 'copyRes',
                                                message: "${Buffer.from(res).toString("base64")}",
                                            };
                                            vscode.postMessage(message);
                                            copyBtn${index}.classList.toggle("text-sigma-blue");
                                            copyBtn${index}.classList.toggle("text-green-400");
                                        
                                            setTimeout(function () {
                                                copyBtn${index}.classList.toggle("text-sigma-blue");
                                                copyBtn${index}.classList.toggle("text-green-400");
                                            }, 1200);
                                        });
                                    </script>
                                </div>
                                <pre onclick="focusSelect('rule-code')" class="border rounded border-sigma-blue tab-code">
                                <code id="query-code" class="text-sm rounded language-${sanitizeHtml(
                                    config.backend,
                                )}-spl">
                                ${sanitizeHtml(res)}
                                </code>
                                    </pre>
                    </div>
            `
            })
            const sigconverterHTML = await Promise.all(unsolvedPromises)
            html += sigconverterHTML.join("\n")
            html += `</body>
                    </html>`

            webviewPanel.webview.html = html
            webviewPanel.webview.onDidReceiveMessage(message => {
                console.log(message)
                switch (message.command) {
                    case "shareLink":
                        vscode.env.clipboard
                            .writeText(getShareLink(rule, translatedSigconverterConfigs[message.index]))
                            .then(() => {
                                vscode.window.showInformationMessage("Successfully copied to clipboard!")
                            })
                        return
                    case "copyRes":
                        vscode.env.clipboard.writeText(Buffer.from(message.message, "base64").toString()).then(() => {
                            vscode.window.showInformationMessage("Successfully copied to clipboard!")
                        })
                        return
                }
            }, undefined)
        }
    }
    updateSigconverter()

    // Update the webview content whenever the document changes
    let disposables = vscode.workspace.onDidChangeTextDocument(event => {
        updateSigconverter()
    })

    // Update the weview content whenever the config updates
    setOnSigconverterConfigUpdated(updateSigconverter)

    webviewPanel.onDidDispose(() => {
        setOnSigconverterConfigUpdated(() => {})
        disposables.dispose()
    })
}

// Translate Rule using Sigconverter
async function translateRule(rule: string, config: TranslatedSigConverterConfigItem) {
    let result = ""
    let rule64 = Buffer.from(rule).toString("base64")

    let url = config.url + "/api/v1/" + config.version + "/convert"

    const data = {
        rule: rule64,
        format: config.format || "",
        target: config.backend,
        pipelineYml: config.pipelineYML,
        pipeline: config.pipeline,
    }

    await axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res: AxiosResponse) => {
            result = res.data
        })
        .catch((err: AxiosError) => {
            result = err.response?.data as string
        })
    return result
}

function getShareLink(rule: string, config: TranslatedSigConverterConfigItem) {
    let rule64 = Buffer.from(rule).toString("base64")
    let url =
        config.url +
        `#backend=${config.backend}format=${config.format}&pipeline=${config?.pipeline?.join(
            ";",
        )}&rule=${rule64}&pipelineYml=${config.pipelineYML}`
    return url
}
