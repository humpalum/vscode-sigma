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
        const tagsRegex = new RegExp("^tags:$\n(\\s*-.+$)*", "m")
        let docText = vscode.window.activeTextEditor?.document.getText()!
        let tags = tagsRegex.exec(docText)
        if (tags) {
            let index = docText.indexOf(tags[0]) + tags[0].length
            let pos = vscode.window.activeTextEditor?.document.positionAt(index)
            vscode.window.activeTextEditor?.edit(textEdit => {
                textEdit.insert(
                    vscode.window.activeTextEditor?.document.positionAt(index)!,
                    `\n   - attack.${target?.label.match("(.+?) -")![1].toLowerCase()}`,
                )
            })
        } else {
            const range = vscode.window.activeTextEditor!.document.lineAt(
                vscode.window.activeTextEditor!.selection.active.line,
            ).range
            vscode.window.activeTextEditor?.edit(textEdit => {
                textEdit.insert(
                    vscode.window.activeTextEditor?.selection.end!,
                    `   - attack.${target?.label.match("(.+?) -")![1].toLowerCase()}`,
                )
            })
        }
    }
}
