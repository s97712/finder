import { lstatSync, readdirSync } from 'fs';
import path = require('path');
import * as vscode from 'vscode';

function path_split(dir: string) {
  return dir.endsWith("/") ? {
    dirname: dir,
    basename: "",
  } : {
    dirname: (path.dirname(dir) + "/").replace(/^\.\//, ""),
    basename: path.basename(dir),
  }
}

export class Finder {

  static findFiles(match: string) {
    let [ws, dir] = match.split(":");
    dir = dir?.trimLeft();

    const workspace = vscode.workspace.workspaceFolders?.find(item => item.name == ws);

    if (workspace) {

      const info = path_split(dir);
      const basedir = path.resolve(`${workspace.uri.path}/${info.dirname}`);
      const dirs = readdirSync(basedir);
      const matched = dirs.map(file => {
        const isDir = (lstatSync(`${basedir}/${file}`).isDirectory());
        const path = `${workspace.name}: ${info.dirname}${file}`;
        return isDir ? `${path}/` : path;
      })

      return {
        matched,
        base: `${workspace.name}: ${info.dirname}`
      }
    }

  }

  static toUri(match: string) {
    const [ws, dir] = match.split(":")
    const workspace = vscode.workspace.workspaceFolders?.find(item => item.name === ws);
    if (workspace) {
      return vscode.Uri.joinPath(workspace.uri, dir.trimLeft())
    }
  }

  static open(match: string) {

    const picker = vscode.window.createQuickPick();

    picker.onDidChangeValue((input: string) => {

      if (input === "") {
        picker.dispose();
        Quicklist.open();
      }

      const info = Finder.findFiles(input);

      if (info) {
        if (info.base && info.base !== info.matched[0]) {
          info.matched.unshift(info.base);
        }

        picker.items = info?.matched?.map(file => ({
          label: file
        }));
      }
    });

    picker.onDidAccept(async () => {
      const selected = picker.selectedItems[0];
      if (selected.label === picker.value) {
        const uri = Finder.toUri(picker.value);
        if (uri) {
          Quicklist.add_his(uri.path);
          try {
            await vscode.commands.executeCommand("revealInExplorer", uri);
            const doc = await vscode.workspace.openTextDocument(uri);
            vscode.window.showTextDocument(doc, { preview: false })
          } catch { }
        }
        picker.dispose();
      } else {
        picker.value = selected.label;
      }
    });

		picker.show();
    picker.value = match;

  }

}

export class Quicklist {
  static his: Array<string> = [];

  static pwd() {
    const uri = vscode.window.activeTextEditor?.document.uri;
    if (uri) {
      return this.to_match(path_split(uri.path).dirname)
    }
  }

  static to_match(match: string) {
    const uri = vscode.Uri.file(match);
    const ws = vscode.workspace.getWorkspaceFolder(uri);

    if (ws) {
      const dir = match.slice(ws.uri.path.length + 1)
      return `${ws.name}: ${dir}`;
    }
  }

  static add_his(match: string) {
    const f = this.to_match(match);
    if (f) {
      const idx = this.his.findIndex(v => v === f);
      if (idx !== -1) this.his.splice(idx, 1);
      this.his.push(f)
    }
    if (this.his.length >= 20) {
      this.his.slice(-15)
    }
  }

  static open() {
    const his = this.his.slice(-8).reverse();
    const pwd = this.pwd();
    const ws = vscode.workspace.workspaceFolders?.map(item => item.name + ":")

    const items: string[] = [];

    pwd && items.push(pwd);
    items.push(...his)
    ws && items.push(...ws);


    vscode.window.showQuickPick(items).then(match => {
      match && Finder.open(match)
    })
  }
  
}
