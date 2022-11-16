import { privateEncrypt } from "crypto"
import * as vscode from "vscode"
import { debug, sigmacConfigs } from "./configuration"

export class SigmaLensProvider implements vscode.CodeLensProvider {
    // Each provider requires a provideCodeLenses function which will give the various documents
    // the code lenses
    async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        if (debug) {
            console.log("Providing Codelens")
        }
        const tagsSectionRE = new RegExp("^tags:\\s*$", "i")
        let lenses: vscode.CodeLens[] = []
        // Define where the CodeLens will exist
        for (let i = 0; i < document.lineCount; i++) {
            if (tagsSectionRE.exec(document.lineAt(i).text)) {
                let strRange = new vscode.Range(i, 0, i, 0)
                // Define what command we want to trigger when activating the CodeLens
                let sels = vscode.window.activeTextEditor?.selections
                let c: vscode.Command = {
                    command: "sigma.AddTag",
                    title: "Add Tag",
                }
                let codeLens = new vscode.CodeLens(strRange, c)
                lenses.push(codeLens)
            }
        }
        let cls
        if ((cls = this.prepSigmaCompiler())) {
            lenses = lenses.concat(cls)
        }
        return lenses
    }
    prepSigmaCompiler(): vscode.CodeLens[] | undefined {
        return sigmacConfigs?.map(config => {
            let strRange = new vscode.Range(0, 0, 0, 0)
            let c: vscode.Command = {
                command: "sigma.sigmaCompile",
                title: `${(config.tag && `[${config.tag}]`) || ""} Compile: ${config.target}`,
                arguments: [config, vscode.window.activeTextEditor?.document.uri.path],
            }
            let codeLens = new vscode.CodeLens(strRange, c)
            return codeLens
        })
    }
}
