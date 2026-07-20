#!/usr/bin/env node
// One-command local bootstrap: start Docker Desktop if needed -> Postgres ->
// migrations -> dev servers. Cross-platform (Windows/macOS/Linux) since it's
// plain Node.js — no bash/WSL required. Run via `pnpm setup` or by
// double-clicking setup.bat (Windows) / setup.command (macOS).
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(ROOT);

function log(message) {
  console.log(`==> ${message}`);
}

function die(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exitCode = 1;
  throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "inherit", shell: true });
}

function silent(cmd, args) {
  return spawnSync(cmd, args, { stdio: "ignore", shell: true });
}

function runCaptured(cmd, args) {
  const result = spawnSync(cmd, args, { shell: true, encoding: "utf8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  return { status: result.status, output };
}

function commandExists(cmd) {
  return silent(cmd, ["--version"]).status === 0;
}

function dockerReachable() {
  return silent("docker", ["info"]).status === 0;
}

async function ensureDockerRunning() {
  if (dockerReachable()) {
    log("Docker is already running.");
    return;
  }

  log("Docker isn't running yet — trying to start Docker Desktop for you...");
  const platform = os.platform();

  if (platform === "win32") {
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    const exe = path.join(programFiles, "Docker", "Docker", "Docker Desktop.exe");
    if (existsSync(exe)) {
      spawn(exe, [], { detached: true, stdio: "ignore" }).unref();
    } else {
      die(
        "Docker Desktop doesn't seem to be installed. Download and install it from " +
          "https://www.docker.com/products/docker-desktop/, open it once, then run this again."
      );
    }
  } else if (platform === "darwin") {
    silent("open", ["-a", "Docker"]);
  } else {
    const result = run("systemctl", ["start", "docker"]);
    if (result.status !== 0) {
      die(
        "Could not start Docker automatically. Start it yourself (e.g. `sudo systemctl start docker`) " +
          "and run this again."
      );
    }
  }

  log("Waiting for Docker to finish starting (this can take up to a minute the first time)...");
  for (let attempt = 0; attempt < 60; attempt++) {
    if (dockerReachable()) {
      log("Docker is up.");
      return;
    }
    await sleep(2000);
  }
  die(
    "Docker is still not responding after waiting a while. Please open Docker Desktop manually, " +
      'wait until it says "Docker Desktop is running", then run this again.'
  );
}

function bootstrapEnvFile() {
  if (existsSync(".env")) {
    log(".env already exists — leaving it untouched.");
    return;
  }
  log("No .env found — creating one with a fresh encryption secret...");
  copyFileSync(".env.example", ".env");
  const secret = randomBytes(32).toString("base64");
  const contents = readFileSync(".env", "utf8").replace(
    /^KEY_ENCRYPTION_SECRET=.*$/m,
    () => `KEY_ENCRYPTION_SECRET=${secret}`
  );
  writeFileSync(".env", contents);
}

async function waitForPostgres() {
  log("Waiting for Postgres to accept connections...");
  for (let attempt = 0; attempt < 30; attempt++) {
    const check = silent("docker", ["compose", "exec", "-T", "postgres", "pg_isready", "-U", "postgres"]);
    if (check.status === 0) {
      log("Postgres is ready.");
      return;
    }
    await sleep(1000);
  }
  die("Postgres did not become ready in time. Check 'docker compose logs postgres'.");
}

function tryMigrate() {
  const result = runCaptured("pnpm", ["--filter", "@ai-screen-sense/server", "db:migrate"]);
  process.stdout.write(result.output);
  return result;
}

async function runMigrationsWithSelfHeal() {
  log("Setting up the database...");
  let result = tryMigrate();
  if (result.status === 0) {
    log("Database is ready.");
    return;
  }

  // POSTGRES_PASSWORD only takes effect the first time a container's data
  // volume is initialized. If an earlier setup attempt (before .env existed,
  // or with different values) already created that volume, Postgres keeps
  // its original password forever, no matter what docker-compose.yml or .env
  // say now — that mismatch shows up as an auth error, not a config error.
  const looksLikeStaleVolume = /password authentication failed|28P01/i.test(result.output);
  if (!looksLikeStaleVolume) {
    die("Database migration failed. See the output above.");
  }

  log(
    "That's a leftover Postgres database from an earlier setup attempt with different credentials " +
      "— it's local disposable dev data for this project only, so resetting it and retrying..."
  );
  run("docker", ["compose", "down", "-v"]);
  if (run("docker", ["compose", "up", "-d", "postgres"]).status !== 0) {
    die("Failed to restart Postgres after resetting it. See the output above.");
  }
  await waitForPostgres();

  result = tryMigrate();
  if (result.status !== 0) {
    die(
      "Database migration still failed after resetting the local Postgres container. Try running " +
        "`docker compose down -v` yourself in this folder, then run this script again."
    );
  }
  log("Database is ready.");
}

async function main() {
  log("Checking prerequisites...");
  if (!commandExists("node")) {
    die("Node.js is not installed. Install it from https://nodejs.org/ and run this again.");
  }
  if (!commandExists("pnpm")) {
    die("pnpm is not installed. Install it with `npm install -g pnpm` and run this again.");
  }
  if (!commandExists("docker")) {
    die(
      "Docker is not installed. Install Docker Desktop from " +
        "https://www.docker.com/products/docker-desktop/ and run this again."
    );
  }

  await ensureDockerRunning();
  bootstrapEnvFile();

  log("Starting Postgres via docker compose...");
  if (run("docker", ["compose", "up", "-d", "postgres"]).status !== 0) {
    die("Failed to start Postgres. See the output above.");
  }

  await waitForPostgres();

  if (!existsSync("node_modules")) {
    log("Installing dependencies (this can take a minute the first time)...");
    if (run("pnpm", ["install"]).status !== 0) {
      die("pnpm install failed. See the output above.");
    }
  } else {
    log("Dependencies already installed — skipping.");
  }

  await runMigrationsWithSelfHeal();

  log("Everything is ready! Starting the app...");
  log("Once you see the app running below, open http://localhost:5173 in your browser.");
  const child = spawn("pnpm", ["dev"], { stdio: "inherit", shell: true });
  process.on("SIGINT", () => child.kill("SIGINT"));
  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch(() => process.exit(process.exitCode || 1));
