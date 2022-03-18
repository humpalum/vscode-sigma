
import { Console } from 'console';
import * as vscode from 'vscode';

/**
 * Analyzes the text document for problems. 
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param sigmaDiagnostics diagnostic collection
 */
export function refreshDiagnostics(doc: vscode.TextDocument, sigmaDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
        // Check for Errors Here
		// Check modifiers
		if (lineOfText.text.includes("contains|")) {
			if (!lineOfText.text.includes("contains|all:")){
				diagnostics.push(creatDiaContainsInMiddle(doc, lineOfText, lineIndex));
			}
		}
		if (lineOfText.text.match(/^title:.{50,}/)){
				diagnostics.push(creatDiaTitleToLong(doc, lineOfText, lineIndex));
		}
		if (lineOfText.text.match(/^description:.{0,16}$/)){
			diagnostics.push(creatDiaDescToShort(doc, lineOfText, lineIndex));
		}
		if (lineOfText.text.match(/[\s]+$/)){
			diagnostics.push(creatDiaTrailingWhitespace(doc, lineOfText, lineIndex));
		}
	}

	sigmaDiagnostics.set(doc.uri, diagnostics);
}
function creatDiaContainsInMiddle(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	// find where in the line the 'contains' is mentioned
	const index = lineOfText.text.indexOf("contains|");
	let indexLength = "contains|".length;
	let regexMatch = lineOfText.text.match("contains.+:");
	if (regexMatch){
		indexLength = regexMatch[0].length;
	}
	else{
		regexMatch =  lineOfText.text.match("contains.+$");
		if (regexMatch){
			indexLength = regexMatch[0].length;
		}
	}
	// create range that represents, where in the document the word is
	const range = new vscode.Range(lineIndex, index, lineIndex, index + indexLength);

	const diagnostic = new vscode.Diagnostic(range, "Contains should only be at the end of modifiers",
		vscode.DiagnosticSeverity.Warning);
	diagnostic.code = "sigma_containsMiddle";
	return diagnostic;
}

function creatDiaTrailingWhitespace(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	// create range that represents, where in the document the word is
	let match;
	let range = lineOfText.range;
	if (match = lineOfText.text.match(/([\s]+$)/)){
		let l = match[0].length;
		range = new vscode.Range(lineIndex, lineOfText.text.length - l ,lineIndex, lineOfText.text.length);
	}

	const diagnostic = new vscode.Diagnostic(range, "Trailing Whitespaces",
	vscode.DiagnosticSeverity.Information);
	diagnostic.code = "sigma_trailingWhitespace";
	
	return diagnostic;
}
function creatDiaTitleToLong(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	// create range that represents, where in the document the word is
	const range = lineOfText.range;

	const diagnostic = new vscode.Diagnostic(range, "Title is to long. Please consider shortening it",
	vscode.DiagnosticSeverity.Warning);
	diagnostic.code = "sigma_TitleToLong";
	return diagnostic;
}

function creatDiaDescToShort(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number): vscode.Diagnostic {
	// create range that represents, where in the document the word is
	const range = lineOfText.range;

	const diagnostic = new vscode.Diagnostic(range, "Description is to short. Please Consider expanding it",
		vscode.DiagnosticSeverity.Warning);
	diagnostic.code = "sigma_DescToShort";
	return diagnostic;
}
export function subscribeToDocumentChanges(context: vscode.ExtensionContext, sigmaDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, sigmaDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, sigmaDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, sigmaDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => sigmaDiagnostics.delete(doc.uri))
	);

}