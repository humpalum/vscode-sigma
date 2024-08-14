"use strict"

import * as vscode from "vscode"

export const configSection = "sigma"
export let sigmacConfigs: any[] | undefined
export let sigmasearchengineURL: any[] | undefined
export let sigconverterUrl = "https://sigconverter.io/"
export let sigconverterBackend: string
export let debug = false

import * as fs from "fs"
import * as path from "path"
import * as Buffer from "buffer"

export interface SigConverterConfigItem {
    /**
     * The URL to the sigconverter (For example: https://beta.sigconverter.io/).
     * Defaults to global sigconverter URL or https://sigconverter.io/
     */
    url: string
    /**
     * Paths to the sigma pipelines. Multiple will be concatenated.
     * Each item in the array is a path to the sigma pipeline.
     */
    pipelineYML: string[]
    /**
     * List of pipelines to use from predifned sigconverter pipelines
     */
    pipeline: string[]

    /**
     * Target Backend to be used for this config.
     */
    backend: string
    /**
     * The output format of the backend. For example for splunk one of:
     * default|savedsearches|data_model|string
     */
    format: string
    /**
     *  Optional name to better identify the output
     */
    name: string
}

export let sigconverterConfigs: SigConverterConfigItem[] | undefined

export interface TranslatedSigConverterConfigItem {
    /**
     * The URL to the sigconverter (For example: https://beta.sigconverter.io/).
     * Defaults to global sigconverter URL or https://sigconverter.io/
     */
    url: string
    /**
     * Concatinated and Base64 encoded pipeline
     */
    pipelineYML: string
    /**
     * 
    /**
     * Predefined pipelines from sigconverter
     */
    pipeline: string[]
    /**
     * Target Backend to be used for this config.
     */
    backend: string
    /**
     * The output format of the backend. For example for splunk one of:
     * default|savedsearches|data_model|string
     */
    format: string
    /**
     *  Optional name to better identify the output
     */
    name: string
}

export let translatedSigconverterConfigs: TranslatedSigConverterConfigItem[] = []

export function setConfigs(): void {
    if (vscode.workspace.getConfiguration(configSection).get("debug")) {
        debug = true
        console.log("Debug logging enabled")
    } else {
        debug = false
        console.log("Debug logging disabled")
    }

    sigmacConfigs = vscode.workspace.getConfiguration(configSection).get("compileConfig")

    updateSigconverterConfigs()

    // Setup the FileSystemWatcher for the sigconverterConfigs
    if (sigconverterConfigs && sigconverterConfigs?.length > 0) {
        sigconverterConfigs.map(config => {
            let pipelineData = ""
            if (typeof config.pipelineYML !== "string") {
                config.pipelineYML?.map(file => {
                    vscode.workspace.createFileSystemWatcher(file).onDidChange(() => {
                        updateSigconverterConfigs()
                        if (onSigconverterConfigUpdated) {
                            onSigconverterConfigUpdated()
                        }
                    })
                })
            }
        })
    }
}

let onSigconverterConfigUpdated: () => void | undefined
// Export a function to set the onSigconverterConfigUpdated callback
export function setOnSigconverterConfigUpdated(callback: () => void): void {
    onSigconverterConfigUpdated = callback
}
function updateSigconverterConfigs() {
    sigmasearchengineURL = vscode.workspace.getConfiguration(configSection).get("sigmasearchengineurl")
    sigconverterUrl =
        vscode.workspace.getConfiguration(configSection).get("sigconverterUrl") || "https://sigconverter.io/"
    sigconverterBackend = vscode.workspace.getConfiguration(configSection).get("sigconverterBackend") || "splunk"
    sigconverterConfigs = vscode.workspace.getConfiguration(configSection).get("sigconverterConfigs")

    // If no custom sigconverter configs are set, put in the default one
    translatedSigconverterConfigs = []
    if (!sigconverterConfigs || sigconverterConfigs?.length === 0) {
        translatedSigconverterConfigs = [
            {
                url: sigconverterUrl,
                pipelineYML: "",
                pipeline: [],
                backend: sigconverterBackend,
                format: "default",
                name: "",
            },
        ]
    } else {
        // Else just put in all the Configs
        sigconverterConfigs.map(config => {
            // If a pipeline is set, read the files that are fiven in the config, concatinate them and base64 encode the result
            let pipelineData = ""
            if (typeof config.pipelineYML === "string") {
                pipelineData += fs.readFileSync(path.resolve(config.pipelineYML), "utf-8")
            } else {
                pipelineData =
                    config.pipelineYML
                        ?.map(file => {
                            return fs.readFileSync(path.resolve(file), "utf-8")
                        })
                        .join("\n---\n") || ""
            }

            let encodedData = Buffer.Buffer.from(pipelineData).toString("base64")
            translatedSigconverterConfigs.push({
                name: config.name || "",
                url: config.url || sigconverterUrl,
                pipelineYML: encodedData || "",
                pipeline: config.pipeline || [],
                backend: config.backend || sigconverterBackend,
                format: config.format || "default",
            })
        })
    }
}
