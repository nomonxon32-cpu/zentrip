import { closeSync, existsSync, mkdirSync, openSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "..");
export const prismaDir = path.join(projectRoot, "prisma");
export const sqliteDbPath = path.join(prismaDir, "dev.db");

export function ensureSqliteDbFile() {
  mkdirSync(prismaDir, { recursive: true });

  if (!existsSync(sqliteDbPath)) {
    closeSync(openSync(sqliteDbPath, "a"));
  }
}

export function removeSqliteDbFile() {
  if (existsSync(sqliteDbPath)) {
    rmSync(sqliteDbPath, { force: true });
  }

  const journalPath = `${sqliteDbPath}-journal`;
  if (existsSync(journalPath)) {
    rmSync(journalPath, { force: true });
  }
}

export function runPnpm(args: string[]) {
  const npmExecPath = process.env.npm_execpath;
  const result = npmExecPath
    ? spawnSync(process.execPath, [npmExecPath, ...args], {
        cwd: projectRoot,
        stdio: "inherit",
      })
    : spawnSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", args, {
        cwd: projectRoot,
        stdio: "inherit",
      });

  if (result.status !== 0) {
    if (result.error) {
      console.error(result.error);
    }
    process.exit(result.status ?? 1);
  }
}
