// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import { SigmaSnippetCompletionItemProvider } from "./snippetProvider"
import { debug, setConfigs } from "./configuration"
import { subscribeToDocumentChanges } from "./diagnostics"
import { SigmaFixer } from "./actions"
import { provideHover } from "./hoverProvider"
import { SigmaLensProvider } from "./codeLensProvider"
import { SigmaSearchEngineCodeLensProvider } from "./codeLensProvider"
import { RelatedSigmaCodeLensProvider } from "./codeLensProvider"
import { addTagQuickpick, sigmaCompile, onEnterKey, lookup, related, openSigconverter } from "./commandProvider"

export var attackTags = require("./techniques.json")

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Setting VSCode Language
    setConfigs()
    if (debug) {
        console.log("Docs to check: ")
    }
    if (debug) {
        console.log(vscode.workspace.textDocuments.length)
    }
    vscode.workspace.textDocuments.forEach(doc => {
        if (debug) {
            console.log(doc.fileName)
        }
        if (doc.lineAt(0).text.match(/^title: .*$/)) {
            vscode.languages.setTextDocumentLanguage(doc, "sigma")
        }
    })

    // This Part Works fine. When opening a new file with "title:", sigma gets set as the Language
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.lineAt(0).text.match(/^title: .*$/)) {
                vscode.languages.setTextDocumentLanguage(doc, "sigma")
            }
        }),
    )

    const SIGMA: vscode.DocumentSelector = { language: "sigma", scheme: "file" }

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    if (debug) {
        console.log('Congratulations, your extension "sigma" is now active!')
    }
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("sigma.helloWorld", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage("Hello World from sigma!")
    })

    const snippetsDisposable: vscode.Disposable = vscode.languages.registerCompletionItemProvider(
        SIGMA,
        new SigmaSnippetCompletionItemProvider(),
    )
    context.subscriptions.push(snippetsDisposable)
    if (debug) {
        console.log("Registered snippet provider")
    }

    // Push Diagnostics
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("sigma", new SigmaFixer(), {
            providedCodeActionKinds: SigmaFixer.providedCodeActionKinds,
        }),
    )

    const sigmaDiagnostics = vscode.languages.createDiagnosticCollection("sigma")
    context.subscriptions.push(sigmaDiagnostics)

    subscribeToDocumentChanges(context, sigmaDiagnostics)

    context.subscriptions.push(
        vscode.commands.registerCommand("sigma.wikiSpecification", () =>
            vscode.env.openExternal(vscode.Uri.parse("https://github.com/SigmaHQ/sigma/wiki/Specification")),
        ),
    )
    context.subscriptions.push(disposable)
    vscode.languages.registerHoverProvider(SIGMA, { provideHover: provideHover })

    context.subscriptions.push(vscode.commands.registerCommand("sigma.lookup", lookup))
    context.subscriptions.push(vscode.commands.registerCommand("sigma.related", related))

    context.subscriptions.push(vscode.commands.registerCommand("sigma.AddTag", addTagQuickpick))
    context.subscriptions.push(vscode.commands.registerCommand("sigma.sigmaCompile", sigmaCompile))
    context.subscriptions.push(vscode.commands.registerCommand("sigma.OpenSigConverter", openSigconverter))

    context.subscriptions.push(vscode.commands.registerCommand("sigma.onEnterKey", onEnterKey))
    context.subscriptions.push(
        vscode.commands.registerCommand("sigma.onCtrlEnterKey", () => {
            return onEnterKey("ctrl")
        }),
    )
    context.subscriptions.push(
        vscode.commands.registerCommand("sigma.onShiftEnterKey", () => {
            return onEnterKey("shift")
        }),
    )

    let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(SIGMA, new SigmaLensProvider())
    context.subscriptions.push(codeLensProviderDisposable)
    codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(SIGMA, new SigmaSearchEngineCodeLensProvider())
    context.subscriptions.push(codeLensProviderDisposable)
    codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(SIGMA, new RelatedSigmaCodeLensProvider())
    context.subscriptions.push(codeLensProviderDisposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
