import * as vscode from "vscode"
import { attackTags } from "./extension"

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
        const tagsRegex = new RegExp("^tags:$\n(\\s*-.+\\n)*", "m")
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
            tagtoadd = target?.label.match(".+ - (.+)")![1].replace(/\s/g, "_").toLocaleLowerCase()
        }
        if (tags) {
            let index = docText.indexOf(tags[0]) + tags[0].length

            let pos = vscode.window.activeTextEditor?.document.positionAt(index)
            vscode.window.activeTextEditor?.edit(textEdit => {
                textEdit.insert(
                    vscode.window.activeTextEditor?.document.positionAt(index)!,
                    `${tab}- attack.${tagtoadd}\n`,
                )
            })
        } else {
            vscode.window.activeTextEditor!.document.lineAt(vscode.window.activeTextEditor!.selection.active.line).range
            vscode.window.activeTextEditor?.edit(textEdit => {
                textEdit.insert(vscode.window.activeTextEditor?.selection.end!, `${tab}- attack.${tagtoadd}`)
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

    //// This is a possibility that te current line is a thematic break `<hr>` (GitHub #785)
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
                // Check if Previous line is a List Header, Then add a tab
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
                if (modifiers === "ctrl" && !cursorPos.isEqual(lineBreakPos)) {
                    let newCursorPos = cursorPos.with(line.lineNumber + 1, matches![1].length)
                    if (sep === true) {
                        newCursorPos = cursorPos.with(line.lineNumber + 1, matches![1].length + 1)
                    }
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
