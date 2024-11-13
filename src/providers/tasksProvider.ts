import * as os from "node:os";
import * as toml from "@iarna/toml";
import * as vscode from "vscode";
import type { MiseService } from "../miseService";
import { setupTaskFile } from "../utils/fileUtils";
import { logger } from "../utils/logger";
import { execAsync } from "../utils/shell";
import type { MiseTaskInfo } from "../utils/taskInfoParser";

export const RUN_TASK_COMMAND = "mise.runTask";
export const WATCH_TASK_COMMAND = "mise.watchTask";
export const MISE_OPEN_TASK_DEFINITION = "mise.openTaskDefinition";
export const MISE_CREATE_FILE_TASK = "mise.createFileTask";

const allowedTaskDirs = [
	"mise-tasks",
	".mise-tasks",
	"mise/tasks",
	".mise/tasks",
	".config/mise/tasks",
];

export class MiseTasksProvider implements vscode.TreeDataProvider<TreeNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<
		TreeNode | undefined | null | void
	> = new vscode.EventEmitter<TreeNode | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<
		TreeNode | undefined | null | void
	> = this._onDidChangeTreeData.event;

	constructor(private miseService: MiseService) {}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TreeNode): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: TreeNode): Promise<TreeNode[]> {
		if (!element) {
			// Root level - return source groups
			const tasks = await this.miseService.getTasks();
			const groupedTasks = this.groupTasksBySource(tasks);

			return Object.entries(groupedTasks).map(
				([source, tasks]) => new SourceGroupItem(source, tasks),
			);
		}

		if (element instanceof SourceGroupItem) {
			// Source group level - return tasks
			return element.tasks.map((task) => new TaskItem(task));
		}

		return [];
	}

	async getTasksNames(): Promise<string[]> {
		const tasks = await this.miseService.getTasks();
		return tasks.map((task) => task.name);
	}

	async getTasks(): Promise<MiseTask[]> {
		return this.miseService.getTasks();
	}

	private groupTasksBySource(tasks: MiseTask[]): Record<string, MiseTask[]> {
		return tasks.reduce(
			(groups, task) => {
				const source =
					(task.source.endsWith(".toml")
						? task.source
						: task.source.split("/").slice(0, -1).join("/")) || "Unknown";
				if (!groups[source]) {
					groups[source] = [];
				}
				groups[source].push(task);
				return groups;
			},
			{} as Record<string, MiseTask[]>,
		);
	}

	private async collectArgumentValues(info: MiseTaskInfo): Promise<string[]> {
		const cmdArgs: string[] = [];
		const spec = info.usageSpec;

		// Collect positional arguments
		for (const arg of spec.args) {
			const value = await vscode.window.showInputBox({
				prompt: `Enter value for ${arg.name}`,
				placeHolder: arg.name,
				ignoreFocusOut: true,
				validateInput: (value) => {
					if (arg.required && !value) {
						return `${arg.name} is required`;
					}
					return null;
				},
			});

			if (value) {
				cmdArgs.push(value);
			} else if (arg.required) {
				throw new Error(`Required argument ${arg.name} was not provided`);
			}
		}

		for (const flag of spec.flags) {
			if (flag.arg) {
				const shouldProvide = await vscode.window.showQuickPick(["Yes", "No"], {
					placeHolder: `Do you want to provide ${flag.name}?`,
					ignoreFocusOut: true,
				});

				if (shouldProvide === "Yes") {
					const value = await vscode.window.showInputBox({
						prompt: `Enter value for ${flag.name}`,
						placeHolder: flag.arg,
						ignoreFocusOut: true,
					});

					if (value) {
						cmdArgs.push(flag.name, value);
					}
				}
			} else {
				const shouldEnable = await vscode.window.showQuickPick(["Yes", "No"], {
					placeHolder: `Enable ${flag.name}?`,
					ignoreFocusOut: true,
				});

				if (shouldEnable === "Yes") {
					cmdArgs.push(flag.name);
				}
			}
		}

		return cmdArgs;
	}

	async runTask(taskName: string) {
		try {
			const taskInfo = await this.miseService.getTaskInfo(taskName);
			if (!taskInfo) {
				throw new Error(`Task '${taskName}' not found`);
			}

			if (
				taskInfo.usageSpec.args.length > 0 ||
				taskInfo.usageSpec.flags.length > 0
			) {
				const args = await this.collectArgumentValues(taskInfo);
				await this.miseService.runTask(taskName, ...args);
			} else {
				await this.miseService.runTask(taskName);
			}
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to run task '${taskName}': ${error}`,
			);
		}
	}

	async watchTask(taskName: string) {
		const [res1, res2] = await Promise.allSettled([
			this.miseService.getTools(),
			execAsync("which watchexec"),
		]);
		const tools = res1.status === "fulfilled" ? res1.value : [];
		const watchexecFromTools = tools.find((tool) => tool.name === "watchexec");
		const watchexec = res2.status === "fulfilled" ? res2.value.stdout : "";
		if (!watchexec && !watchexecFromTools) {
			vscode.window.showErrorMessage(
				"watchexec is required to run tasks in watch mode. Install it with `mise use -g watchexec`",
			);
			return;
		}

		try {
			const taskInfo = await this.miseService.getTaskInfo(taskName);
			if (!taskInfo) {
				throw new Error(`Task '${taskName}' not found`);
			}

			if (
				taskInfo.usageSpec.args.length > 0 ||
				taskInfo.usageSpec.flags.length > 0
			) {
				const args = await this.collectArgumentValues(taskInfo);
				await this.miseService.watchTask(taskName, ...args);
			} else {
				await this.miseService.watchTask(taskName);
			}
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to run task '${taskName}': ${error}`,
			);
		}
	}
}

type TreeNode = SourceGroupItem | TaskItem;

class SourceGroupItem extends vscode.TreeItem {
	constructor(
		public readonly source: string,
		public readonly tasks: MiseTask[],
	) {
		const pathShown = source
			.replace(/^~/, os.homedir())
			.replace(`${vscode.workspace.rootPath}/` || "", "");

		super(pathShown, vscode.TreeItemCollapsibleState.Expanded);
		this.tooltip = `Source: ${source}\nTasks: ${tasks.length}`;
		this.iconPath = new vscode.ThemeIcon("folder");
	}
}

class TaskItem extends vscode.TreeItem {
	constructor(public readonly task: MiseTask) {
		super(task.name, vscode.TreeItemCollapsibleState.None);
		this.tooltip = `Task: ${task.name}\nSource: ${task.source}\nDescription: ${task.description}`;
		this.iconPath = new vscode.ThemeIcon("play");

		this.command = {
			command: MISE_OPEN_TASK_DEFINITION,
			title: "Open Task Definition",
			tooltip: `Open Task Definition ${task.name} in the editor`,
			arguments: [task],
		};

		this.contextValue = "miseTask";
	}
}

function findTaskPosition(
	document: vscode.TextDocument,
	taskName: string,
): vscode.Position | undefined {
	const text = document.getText();

	try {
		const parsed = toml.parse(text);
		const lines = text.split("\n");

		if (parsed.tasks) {
			const sectionPattern = new RegExp(
				`\\[tasks\\.${taskName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]`,
			);

			const inlinePattern = new RegExp(
				`^\\s*${taskName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`,
			);

			let inTasksSection = false;

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim();

				if (sectionPattern.test(line)) {
					return new vscode.Position(i, lines[i].indexOf(taskName));
				}
				if (line === "[tasks]") {
					inTasksSection = true;
					continue;
				}
				if (inTasksSection && line.startsWith("[")) {
					inTasksSection = false;
				}
				if (inTasksSection && inlinePattern.test(line)) {
					return new vscode.Position(i, lines[i].indexOf(taskName));
				}
			}
		}
	} catch (error) {
		logger.error("Error parsing TOML:", error as Error);
	}

	return undefined;
}

export function registerMiseCommands(
	context: vscode.ExtensionContext,
	taskProvider: MiseTasksProvider,
) {
	context.subscriptions.push(
		vscode.commands.registerCommand(
			RUN_TASK_COMMAND,
			async (taskName: undefined | string | MiseTask | TaskItem) => {
				let name = taskName;
				if (!name) {
					name = await vscode.window.showQuickPick(
						taskProvider.getTasksNames(),
						{ placeHolder: "Select a task to run" },
					);
				}

				if (typeof name !== "string") {
					name = name instanceof TaskItem ? name.task.name : (name?.name ?? "");
				}
				taskProvider.runTask(name).catch((error) => {
					logger.error(`Failed to run task '${taskName}':`, error);
				});
			},
		),
		vscode.commands.registerCommand(
			WATCH_TASK_COMMAND,
			async (taskName: undefined | string | MiseTask | TaskItem) => {
				let name = taskName;
				if (!name) {
					name = await vscode.window.showQuickPick(
						taskProvider.getTasksNames(),
						{ placeHolder: "Select a task to watch" },
					);
				}

				if (typeof name !== "string") {
					name = name instanceof TaskItem ? name.task.name : (name?.name ?? "");
				}
				taskProvider.watchTask(name).catch((error) => {
					logger.error(`Failed to run task (watch mode) '${taskName}':`, error);
				});
			},
		),
		vscode.commands.registerCommand(
			MISE_OPEN_TASK_DEFINITION,
			async (task: MiseTask | undefined) => {
				let selectedTask = task;
				if (!selectedTask) {
					const tasks = await taskProvider.getTasksNames();
					const taskName = await vscode.window.showQuickPick(tasks, {
						placeHolder: "Select a task to open",
					});
					selectedTask = (await taskProvider.getTasks()).find(
						(t) => t.name === taskName,
					);
				}

				if (!selectedTask?.source) {
					return;
				}

				const uri = vscode.Uri.file(
					selectedTask.source.replace(/^~/, os.homedir()),
				);
				const document = await vscode.workspace.openTextDocument(uri);
				const editor = await vscode.window.showTextDocument(document);

				if (!document.fileName.endsWith(".toml")) {
					editor.revealRange(
						new vscode.Range(0, 0, 0, 0),
						vscode.TextEditorRevealType.InCenter,
					);
					editor.selection = new vscode.Selection(0, 0, 0, 0);
					return;
				}

				const position = findTaskPosition(document, selectedTask.name);
				if (position) {
					const range = document.lineAt(position.line).range;
					const startOfLine = new vscode.Position(position.line, 0);
					const selection = new vscode.Selection(startOfLine, range.end);
					editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
					editor.selection = selection;
				} else {
					vscode.window.showWarningMessage(
						`Could not locate task "${selectedTask.name}" in ${document.fileName}`,
					);
				}
			},
		),

		vscode.commands.registerCommand(MISE_CREATE_FILE_TASK, async () => {
			const taskName = await vscode.window.showInputBox({
				prompt: "Enter the name of the task",
				placeHolder: "task_name",
				validateInput: (value) => {
					if (!value) {
						return "Task name is required";
					}
					return null;
				},
			});

			if (!taskName) {
				return;
			}

			const taskSource = await vscode.window.showQuickPick(allowedTaskDirs, {
				title: "Select the task source directory",
				placeHolder: "Select the task source directory",
			});

			if (!taskSource) {
				return;
			}
			if (!allowedTaskDirs.includes(taskSource)) {
				vscode.window.showErrorMessage(
					`Invalid task source directory: ${taskSource}`,
				);
				return;
			}

			const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			const taskDir = `${rootPath}/${taskSource}`;
			const taskFile = vscode.Uri.file(`${taskDir}/${taskName}`);

			await setupTaskFile(taskFile.fsPath);

			const document = await vscode.workspace.openTextDocument(taskFile);
			const editor = await vscode.window.showTextDocument(document);

			const taskDefinition = [
				"#!/usr/bin/env bash",
				`#MISE description="Run ${taskName}"`,
				"",
				`echo "Running ${taskName}"`,
				"",
				"# See https://mise.jdx.dev/tasks/file-tasks.html for more information",
			].join("\n");

			await editor.edit((edit) => {
				edit.insert(new vscode.Position(0, 0), taskDefinition);
			});
			await editor.document.save();
			await vscode.commands.executeCommand("workbench.action.files.save");
			taskProvider.refresh();
		}),
	);
}
