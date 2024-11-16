import * as toml from "@iarna/toml";
import * as vscode from "vscode";
import { isMiseExtensionEnabled } from "../configuration";
import type { MiseService } from "../miseService";
import { RUN_TASK_COMMAND, WATCH_TASK_COMMAND } from "./tasksProvider";

export class MiseTomlCodeLensProvider implements vscode.CodeLensProvider {
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
		new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> =
		this._onDidChangeCodeLenses.event;

	constructor(private miseService: MiseService) {
		vscode.workspace.onDidChangeTextDocument((e) => {
			if (!isMiseExtensionEnabled()) {
				return;
			}

			if (e.document.fileName.endsWith(".toml")) {
				this._onDidChangeCodeLenses.fire();
			}
		});
	}

	public async provideCodeLenses(
		document: vscode.TextDocument,
	): Promise<vscode.CodeLens[]> {
		if (!isMiseExtensionEnabled()) {
			return [];
		}

		if (!document.fileName.endsWith(".toml")) {
			return [];
		}

		const codeLenses: vscode.CodeLens[] = [];
		const text = document.getText();

		try {
			const parsed = toml.parse(text);
			const tasks = this.findTasks(parsed);

			for (const taskName of tasks) {
				const taskPosition = this.findTaskPosition(document, taskName);
				if (taskPosition) {
					const range = new vscode.Range(
						taskPosition,
						taskPosition.translate(0, taskName.length),
					);

					codeLenses.push(
						new vscode.CodeLens(range, {
							title: "$(play) Run",
							tooltip: `Run task ${taskName}`,
							command: RUN_TASK_COMMAND,
							arguments: [taskName],
						}),
					);
					codeLenses.push(
						new vscode.CodeLens(range, {
							title: "$(watch) Watch",
							tooltip: `Watch task ${taskName}`,
							command: WATCH_TASK_COMMAND,
							arguments: [taskName],
						}),
					);
				}
			}
		} catch (error) {
			console.error("Error parsing TOML:", error);
		}

		const toolsPosition = this.findToolsPosition(document);
		if (toolsPosition) {
			const range = new vscode.Range(toolsPosition, toolsPosition);
			codeLenses.push(
				new vscode.CodeLens(range, {
					title: "$(add) Add tool",
					tooltip: "Add tool",
					command: "mise.useTool",
					arguments: [document.uri.path],
				}),
			);
			if (await this.miseService.hasMissingTools()) {
				codeLenses.push(
					new vscode.CodeLens(range, {
						title: "$(cloud-download) Install missing tools",
						tooltip: "Install missing tools",
						command: "mise.installAll",
					}),
				);
			}
		}

		return codeLenses;
	}

	private findTasks(parsed: toml.JsonMap): string[] {
		const tasks: string[] = [];

		// Case 1: [tasks] section with inline tasks
		if (parsed.tasks && typeof parsed.tasks === "object") {
			tasks.push(...Object.keys(parsed.tasks));
		}

		// Case 2: [tasks.taskname] style
		for (const key of Object.keys(parsed)) {
			if (key.startsWith("tasks.")) {
				const taskName = key.split(".")[1];
				if (taskName) {
					tasks.push(taskName);
				}
			}
		}

		return tasks;
	}

	private findTaskPosition(
		document: vscode.TextDocument,
		taskName: string,
	): vscode.Position | undefined {
		const text = document.getText();
		const lines = text.split("\n");

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) {
				continue;
			}

			const trimmedLine = line.trim();

			// Check for [tasks] section with inline tasks
			// Check for [tasks.taskname] style
			// Check for tasks."taskname" style
			// Check for tasks.'taskname' style
			const isFound =
				trimmedLine.match(new RegExp(`^\\s*${taskName}\\s*=`)) ||
				trimmedLine.startsWith(`[tasks.${taskName}]`) ||
				trimmedLine.startsWith(`[tasks."${taskName}"]`) ||
				trimmedLine.startsWith(`tasks."${taskName}"`) ||
				trimmedLine.startsWith(`tasks.${taskName}`);

			if (isFound) {
				return new vscode.Position(i, 0);
			}
		}

		return undefined;
	}

	private findToolsPosition(
		document: vscode.TextDocument,
	): vscode.Position | undefined {
		const text = document.getText();
		const lines = text.split("\n");
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line) {
				continue;
			}
			if (line.trim().startsWith("[tools]")) {
				return new vscode.Position(i, 0);
			}
		}
		return undefined;
	}
}
