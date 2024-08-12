import { Console } from "console"
import * as vscode from "vscode"
import * as YAML from "yaml"
import { attackTags } from "./extension"
import { debug } from "./configuration"
import { privateEncrypt } from "crypto"

/**
 * Analyzes the text document for problems.
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param sigmaDiagnostics diagnostic collection
 */
export function refreshDiagnostics(doc: vscode.TextDocument, sigmaDiagnostics: vscode.DiagnosticCollection): void {
    if (debug) {
        console.log("Providing Dias")
    }
    let diagnostics: vscode.Diagnostic[] = []
    if (doc.languageId === "sigma") {
        let tmpDias
        let sigmaRule
        try {
            sigmaRule = YAML.parse(doc.getText())
        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                diagnostics.push(
                    new vscode.Diagnostic(
                        new vscode.Range(doc.positionAt((error as any).pos[0]), doc.positionAt((error as any).pos[1])),
                        error.message,
                        vscode.DiagnosticSeverity.Error,
                    ),
                )
            }
        }
        if (sigmaRule) {
            tmpDias = testSigmaTags(sigmaRule, doc)
            if (tmpDias) {
                diagnostics = diagnostics.concat(tmpDias)
            }
            tmpDias = testSigmaDetection(sigmaRule, doc)
            if (tmpDias) {
                diagnostics = diagnostics.concat(tmpDias)
            }
            tmpDias = testMeta(sigmaRule, doc)
            if (tmpDias) {
                diagnostics = diagnostics.concat(tmpDias)
            }
            tmpDias = testOther(sigmaRule, doc)
            if (tmpDias) {
                diagnostics = diagnostics.concat(tmpDias)
            }
        }

        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex)
            // Check for Errors Here
            // Check modifiers
            if (lineOfText.text.includes("contains|")) {
                if (!lineOfText.text.includes("contains|all:")) {
                    diagnostics.push(creatDiaContainsInMiddle(doc, lineOfText, lineIndex))
                }
            }
            if (lineOfText.text.includes("|all:")) {
                if (!lineOfText.text.match(/\|all:\s*$/)) {
                    diagnostics.push(creatDiaSingleAll(doc, lineOfText, lineIndex))
                }
            }
            if (lineOfText.text.match(/^title:.{71,}/)) {
                diagnostics.push(creatDiaTitleTooLong(doc, lineOfText, lineIndex))
            }
            if (lineOfText.text.match(/^description:.{0,32}$/)) {
                if (!lineOfText.text.match(/^description:\s+\|\s*$/)) {
                    diagnostics.push(creatDiaDescTooShort(doc, lineOfText, lineIndex))
                }
            }
            if (lineOfText.text.match(/[\s]+$/)) {
                diagnostics.push(creatDiaTrailingWhitespace(doc, lineOfText, lineIndex))
            }
        }
    }
    sigmaDiagnostics.set(doc.uri, diagnostics)
}
function creatDiaSingleAll(
    doc: vscode.TextDocument,
    lineOfText: vscode.TextLine,
    lineIndex: number,
): vscode.Diagnostic {
    // find where in the line the 'contains' is mentioned
    const index = lineOfText.text.indexOf("|all")
    let indexLength = "|all".length

    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, index + indexLength)

    const diagnostic = new vscode.Diagnostic(
        range,
        'Modifier: "|all" may not be a single entry',
        vscode.DiagnosticSeverity.Warning,
    )
    diagnostic.code = "sigma_AllSingle"
    return diagnostic
}

function creatDiaContainsInMiddle(
    doc: vscode.TextDocument,
    lineOfText: vscode.TextLine,
    lineIndex: number,
): vscode.Diagnostic {
    // find where in the line the 'contains' is mentioned
    const index = lineOfText.text.indexOf("contains|")
    let indexLength = "contains|".length
    let regexMatch = lineOfText.text.match("contains.+:")
    if (regexMatch) {
        indexLength = regexMatch[0].length
    } else {
        regexMatch = lineOfText.text.match("contains.+$")
        if (regexMatch) {
            indexLength = regexMatch[0].length
        }
    }
    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, index + indexLength)

    const diagnostic = new vscode.Diagnostic(
        range,
        "Contains should only be at the end of modifiers",
        vscode.DiagnosticSeverity.Warning,
    )
    diagnostic.code = "sigma_containsMiddle"
    return diagnostic
}

function creatDiaTrailingWhitespace(
    doc: vscode.TextDocument,
    lineOfText: vscode.TextLine,
    lineIndex: number,
): vscode.Diagnostic {
    // create range that represents, where in the document the word is
    let match
    let range = lineOfText.range
    if ((match = lineOfText.text.match(/([\s]+$)/))) {
        let l = match[0].length
        range = new vscode.Range(lineIndex, lineOfText.text.length - l, lineIndex, lineOfText.text.length)
    }

    const diagnostic = new vscode.Diagnostic(range, "Trailing Whitespaces", vscode.DiagnosticSeverity.Information)
    diagnostic.code = "sigma_trailingWhitespace"

    return diagnostic
}
function creatDiaTitleTooLong(
    doc: vscode.TextDocument,
    lineOfText: vscode.TextLine,
    lineIndex: number,
): vscode.Diagnostic {
    // create range that represents, where in the document the word is
    const range = lineOfText.range

    const diagnostic = new vscode.Diagnostic(
        range,
        "Title is too long. Please consider shortening it",
        vscode.DiagnosticSeverity.Warning,
    )
    diagnostic.code = "sigma_TitleTooLong"
    return diagnostic
}

function creatDiaDescTooShort(
    doc: vscode.TextDocument,
    lineOfText: vscode.TextLine,
    lineIndex: number,
): vscode.Diagnostic {
    // create range that represents, where in the document the word is
    const range = lineOfText.range

    const diagnostic = new vscode.Diagnostic(
        range,
        "Description is too short. Please elaborate",
        vscode.DiagnosticSeverity.Warning,
    )
    diagnostic.code = "sigma_DescTooShort"
    return diagnostic
}
export function subscribeToDocumentChanges(
    context: vscode.ExtensionContext,
    sigmaDiagnostics: vscode.DiagnosticCollection,
): void {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, sigmaDiagnostics)
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(editor.document, sigmaDiagnostics)
            }
        }),
    )

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, sigmaDiagnostics)),
    )

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => sigmaDiagnostics.delete(doc.uri)))
}

function testSigmaTags(rule: any, doc: vscode.TextDocument): vscode.Diagnostic[] | undefined {
    try {
        var tagsPattern = /cve\.\d+\.\d+|attack\.t\d+\.*\d*|attack\.[a-z_]+|d3fend\.[a-z_]+|car\.\d{4}-\d{2}-\d{3}|tlp\.|detection\.|stp\./
        let knowntags: string[] = []
        var diagnostics = rule.tags
            .map((tag: string) => {
                let tagDias: vscode.Diagnostic[] = []
                // Check with tag Pattern (Prefix)
                if (!tagsPattern.test(tag)) {
                    var range = getRangeOfString(tag, doc)
                    if (range) {
                        tagDias.push(new vscode.Diagnostic(range, "Bad Tag", vscode.DiagnosticSeverity.Warning))
                    }
                }
                // Check if Tag is Duplicate
                if (knowntags.includes(tag)) {
                    var range = getRangeOfString(tag, doc)
                    if (range) {
                        tagDias.push(new vscode.Diagnostic(range, "Duplicate Tag", vscode.DiagnosticSeverity.Warning))
                    }
                }
                knowntags.push(tag)
                // Check if Tag is exists
                let tagExists = false
                attackTags.map((tag2: any) => {
                    if (tag.toLowerCase() === "attack." + tag2["tag"].toLowerCase()) {
                        tagExists = true
                    }
                    if (tag2["tag"].toLowerCase().match(/^ta.*/)) {
                        // Check actual name instead
                        let testTag = "attack." + tag2["name"].replace(/\s/g, "_").toLocaleLowerCase()
                        if (tag === testTag) {
                            tagExists = true
                        }
                    }
                })
                if (tagExists === false && tag.startsWith("attack.")) {
                    var range = getRangeOfString(tag, doc)
                    if (range) {
                        tagDias.push(new vscode.Diagnostic(range, "Unknown Tag", vscode.DiagnosticSeverity.Warning))
                    }
                }
                return tagDias
            })
            .flat() //Remove unidentified elements
            .filter(function (element: any) {
                return element !== undefined
            })
        diagnostics = diagnostics.concat(
            rule.tags
                .map((tag: string) => {}) //Remove unidentified elements
                .filter(function (element: any) {
                    return element !== undefined
                }),
        )
        return diagnostics
    } catch (error) {
        if (debug) {
            console.log("Something went wrong testing Tags:")
            console.log(error)
        }
    }
}

function testSigmaDetection(rule: any, doc: vscode.TextDocument): vscode.Diagnostic[] | undefined {
    try {
        var diagnostics: vscode.Diagnostic[] = []
        // Check Duplicates
        function checkListRecursive(cur: any, depth: number): vscode.Diagnostic | undefined {
            if (depth > 3) {
                return
            }
            if (!cur){
                // Empty Value, maybe set "EMPTY VALUE Diagnostic?"
                return
            }

            if (cur.constructor !== Object) {
                if (Array.isArray(cur)) {
                    if (cur.length !== [new Set(cur)].length) {
                        let duplicates = cur.filter((item: string, index: Number) => {
                            let dupl = false
                            cur.forEach((item2: string, index2: Number) => {
                                if (item.toLocaleLowerCase() === item2.toLocaleLowerCase() && index !== index2) {
                                    dupl = true
                                }
                            })
                            return dupl
                        })
                        duplicates.map((item: string) => {
                            var range = getRangeOfString(item, doc)
                            if (range) {
                                diagnostics.push(
                                    new vscode.Diagnostic(range, "Duplicate Value", vscode.DiagnosticSeverity.Warning),
                                )
                            }
                        })
                    }
                }
            }
            if (cur.constructor === Object) {
                Object.values(cur).map((next: any) => {
                    checkListRecursive(next, depth + 1)
                })
            }
        }
        checkListRecursive(rule.detection, 0)

        // Check Single named condition with x of them
        if (rule.detection.condition.includes("them") && Object.keys(rule.detection).length === 2) {
            var range = getRangeOfString(rule.detection.condition, doc)
            if (range) {
                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        "Using '1/all of them' style condition but only has one condition",
                        vscode.DiagnosticSeverity.Warning,
                    ),
                )
            }
        }

        // Check "all of them"
        if (rule.detection.condition.includes("all of them")) {
            var range = getRangeOfString(rule.detection.condition, doc)
            if (range) {
                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        "Better use e.g. 'all of selection*' instead (and use the 'selection_' prefix as search-identifier).",
                        vscode.DiagnosticSeverity.Warning,
                    ),
                )
            }
        }

        return diagnostics
    } catch (error) {
        console.log("Something went wrong checking duplicate Filters:")
        console.log(error)
    }
}

function testMeta(rule: any, doc: vscode.TextDocument): vscode.Diagnostic[] | undefined {
    try {
        var diagnostics: vscode.Diagnostic[] = []
        function recursiveChecks(cur: any, depth: number) {
            if (cur.constructor === Object) {
                // Check if any Key contains a space
                Object.keys(cur).map((k: string) => {
                    if (/\s/.test(k)) {
                        var range = getRangeOfString(k, doc)
                        if (range) {
                            diagnostics.push(
                                new vscode.Diagnostic(range, "Space in Key", vscode.DiagnosticSeverity.Warning),
                            )
                        }
                    }
                })
            }

            // Recursive check all dicts
            if (cur.constructor === Object) {
                Object.values(cur).map((next: any) => {
                    if (next) {
                        recursiveChecks(next, depth + 1)
                    }
                })
            }
        }
        recursiveChecks(rule, 0)

        // Check if ID is good
        if (!("id" in rule)) {
            diagnostics.push(
                new vscode.Diagnostic(
                    new vscode.Range(0, 0, 100, 0),
                    "Rule needs ID Field",
                    vscode.DiagnosticSeverity.Warning,
                ),
            )
        }
        if (!rule.id) {
            range = getRangeOfString("id:", doc)
            if (range) {
                diagnostics.push(
                    new vscode.Diagnostic(range, "ID field cant be empty", vscode.DiagnosticSeverity.Warning),
                )
            }
        } else if (rule.id.length !== 36) {
            var range = getRangeOfString("id: " + rule.id, doc)
            if (rule.id.length === 0) {
                range = getRangeOfString("id:", doc)
            }
            if (range) {
                diagnostics.push(new vscode.Diagnostic(range, "Malformed ID", vscode.DiagnosticSeverity.Warning))
            }
        }
        // Check Related Field
        let validRelType = ["derived", "obsoletes", "merged", "renamed", "similar"]
        if (rule.related) {
            if (!Array.isArray(rule.related)) {
                var range = getRangeOfString("related:", doc)
                if (range) {
                    diagnostics.push(
                        new vscode.Diagnostic(range, "Related needs to be a List", vscode.DiagnosticSeverity.Warning),
                    )
                }
            } else {
                rule.related.map((rel: any) => {
                    if (!validRelType.includes(rel.type)) {
                        var range = getRangeOfString(rel.type, doc)
                        if (range) {
                            diagnostics.push(
                                new vscode.Diagnostic(
                                    range,
                                    "Unknown Related Type - Allowed: derived, obsoletes, merged, renamed, similar",
                                    vscode.DiagnosticSeverity.Warning,
                                ),
                            )
                        }
                    }
                })
            }
        }
        //
        return diagnostics
    } catch (error) {
        console.log("Something went wrong while testing Meta Infos:")
        console.log(error)
    }
}

function testOther(rule: any, doc: vscode.TextDocument): vscode.Diagnostic[] | undefined {
    try {
        var diagnostics: vscode.Diagnostic[] = []

        // Sysmon old Event IDs
        if (/EventID: (?:1|4688)\s*\n/gm.test(doc.getText().toString())) {
            var range = getRangeOfString("EventID: 1", doc)
            if (!range) {
                range = getRangeOfString("EventID: 4688", doc)
            }
            if (range) {
                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        "Dont useSysmon Event ID 1 or Event ID 4688. Please migrate to the process_creation category",
                        vscode.DiagnosticSeverity.Warning,
                    ),
                )
            }
        }
        return diagnostics
    } catch (error) {
        console.log("Something went wrong while testing Other stuff:")
        console.log(error)
    }
}
function getRangeOfString(str: string, doc: vscode.TextDocument): vscode.Range | undefined {
    const index = doc.getText().toString().indexOf(str)
    if (index !== -1) {
        let posA = doc.positionAt(index)
        let posB = doc.positionAt(index + `${str}`.length)
        return new vscode.Range(posA, posB)
    }
    return
}
