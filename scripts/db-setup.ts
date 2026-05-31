import { ensureSqliteDbFile, runPnpm } from "./db-common";

ensureSqliteDbFile();
runPnpm(["prisma", "db", "push"]);
runPnpm(["prisma", "db", "seed"]);
