#!/usr/bin/env node
"use strict";

const { spawn } = require("node:child_process");

const nextBin = require.resolve("next/dist/bin/next");

const env = { ...process.env };
env.NEXT_DISABLE_MEM_OVERRIDE = "1";

const args = [
  nextBin,
  "dev",
  "--webpack",
  "--disable-source-maps",
  "--no-server-fast-refresh",
  ...process.argv.slice(2),
];

const child = spawn(process.execPath, args, { stdio: "inherit", env });

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
