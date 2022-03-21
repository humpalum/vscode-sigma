import * as vscode from 'vscode';

export class SigmaFixer implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext): vscode.CodeAction[] {

		
		let actions = [];
		if (context.diagnostics[0].code === "sigma_containsMiddle" ){
			// "contains|bla|asd:"
			// "contains|bla|asd"
			//context.diagnostics.filter(diagnostics => diagnostics.code === "sigma_containsMiddle").m
			const text = document.getText(context.diagnostics[0].range);
			let newtext = text.replace(/^(contains\|)/,'');
			console.log(newtext);
			newtext = newtext.replace(/:/,'');
			newtext += '|contains:';
			
			const fixContains = this.createReplaceFix(document,context.diagnostics[0].range,newtext, "Move 'contains' to end.");
			let newRange = new vscode.Range(document.lineAt(context.diagnostics[0].range.start.line).lineNumber, context.diagnostics[0].range.start.character, document.lineAt(range.start.line).lineNumber, range.start.character + "contains|".length);
			const removeContains = this.createReplaceFix(document, newRange, '', "Remove 'contains'");
			
			actions.push(this.createOpenWikiAction());

			fixContains.isPreferred = true;
			actions.push(fixContains);
			actions.push(removeContains);
		}

		if (context.diagnostics[0].code === "sigma_TitleTooLong" ){
			// "^title: Much To Long Title nothing we can do here"
			let wikiAction = this.createOpenWikiAction();
			wikiAction.isPreferred = true;
			actions.push(wikiAction);
		}
		if (context.diagnostics[0].code === "sigma_DescTooShort" ){
			// "^description: Detects nothing"
			let wikiAction = this.createOpenWikiAction();
			wikiAction.isPreferred = true;
			actions.push(wikiAction);
		}
		if (context.diagnostics[0].code === "sigma_trailingWhitespace" ){
			// "     $"
			const removeWhitespaces = this.createReplaceFix(document, context.diagnostics[0].range, '', "Remove Whitespaces");
			removeWhitespaces.isPreferred = true;
			actions.push(removeWhitespaces);
		}
		return actions;
	}

	private createOpenWikiAction(): vscode.CodeAction {
		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.QuickFix);
		action.command = { command: "sigma.wikiSpecification", title: 'Open Wiki', tooltip: 'Checkout the Sigma Wiki' };
		return action;
	}


	private createReplaceFix(document: vscode.TextDocument, range: vscode.Range, replace: string,message: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(message, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(document.uri, range, replace);
		return fix;
	}

}
