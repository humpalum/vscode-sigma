"use strict";

import * as vscode from 'vscode';

export const configSection = 'sigma';
export let debug = false;

export function setDebugLogState(): void {
    if (vscode.workspace.getConfiguration(configSection).get('debug')) {
        debug = true;
        console.log('Debug logging enabled');
    }
    else {
        debug = false;
        console.log('Debug logging disabled');
    }
}
