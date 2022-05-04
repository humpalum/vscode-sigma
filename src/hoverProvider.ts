import * as vscode from "vscode"
import { attackTags } from "./extension"

export function provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
): vscode.ProviderResult<vscode.Hover> {
    let tagDefinition = new RegExp("- attack\\.(.+)")
    const tagRange: vscode.Range | undefined = document.getWordRangeAtPosition(position, tagDefinition)

    if (tagRange !== undefined) {
        let matchedTags = []
        let curtag = document.getText(tagRange).match(tagDefinition)![1].toLowerCase()
        let hoverinfo = attackTags
            .map((tag: any) => {
                if (
                    tag["tag"].toLowerCase().includes(curtag) ||
                    tag["name"].toLowerCase() === curtag.replace(/_/, " ")
                ) {
                    return `### [${tag["tag"]} - ${tag["name"]}](${tag["url"]})\n${tag["description"]}\n\n___\n\n`
                }
            })
            .join("")
        if (hoverinfo === "") {
            return new vscode.Hover(`Couldnt find tag: ${curtag}`)
        }
        return new vscode.Hover(hoverinfo)
    }
    return
}
