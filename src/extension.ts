import * as vscode from 'vscode';
import {
  window,
  Disposable,
  ExtensionContext,
  StatusBarAlignment,
  tasks,
  Task,
} from "vscode";
// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error).
  // This line of code will only be executed once when your extension is activated.
  // console.log('extension is now active!');

  // create a new word counter
  let quickScript = new QuickScript();
  let controller = new QuickScriptController(quickScript);

  // Add to a list of disposables which are disposed when this extension is deactivated.
  context.subscriptions.push(controller);
  context.subscriptions.push(quickScript);
}

class QuickScript {
  public async updateScript() {
    let fetchedTasks = await this._getTasks();
    if (fetchedTasks.length > 0) {
      fetchedTasks.forEach(async (tsk, idx) => {
        const itm = window.createStatusBarItem(StatusBarAlignment.Right);
        itm.text = tsk.name.includes("app") ? `$(play) App` : `$(play) Api`;
        // Add an event listener to run the task when the button is clicked
        itm.command = `quickscript${idx}.runTask`;
        // Register a command to run the task
        vscode.commands.registerCommand(`quickscript${idx}.runTask`, function () {
          // Run the task here
          vscode.tasks.executeTask(tsk);
        });
        // itm.command = vscode.commands.executeCommand("workbench.action.tasks.runTask", tsk.name);
        itm.tooltip = 'run';
        itm.show();
      });
    }
  }

public async _getTasks(): Promise<Task[]> {
  let tasksFetched = await tasks.fetchTasks();
  tasksFetched = tasksFetched.filter((tsk) => {
    return tsk.name === "start:dev - api" || tsk.name === "dev - app";
  });
  return tasksFetched.length > 0 ? tasksFetched : [];
}

  dispose() {
    // this._statusBarItem.dispose();
  }
}
class QuickScriptController {
  private _quickScriptCounter: QuickScript;
  private _disposable: Disposable;

  constructor(wordCounter: QuickScript) {
    this._quickScriptCounter = wordCounter;
    // subscribe to selection change and editor activation events
    let subscriptions: Disposable[] = [];
    // window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    // window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
    // update the counter for the current file
    this._quickScriptCounter.updateScript();
    // create a combined disposable from both event subscriptions
    this._disposable = Disposable.from(...subscriptions);
  }

  dispose() {
    this._disposable.dispose();
  }

  // private _onEvent() {
  //   this._quickScriptCounter.updateScript();
  // }
}