import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "advent-code-opener.open",
    async () => {
      const today = new Date();
      let maxYear = today.getFullYear();
      if (today.getMonth() === 11) {
        maxYear += 1;
      }
      const minYear = 2015;
      const validateYear = (s: string) => {
        if (isNaN(Number(s))) {
          return `Year must be a number.`;
        } else if (Number(s) < minYear) {
          return `Year must be at least ${minYear}.`;
        } else if (Number(s) >= maxYear) {
          return `Year must be less than ${maxYear}.`;
        } else {
          return null;
        }
      };
      const year = await vscode.window.showInputBox({
        title: "Year",
        value: String(today.getFullYear()),
        validateInput: validateYear,
      });

      const validateDay = (s: string) => {
        const day = Number(s);
        if (isNaN(day)) {
          return `Day must be a number.`;
        } else if (day < 1) {
          return `Day must be at least 1.`;
        } else if (day > 25) {
          return `Day must be at most 25.`;
        } else if (
          Number(year) === today.getFullYear() &&
          day > today.getDate()
        ) {
          return `Day must be at most ${today.getDate()}.`;
        }
      };

      let day = await vscode.window.showInputBox({
        title: "Day",
        value: String(Math.min(today.getDate(), 25)),
        validateInput: validateDay,
      });

      day = pad(Number(day), 2);

      let currentPath = "";
      if (vscode.workspace.workspaceFolders?.length) {
        currentPath = vscode.workspace.workspaceFolders[0].uri.path;
      }
      let a = /.*aoc/.exec(currentPath);
      console.log(a);
      currentPath = a![0];
      let solution = `${currentPath}\\${year}\\day${day}.py`;
      let sample1 = `${currentPath}\\${year}\\${day}_sample.txt`;
      let sample2 = `${currentPath}\\${year}\\${day}_sample2.txt`;
      let data = `${currentPath}\\input\\${year}\\${day}_data.txt`;
      const x1 = await vscode.workspace.openTextDocument(solution);
      const x2 = await vscode.workspace.openTextDocument(sample1);
      const x3 = await vscode.workspace.openTextDocument(sample2);
      const x4 = await vscode.workspace.openTextDocument(data);

      await vscode.commands.executeCommand("workbench.action.closeAllEditors");

      await vscode.window.showTextDocument(x1, {
        viewColumn: vscode.ViewColumn.One,
        preview: false,
      });
      await vscode.window.showTextDocument(x2, {
        viewColumn: vscode.ViewColumn.Two,
        preview: false,
      });
      await vscode.window.showTextDocument(x3, {
        viewColumn: vscode.ViewColumn.Three,
        preview: false,
      });
      await vscode.window.showTextDocument(x4, {
        viewColumn: vscode.ViewColumn.Four,
        preview: false,
      });
      await vscode.commands.executeCommand("workbench.action.previousEditor");
      await vscode.commands.executeCommand(
        "workbench.action.moveEditorToLeftGroup"
      );
      await vscode.commands.executeCommand(
        "workbench.action.moveEditorToBelowGroup"
      );
      await vscode.commands.executeCommand(
        "workbench.action.focusFirstEditorGroup"
      );
	  for (let i = 0; i < 4; i++) {
		await vscode.commands.executeCommand("workbench.action.increaseViewWidth");
	  }

	  const pos = new vscode.Position(19, 0);
	  vscode.window.activeTextEditor!.selection = new vscode.Selection(pos, pos);
    }
  );

  context.subscriptions.push(disposable);
}

function pad(num: number, size: number): string {
  let s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
}
