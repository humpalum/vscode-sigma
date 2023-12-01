"use strict"

import * as vscode from "vscode"

export const configSection = "sigma"
export let sigmacConfigs: any[] | undefined
export let sigmasearchengineURL: any[] | undefined
export let sigconverterUrl = "https://sigconverter.io/"
export let debug = false

export function setConfigs(): void {
    if (vscode.workspace.getConfiguration(configSection).get("debug")) {
        debug = true
        console.log("Debug logging enabled")
    } else {
        debug = false
        console.log("Debug logging disabled")
    }
    sigmacConfigs = vscode.workspace.getConfiguration(configSection).get("compileConfig")
    sigmasearchengineURL = vscode.workspace.getConfiguration(configSection).get("sigmasearchengineurl")
    sigconverterUrl = vscode.workspace.getConfiguration(configSection).get("sigconverterUrl") || "https://sigconverter.io/"
}
