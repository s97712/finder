import { lstatSync, readdirSync } from 'fs';
import path = require('path');
import * as vscode from 'vscode';

export class FolderReveal {

  static findFiles(match: string): { matched: string[], base?: string } {
    const [ws, dir] = match.split(":");

    const workspace = vscode.workspace.workspaceFolders?.find(item => item.name == ws);

    if (!workspace) {
      return {
        matched: vscode.workspace.workspaceFolders?.map(item => item.name + ":") || []
      }

    } else {

      const info = dir.endsWith("/") ? {
        dirname: dir,
        basename: "",
      } : {
        dirname: (path.dirname(dir) + "/").replace(/^\.\//, ""),
        basename: path.basename(dir),
      }

      const basedir = path.resolve(`${workspace.uri.path}/${info.dirname}`);
      const dirs = readdirSync(basedir);
      const matched = dirs.map(file => {
        const isDir = (lstatSync(`${basedir}/${file}`).isDirectory());
        const path = `${workspace.name}:${info.dirname}${file}`;
        return isDir ? `${path}/` : path;
      })

      return {
        matched,
        base: `${workspace.name}:${info.dirname}`
      }
    }
  }

  static toUri(match: string) {
    const [ws, dir] = match.split(":")
    const workspace = vscode.workspace.workspaceFolders?.find(item => item.name === ws);
    if (workspace) {
      return vscode.Uri.joinPath(workspace.uri, dir)
    }
  }

  static pwd() {
    const uri = vscode.window.activeTextEditor?.document.uri;
    const ws = uri && vscode.workspace.getWorkspaceFolder(uri);

    if (ws && uri) {
      const dir = path.dirname(uri.path).slice(ws.uri.path.length + 1)
      return `${ws.name}:${dir}/`;
    }
  }

}
