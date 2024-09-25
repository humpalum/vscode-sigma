import * as vscode from "vscode"
import { attackTags } from "./extension"
import { SigmaSearchResultEntry  } from "./types"
import {execQuery, escapeString, cleanField} from "./sse_util"
import * as sanitizeHtml from 'sanitize-html';

export function provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
): Thenable<vscode.Hover> | vscode.Hover | undefined {
    let tagDefinition = new RegExp("- attack\\.(.+)")
    const tagRange: vscode.Range | undefined = document.getWordRangeAtPosition(position, tagDefinition)

    if (tagRange !== undefined) {
        let matchedTags = []
        let curtag = document.getText(tagRange).match(tagDefinition)![1].toLowerCase()
        let hoverinfo = attackTags
            .map((tag: any) => {
                if (
                    tag["tag"].toLowerCase().includes(curtag) ||
                    tag["name"].toLowerCase() === curtag.replace(/-/g, " ")
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

    let nextronDefinition = new RegExp('(Nextron Systems)') 
    const nextronRange: vscode.Range | undefined = document.getWordRangeAtPosition(position, nextronDefinition)
    if (nextronRange !== undefined) {
        let cursString = document.getText(nextronRange).match(nextronDefinition)![0]
        if (!cursString) {
            return
        }
        console.log(cursString)
        return new vscode.Hover("### https://www.nextron-systems.com/")
    }

    let stringDefinition = new RegExp('(- |: )["\'](.*?)[\'"]')
    let fieldDefinition = new RegExp('^\\s*[-\\s]?(.+):', "i")
    const stringRange: vscode.Range | undefined = document.getWordRangeAtPosition(position, stringDefinition)
    if (stringRange !== undefined) {
        let cursString = document.getText(stringRange).match(stringDefinition)![2]
        if (!cursString) {
            return
        }
        cursString = escapeString(cursString)

        let queryFieldMust = ""
        let queryFieldShould = ""
        let queryFullMust = ""
        let queryFullShould = ""

        queryFullMust += '+"' + cursString + '" '
        queryFullShould += '"' + cursString + '" '

        let cur = stringRange.start.line
        while (cur >= 0) {
            let line = document.lineAt(cur).text
            const matchs = fieldDefinition.exec(line)
            if (matchs) {
                queryFieldMust += "+" + cleanField(matchs[1]) + ":\"" + cursString + "\" "
                queryFieldShould += cleanField(matchs[1]) + ":\"" + cursString + "\" "
                break
            }
            cur--
        }

        console.log(queryFieldMust)
        console.log(queryFieldShould)
        console.log(queryFullMust)
        console.log(queryFullShould)

        let queries = [queryFieldMust, queryFieldShould, queryFullMust, queryFullShould]
        let resultM = new Map<string, SigmaSearchResultEntry>();
        const execQueries = async function (queries: string[]): Promise<vscode.Hover> {
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

            const result = Array.from(resultM.values());
            result.sort((n1,n2) => {
                if (n1.score > n2.score) {
                    return -1;
                }
            
                if (n1.score < n2.score) {
                    return 1;
                }
            
                return 0;
            });

            let mds: Array<vscode.MarkdownString> = [];
            result.forEach((rule: SigmaSearchResultEntry) => {
                var s = "#### " + sanitizeHtml(rule.title, {allowedTags: [], allowedAttributes: {}}) + " - Significance: " + sanitizeHtml(rule.score.toFixed(2), {allowedTags: [], allowedAttributes: {}}) + ` - [SigmaHQ](` + sanitizeHtml(rule.url, {allowedTags: [], allowedAttributes: {}}) + `)` + "\n"
                s += sanitizeHtml(rule.description, {allowedTags: [], allowedAttributes: {}}) + "\n\n"
                let md = new vscode.MarkdownString(s)
                mds.push(md)
            });

            return new vscode.Hover(mds)
         }

        return execQueries(queries)
    }
}