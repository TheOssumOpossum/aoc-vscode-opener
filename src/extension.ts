import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "advent-code-opener.open",
    async () => {
      let currentPath = "";
      if (vscode.workspace.workspaceFolders?.length) {
        currentPath = vscode.workspace.workspaceFolders[0].uri.path;
      }
      let a = /.*aoc/.exec(currentPath);
      if (a === null) {
        return;
      }
      currentPath = a[0];

      const today = new Date();
      let maxYear = today.getFullYear();
      if (today.getMonth() === 11) {
        maxYear += 1;
      }
      const minYear = 2015;
      const validateYear = (s: string) => {
        s = s.trim();
        if (isNaN(Number(s))) {
          return `Year must be a number.`;
        } else if (Number(s) < minYear) {
          return `Year must be at least ${minYear}.`;
        } else if (Number(s) >= maxYear) {
          return `Year must be less than ${maxYear}.`;
        } else if (!fs.existsSync(`${currentPath.slice(1)}/${s}/`)) {
          return `Solution folder does not exist for the year: ${s}.`;
        } else if (!fs.existsSync(`${currentPath.slice(1)}/input/${s}/`)) {
          return `Input folder does not exist for the year: ${s}.`;
        }
        return null;
      };

      let defaultYear = await vscode.workspace
        .getConfiguration()
        .get("adventofcode.year");
      let defaultDay = await vscode.workspace
        .getConfiguration()
        .get("adventofcode.day");
      console.log(`default year: ${defaultYear}`);
      console.log(`default day: ${defaultDay}`);
      if (today.getMonth() === 11 && today.getDate() < 25) {
        defaultYear = today.getFullYear();
        defaultDay = today.getDate() + 1;
      }
      const year = await vscode.window.showInputBox({
        title: "Year",
        value: String(defaultYear),
        validateInput: validateYear,
      });

      const validateDay = (s: string) => {
        s = s.trim();
        const day = Number(s);
        const padded_day = pad(day, 2);
        if (isNaN(day)) {
          return `Day must be a number.`;
        } else if (day < 1) {
          return `Day must be at least 1.`;
        } else if (day > 25) {
          return `Day must be at most 25.`;
        } else if (
          Number(year) === today.getFullYear() &&
          (day > (today.getDate() + 1))
        ) {
          return `Day must be at most ${today.getDate() + 1}.`;
        } else if (
          !fs.existsSync(`${currentPath.slice(1)}/${year}/day${padded_day}.py`)
        ) {
          return `${year}/day${padded_day}.py does not exist.`;
        } else if (
          !fs.existsSync(
            `${currentPath.slice(1)}/${year}/${padded_day}_sample.txt`
          )
        ) {
          return `${year}/${padded_day}_sample.txt does not exist.`;
          // } else if (
          //   !fs.existsSync(
          // `${currentPath.slice(1)}/${year}/${padded_day}_sample2.txt`
          //   )
          // ) {
          //   return `${year}/${padded_day}_sample2.txt does not exist.`;
        } else if (
          !fs.existsSync(
            `${currentPath.slice(1)}/input/${year}/${padded_day}_data.txt`
          )
        ) {
          return `/input/${year}/${padded_day}_data.txt does not exist.`;
        } else {
          return null;
        }
      };

      let day = await vscode.window.showInputBox({
        title: "Day",
        value: String(defaultDay),
        validateInput: validateDay,
      });

      if (
        day === undefined ||
        year === undefined ||
        isNaN(Number(day)) ||
        isNaN(Number(year))
      ) {
        return;
      }

      day = pad(Number(day), 2);

      let sample2exists = fs.existsSync(
        `${currentPath.slice(1)}/${year}/${day}_sample2.txt`
      );

      let solution = `${currentPath}\\${year}\\day${day}.py`;
      let sample1 = `${currentPath}\\${year}\\${day}_sample.txt`;
      let sample2 = `${currentPath}\\${year}\\${day}_sample2.txt`;
      let data = `${currentPath}\\input\\${year}\\${day}_data.txt`;
      const x1 = await vscode.workspace.openTextDocument(solution);
      const x2 = await vscode.workspace.openTextDocument(sample1);
      let x3 = undefined;
      if (sample2exists) {
        x3 = await vscode.workspace.openTextDocument(sample2);
      }
      const x4 = await vscode.workspace.openTextDocument(data);

      await vscode.workspace
        .getConfiguration()
        .update(
          "adventofcode.year",
          Number(day) + 1 === 26 ? year + 1 : year,
          vscode.ConfigurationTarget.Global
        );
      await vscode.workspace
        .getConfiguration()
        .update(
          "adventofcode.day",
          Math.min(Number(day) + 1, 25),
          vscode.ConfigurationTarget.Global
        );

      await vscode.commands.executeCommand("workbench.action.closeAllEditors");

      await vscode.window.showTextDocument(x1, {
        viewColumn: vscode.ViewColumn.One,
        preview: false,
      });
      await vscode.window.showTextDocument(x2, {
        viewColumn: vscode.ViewColumn.Beside,
        preview: false,
      });
      if (sample2exists && x3 !== undefined) {
        await vscode.window.showTextDocument(x3, {
          viewColumn: vscode.ViewColumn.Beside,
          preview: false,
        });
      }
      await vscode.window.showTextDocument(x4, {
        viewColumn: vscode.ViewColumn.Beside,
        preview: false,
      });
      if (sample2exists) {
        await vscode.commands.executeCommand("workbench.action.previousEditor");
        await vscode.commands.executeCommand(
          "workbench.action.moveEditorToLeftGroup"
        );
        await vscode.commands.executeCommand(
          "workbench.action.moveEditorToBelowGroup"
        );
      }
      await vscode.commands.executeCommand(
        "workbench.action.focusFirstEditorGroup"
      );
      for (let i = 0; i < 4; i++) {
        await vscode.commands.executeCommand(
          "workbench.action.increaseViewWidth"
        );
      }
      await vscode.commands.executeCommand("workbench.action.focusNextGroup");
      for (let i = 0; i < 2; i++) {
        await vscode.commands.executeCommand(
          "workbench.action.decreaseViewWidth"
        );
      }
      await vscode.commands.executeCommand(
        "workbench.action.focusFirstEditorGroup"
      );

      await vscode.workspace
        .getConfiguration()
        .update(
          "editor.renderWhitespace",
          "selection",
          vscode.ConfigurationTarget.Global
        );

      const pos = new vscode.Position(19, 0);
      vscode.window.activeTextEditor!.selection = new vscode.Selection(
        pos,
        pos
      );
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
