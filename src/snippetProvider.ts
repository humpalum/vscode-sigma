"use strict"

import * as vscode from "vscode"
import { debug } from "./configuration"

const configName = "sigma"

function generateUUIDSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'UUID' snippet")
    }
    const tabs = "\t".repeat(numTabs)
    snippet.appendText(`id: `)
    snippet.appendVariable("UUID", "Could not generate UUID")
    return snippet
}

function generateRelatedSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'related' snippet")
    }
    snippet.appendText("related:\n")
    snippet.appendText("\t- id: \n")
    snippet.appendText("\t  type: ")
    snippet.appendChoice(["derived", "merged", "obsolete", "renamed", "similar"])
    return snippet
}

function generateStatusSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'status' snippet")
    }
    snippet.appendText(`status: `)
    snippet.appendChoice(["experimental", "test", "stable", "deprecated", "unsupported"])
    return snippet
}
function generateAuthorSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'author' snippet")
    }
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configName)
    const author: string = config.get("author")!
    snippet.appendText("author: ")
    snippet.appendText(author)
    return snippet
}
function generateDateSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'date' snippet")
    }
    snippet.appendText("date: ")
    generateTodaySnippet(snippet)
    return snippet
}

function generateModifiedSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'modified' snippet")
    }
    snippet.appendText("modified: ")
    generateTodaySnippet(snippet)
    return snippet
}

function generateTodaySnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'today' snippet")
    }
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configName)
    const dateformat: string = config.get("dateformat")!
    const date: Date = new Date()
    const year: string = date.getFullYear().toString()
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0')
    const day: string = date.getDate().toString().padStart(2, '0')
    snippet.appendText(dateformat.replace('YYYY', year).replace('MM', month).replace('DD', day))
    return snippet
}

function generateReferencesSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'references' snippet")
    }
    snippet.appendText("references:\n")
    snippet.appendText("\t- ")
    // Sadly, CLIPBOARD Variable doesnt work from here. TODO: Open Issue in vscode repo
    snippet.appendVariable("CLIPBOARD/(^http.+){0,1}.*/$1/s", "")
    //snippet.appendVariable('CLIPBOARD', "");
    return snippet
}

function generateTagsSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'tags' snippet")
    }
    snippet.appendText("tags:\n")
    snippet.appendText("\t- ")
    return snippet
}

function generateLogsourceSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'logsource' snippet")
    }
    snippet.appendText("logsource:\n")
    // TODO Choices for each
    snippet.appendText("\t")
    generateCategorySnippet(snippet)
    snippet.appendText("\n")
    snippet.appendText("\t")
    generateProductSnippet(snippet)
    snippet.appendText("\n")
    snippet.appendText("\t")
    generateServiceSnippet(snippet)
    return snippet
}

function generateCategorySnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'category' snippet")
    }
    snippet.appendText("category: ")
    // TODO Choices for each
    snippet.appendChoice([
        "antivirus",
        "application",
        "create_remote_thread",
        "create_stream_hash",
        "database",
        "dns_query",
        "dns",
        "driver_load",
        "file_access",
        "file_change",
        "file_delete",
        "file_event",
        "file_rename",
        "firewall",
        "image_load",
        "network_connection",
        "pipe_created",
        "process_access",
        "process_creation",
        "process_tampering",
        "proxy",
        "ps_classic_start",
        "ps_module",
        "ps_script",
        "raw_access_thread",
        "registry_add",
        "registry_delete",
        "registry_event",
        "registry_rename",
        "registry_set",
        "webserver",
        "wmi_event",
    ])
    return snippet
}

function generateProductSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'product' snippet")
    }
    snippet.appendText("product: ")
    snippet.appendChoice([
        "aws",
        "azure",
        "cisco",
        "gcp",
        "github",
        "huawei",
        "juniper",
        "linux",
        "m365",
        "macos",
        "okta",
        "onelogin",
        "spring",
        "windows",
        "zeek",
    ])
    return snippet
}

function generateServiceSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'service' snippet")
    }
    snippet.appendText("service: ")
    snippet.appendChoice([
        "activitylogs",
        "audit",
        "auditd",
        "auditlogs",
        "cloudtrail",
        "gcp.audit",
        "google_workspace.admin",
        "netflow",
        "okta",
        "pim",
        "riskdetection",
        "security",
        "signinlogs",
        "sshd",
        "syslog",
        "threat_management",
    ])
    return snippet
}

function generateDetectionSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'detection' snippet")
    }
    snippet.appendText("detection:\n")
    snippet.appendText("\tselection:\n")
    snippet.appendText("\t\t")
    snippet.appendTabstop()
    snippet.appendText("\n\tcondition: selection")
    return snippet
}

function generateLevelSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'level' snippet")
    }
    snippet.appendText("level: ")
    snippet.appendChoice(["critical", "high", "medium", "low", "informational"])
    return snippet
}

function generateTitleSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'title' snippet")
    }
    snippet.appendText("title:")
    snippet.appendVariable("TM_FILENAME_BASE/(^.[^_]+)|_([^_]+)/ ${1:/capitalize}${2:/capitalize}/gi", "")
    return snippet
}

function generateFalsePositves(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'falsepositives' snippet")
    }
    snippet.appendText("falsepositives:\n")
    snippet.appendText("\t- ")
    snippet.appendChoice([
        "Unknown",
        "Unlikely",
        "Software installation",
        "Legitimate administrative activities",
        "Legitimate PowerShell scripts",
        "Vulnerability Scanners",
    ])

    return snippet
}

function generateRuleSnippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'newRule' snippet")
    }
    generateTitleSnippet(snippet)
    snippet.appendText("\n")
    generateUUIDSnippet(snippet)
    snippet.appendText("\n")
    snippet.appendText("status: experimental")
    snippet.appendText("\n")
    snippet.appendText("description: Detects ")
    snippet.appendText("\n")
    generateReferencesSnippet(snippet)
    snippet.appendText("\n")
    generateAuthorSnippet(snippet)
    snippet.appendText("\n")
    generateDateSnippet(snippet)
    snippet.appendText("\n")
    generateTagsSnippet(snippet)
    snippet.appendText("\n")
    generateLogsourceSnippet(snippet)
    snippet.appendText("\n")
    generateDetectionSnippet(snippet)
    snippet.appendText("\n")
    generateFalsePositves(snippet)
    snippet.appendText("\n")
    generateLevelSnippet(snippet)
    snippet.appendText("\n")
    return snippet
}

function generateCorrelation_event_count_Snippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'correlation - event_count' snippet")
    }
    snippet.appendText("correlation:\n")
    snippet.appendText("\ttype: event_count\n")
    snippet.appendText("\trules:\n")
    snippet.appendText("\tgroup-by:\n")
    snippet.appendText("\ttimespan:\n")
    snippet.appendText("\tcondition:")

    return snippet
}
function generateCorrelation_value_count_Snippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'correlation - value_count' snippet")
    }
    snippet.appendText("correlation:\n")
    snippet.appendText("\ttype: value_count\n")
    snippet.appendText("\trules:\n")
    snippet.appendText("\tgroup-by:\n")
    snippet.appendText("\ttimespan:\n")
    snippet.appendText("\tcondition:\n")
    snippet.appendText("\t\tfield:")

    return snippet
}
function generateCorrelation_temporal_Snippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'correlation - temporal' snippet")
    }
    snippet.appendText("correlation:\n")
    snippet.appendText("\ttype: temporal\n")
    snippet.appendText("\trules:\n")
    snippet.appendText("\tgroup-by:\n")
    snippet.appendText("\ttimespan:\n")
    snippet.appendText("\tcondition:")

    return snippet
}
function generateCorrelation_temporal_ordered_Snippet(
    snippet: vscode.SnippetString = new vscode.SnippetString(),
    numTabs = 0,
): vscode.SnippetString {
    if (debug) {
        console.log("SigmaSnippetCompletionItemProvider: Generating 'correlation - temporal_ordered' snippet")
    }
    snippet.appendText("correlation:\n")
    snippet.appendText("\ttype: temporal_ordered\n")
    snippet.appendText("\trules:\n")
    snippet.appendText("\tgroup-by:\n")
    snippet.appendText("\ttimespan:\n")
    snippet.appendText("\tcondition:")

    return snippet
}

export class SigmaSnippetCompletionItemProvider implements vscode.CompletionItemProvider {
    private generateBasicItems(): vscode.CompletionList {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(configName)
        const items: vscode.CompletionList = new vscode.CompletionList()

        const newRuleItem: vscode.CompletionItem = new vscode.CompletionItem(
            "newrule",
            vscode.CompletionItemKind.Snippet,
        )
        newRuleItem.detail = "Generate a new rule (sigma)"
        newRuleItem.insertText = new vscode.SnippetString("title:\nid:\n...")
        newRuleItem.documentation = new vscode.MarkdownString("")
        newRuleItem.documentation.appendCodeblock("title:\nid:\n...")
        items.items.push(newRuleItem)

        const newTitleItem: vscode.CompletionItem = new vscode.CompletionItem(
            "title: ",
            vscode.CompletionItemKind.Snippet,
        )
        newTitleItem.detail = "Generate a title (sigma)"
        newTitleItem.insertText = new vscode.SnippetString("title: ")
        newTitleItem.documentation = new vscode.MarkdownString("")
        newTitleItem.documentation.appendCodeblock("title: ")
        items.items.push(newTitleItem)

        const uuidItem: vscode.CompletionItem = new vscode.CompletionItem("id: ", vscode.CompletionItemKind.Snippet)
        uuidItem.detail = "Generate a new uuid (sigma)"
        uuidItem.insertText = new vscode.SnippetString("id: {$UUID}")
        uuidItem.documentation = new vscode.MarkdownString("Generates new uuid")
        uuidItem.documentation.appendCodeblock("id: {$UUID}")
        items.items.push(uuidItem)

        const statusItem: vscode.CompletionItem = new vscode.CompletionItem(
            "status: ",
            vscode.CompletionItemKind.Snippet,
        )
        statusItem.detail = "Generate a new status (sigma)"
        statusItem.insertText = new vscode.SnippetString("status: experimental")
        statusItem.documentation = new vscode.MarkdownString("Generates status string")
        statusItem.documentation.appendCodeblock("status: [choice]")
        items.items.push(statusItem)

        const relatedItem: vscode.CompletionItem = new vscode.CompletionItem(
            "related: ",
            vscode.CompletionItemKind.Snippet,
        )
        relatedItem.detail = "Generate a new related (sigma)"
        relatedItem.insertText = new vscode.SnippetString("related: ")
        relatedItem.documentation = new vscode.MarkdownString("Generates related string")
        relatedItem.documentation.appendCodeblock("related: \n\t- id: \n\t  type:")
        items.items.push(relatedItem)

        const tagItem: vscode.CompletionItem = new vscode.CompletionItem("tags: ", vscode.CompletionItemKind.Snippet)
        tagItem.detail = "Generate a new tags section (sigma)"
        tagItem.insertText = new vscode.SnippetString("tags: ")
        tagItem.documentation = new vscode.MarkdownString("Generates tags section")
        tagItem.documentation.appendCodeblock("tags: \n\t- ")
        items.items.push(tagItem)

	const categoryItem: vscode.CompletionItem = new vscode.CompletionItem(
            "category: ",
            vscode.CompletionItemKind.Snippet,
        )
        categoryItem.detail = "Generate a new category section (sigma)"
        categoryItem.insertText = new vscode.SnippetString("category: ")
        categoryItem.documentation = new vscode.MarkdownString("Generates category section")
        categoryItem.documentation.appendCodeblock("category: ")
        items.items.push(categoryItem)

	const productItem: vscode.CompletionItem = new vscode.CompletionItem(
            "product: ",
            vscode.CompletionItemKind.Snippet,
        )
        productItem.detail = "Generate a new product section (sigma)"
        productItem.insertText = new vscode.SnippetString("product: ")
        productItem.documentation = new vscode.MarkdownString("Generates product section")
        productItem.documentation.appendCodeblock("product: ")
        items.items.push(productItem)

        const serviceItem: vscode.CompletionItem = new vscode.CompletionItem(
            "service: ",
            vscode.CompletionItemKind.Snippet,
        )
        serviceItem.detail = "Generate a new service section (sigma)"
        serviceItem.insertText = new vscode.SnippetString("service: ")
        serviceItem.documentation = new vscode.MarkdownString("Generates service section")
        serviceItem.documentation.appendCodeblock("service: ")
        items.items.push(serviceItem)

        const authorItem: vscode.CompletionItem = new vscode.CompletionItem(
            "author: ",
            vscode.CompletionItemKind.Snippet,
        )
        authorItem.detail = "Generate a new author (sigma)"
        authorItem.insertText = new vscode.SnippetString("author: ")
        authorItem.documentation = new vscode.MarkdownString(
            "Generates Author. \nSet your name in the sigma.Author config",
        )
        authorItem.documentation.appendCodeblock("author: [choice]")
        items.items.push(authorItem)

        const dateItem: vscode.CompletionItem = new vscode.CompletionItem("date: ", vscode.CompletionItemKind.Snippet)
        dateItem.detail = "Generate a new date (sigma)"
        dateItem.insertText = new vscode.SnippetString("date: ")
        dateItem.documentation = new vscode.MarkdownString("Generates date")
        dateItem.documentation.appendCodeblock("date: <Today>")
        items.items.push(dateItem)

        const modifiedDateItem: vscode.CompletionItem = new vscode.CompletionItem(
            "modified: ",
            vscode.CompletionItemKind.Snippet,
        )
        modifiedDateItem.detail = "Generate a new modified date (sigma)"
        modifiedDateItem.insertText = new vscode.SnippetString("modified: ")
        modifiedDateItem.documentation = new vscode.MarkdownString("Generates modified date")
        modifiedDateItem.documentation.appendCodeblock("modified: <Today>")
        items.items.push(modifiedDateItem)

        // TODO: Using json references for now, as the Clipboard works there.
        //const referencesItem: vscode.CompletionItem = new vscode.CompletionItem('references: ', vscode.CompletionItemKind.Snippet);
        //referencesItem.detail = 'Generate referneces (sigma)';
        //referencesItem.insertText = new vscode.SnippetString('references:\n\t- ');
        //referencesItem.documentation = new vscode.MarkdownString('Generates references');
        //referencesItem.documentation.appendCodeblock('references:\n\t- ');
        //items.items.push(referencesItem);

        const logsourceItem: vscode.CompletionItem = new vscode.CompletionItem(
            "logsource: ",
            vscode.CompletionItemKind.Snippet,
        )
        logsourceItem.detail = "Generate logsource (sigma)"
        logsourceItem.insertText = new vscode.SnippetString("logsource:\n\tcategory: \n\tproduct: ")
        logsourceItem.documentation = new vscode.MarkdownString("Generates logsource")
        logsourceItem.documentation.appendCodeblock("logsource:\n\tcategory: \n\tproduct: ")
        items.items.push(logsourceItem)

        const detectionItem: vscode.CompletionItem = new vscode.CompletionItem(
            "detection: ",
            vscode.CompletionItemKind.Snippet,
        )
        detectionItem.detail = "Generate detection (sigma)"
        detectionItem.insertText = new vscode.SnippetString("detection: ")
        detectionItem.documentation = new vscode.MarkdownString("Generates detection")
        detectionItem.documentation.appendCodeblock("detection: ")
        items.items.push(detectionItem)

        const levelItem: vscode.CompletionItem = new vscode.CompletionItem("level: ", vscode.CompletionItemKind.Snippet)
        levelItem.detail = "Generate level (sigma)"
        levelItem.insertText = new vscode.SnippetString("level: ")
        levelItem.documentation = new vscode.MarkdownString("Generates level")
        levelItem.documentation.appendCodeblock("level: [choice]")
        items.items.push(levelItem)

        const falsepositiveItem: vscode.CompletionItem = new vscode.CompletionItem(
            "falsepositives: ",
            vscode.CompletionItemKind.Snippet,
        )
        falsepositiveItem.detail = "Generate falsepositives (sigma)"
        falsepositiveItem.insertText = new vscode.SnippetString("falsepositives: ")
        falsepositiveItem.documentation = new vscode.MarkdownString("Generates falsepositives")
        falsepositiveItem.documentation.appendCodeblock("falsepositives: [choice]")
        items.items.push(falsepositiveItem)

        const corEventCountItem: vscode.CompletionItem = new vscode.CompletionItem(
            "correlation: type: event_count",
            vscode.CompletionItemKind.Snippet,
        )
        corEventCountItem.detail = "Generate Correlation EventCount (sigma)"
        corEventCountItem.insertText = new vscode.SnippetString("correlation: ")
        corEventCountItem.documentation = new vscode.MarkdownString("Generates correlation event count")
        corEventCountItem.documentation.appendCodeblock(
            "correlation:\n\ttype: event_count\nrules:\n\tgroup-by:\n\ttimespan:\n\tcondition:",
        )
        items.items.push(corEventCountItem)

        const corValueCountItem: vscode.CompletionItem = new vscode.CompletionItem(
            "correlation: type: value_count",
            vscode.CompletionItemKind.Snippet,
        )
        corValueCountItem.detail = "Generate Correlation ValueCount (sigma)"
        corValueCountItem.insertText = new vscode.SnippetString("correlation: ")
        corValueCountItem.documentation = new vscode.MarkdownString("Generates correlation value count")
        corValueCountItem.documentation.appendCodeblock(
            "correlation:\n\ttype: value_count\nrules:\n\tgroup-by:\n\ttimespan:\n\tcondition:\n\t\tfield:",
        )
        items.items.push(corValueCountItem)

        const corTemporalItem: vscode.CompletionItem = new vscode.CompletionItem(
            "correlation: type: temporal",
            vscode.CompletionItemKind.Snippet,
        )
        corTemporalItem.detail = "Generate Correlation Temporal (sigma)"
        corTemporalItem.insertText = new vscode.SnippetString("correlation: ")
        corTemporalItem.documentation = new vscode.MarkdownString("Generates correlation temporal")
        corTemporalItem.documentation.appendCodeblock(
            "correlation:\n\ttype: temporal\nrules:\n\tgroup-by:\n\ttimespan:\n\tcondition:",
        )
        items.items.push(corTemporalItem)

        const corTemporalOrderedItem: vscode.CompletionItem = new vscode.CompletionItem(
            "correlation: type: temporal_ordered",
            vscode.CompletionItemKind.Snippet,
        )
        corTemporalOrderedItem.detail = "Generate Correlation Temporal Ordered (sigma)"
        corTemporalOrderedItem.insertText = new vscode.SnippetString("correlation: ")
        corTemporalOrderedItem.documentation = new vscode.MarkdownString("Generates correlation temporal ordered")
        corTemporalOrderedItem.documentation.appendCodeblock(
            "correlation:\n\ttype: temporal_ordered\nrules:\n\tgroup-by:\n\ttimespan:\n\tcondition:",
        )
        items.items.push(corTemporalOrderedItem)

        if (debug) {
            console.log(`SigmaSnippetCompletionItemProvider: Generated ${items.items.length} snippets`)
        }
        return items
    }

    public provideCompletionItems(
        doc: vscode.TextDocument,
        pos: vscode.Position,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.CompletionList> {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(() => {
                if (debug) {
                    console.log("SigmaSnippetCompletionItemProvider: Task cancelled!")
                }
                resolve(undefined)
            })
            try {
                const items: vscode.CompletionList = this.generateBasicItems()
                console.log(`SigmaSnippetCompletionItemProvider: Generated ${items.items.length} snippets`)
                resolve(items)
            } catch (error) {
                console.log(`SigmaSnippetCompletionItemProvider error: ${error}`)
                reject()
            }
        })
    }

    public resolveCompletionItem(
        item: vscode.CompletionItem,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.CompletionItem> {
        return new Promise(resolve => {
            token.onCancellationRequested(resolve)
            let snippet: vscode.SnippetString | string = item.insertText || ""
            switch (item.label) {
                case "newrule":
                    snippet = generateRuleSnippet()
                    break
                case "title: ":
                    snippet = generateTitleSnippet()
                    break
                case "id: ":
                    snippet = generateUUIDSnippet()
                    break
                case "related: ":
                    snippet = generateRelatedSnippet()
                    break
                case "tags: ":
                    snippet = generateTagsSnippet()
                    break
                case "category: ":
                    snippet = generateCategorySnippet()
                    break
                case "product: ":
                    snippet = generateProductSnippet()
                    break
                case "service: ":
                    snippet = generateServiceSnippet()
                    break
                case "status: ":
                    snippet = generateStatusSnippet()
                    break
                case "author: ":
                    snippet = generateAuthorSnippet()
                    break
                case "date: ":
                    snippet = generateDateSnippet()
                    break
                case "modified: ":
                    snippet = generateModifiedSnippet()
                    break
                // TODO: Using json references for now, as the Clipboard works there.
                //case 'references: ':
                //    snippet = generateReferencesSnippet();
                //    break;
                case "logsource: ":
                    snippet = generateLogsourceSnippet()
                    break
                case "detection: ":
                    snippet = generateDetectionSnippet()
                    break
                case "level: ":
                    snippet = generateLevelSnippet()
                    break
                case "falsepositives: ":
                    snippet = generateFalsePositves()
                    break
                case "correlation: type: event_count":
                    snippet = generateCorrelation_event_count_Snippet()
                    break
                case "correlation: type: value_count":
                    snippet = generateCorrelation_value_count_Snippet()
                    break
                case "correlation: type: temporal":
                    snippet = generateCorrelation_temporal_Snippet()
                    break
                case "correlation: type: temporal_ordered":
                    snippet = generateCorrelation_temporal_ordered_Snippet()
                    break
                default:
                    console.log(`Unrecognizable snippet: ${item.label} => ${JSON.stringify(item)}`)
                    break
            }
            item.insertText = snippet
            item.documentation = new vscode.MarkdownString("")
            if (snippet instanceof vscode.SnippetString) {
                item.documentation.appendCodeblock(snippet.value.trim(), "sigma")
            } else {
                item.documentation.appendCodeblock(snippet.trim(), "sigma")
            }
            resolve(item)
        })
    }
}
