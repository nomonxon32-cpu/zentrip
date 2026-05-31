import { ensureSqliteDbFile, removeSqliteDbFile, runPnpm } from "./db-common";

removeSqliteDbFile();
ensureSqliteDbFile();
runPnpm(["prisma", "db", "push"]);
runPnpm(["prisma", "db", "seed"]);
