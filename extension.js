import * as vscode from "vscode";
import * as path from "path";

export const activate = (context) => {
	const provider = vscode.languages.registerDocumentLinkProvider(
		[
			{ language: "html", scheme: "file" },
			{ language: "css", scheme: "file" },
		],
		{
			provideDocumentLinks(document) {
				const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
					"";
				const text = document.getText();
				const links = [];
				const mappings = {
					"@root/": "",
					"@api/": "api",
					"@static/": "static",
					"@view/": "view",
				};
				const keys = Object.keys(mappings)
					.map((k) => k.replace("/", "\\/"))
					.join("|");
				const regex = new RegExp(`(${keys})[A-Za-z0-9._\\-/]+`, "g");
				let m;
				while ((m = regex.exec(text)) !== null) {
					const raw = m[0];
					const prefix = Object.keys(mappings).find((k) =>
						raw.startsWith(k)
					);
					if (!prefix) continue;
					const rest = raw.slice(prefix.length);
					const sub = mappings[prefix];
					const resolved = sub
						? path.join(ws, sub, rest)
						: path.join(ws, rest);
					const start = document.positionAt(m.index);
					const end = document.positionAt(m.index + raw.length);
					links.push(
						new vscode.DocumentLink(
							new vscode.Range(start, end),
							vscode.Uri.file(resolved),
						),
					);
				}
				return links;
			},
		},
	);
	context.subscriptions.push(provider);
};
