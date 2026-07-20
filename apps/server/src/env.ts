import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

// pnpm runs scripts with cwd set to this package's directory (apps/server),
// not the repo root, so the default `dotenv/config` (which reads from
// process.cwd()) silently misses the root .env. Anchor to this file's own
// location instead so it's correct regardless of what invoked it.
config({ path: path.resolve(here, "../../../.env") });
