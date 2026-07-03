"use strict";

/**
 * Build-only entry point for tsup. Not published — the canonical source
 * is src/audio-sync.js. This file exists purely so esbuild can statically
 * trace named exports for the ESM build output, which it can't do through
 * src/audio-sync.js's conditional (script-tag-safe) `module.exports`
 * assignment.
 */
const mod = require("../src/audio-sync.js");
const { AudioSync, AudioSyncError } = mod;

module.exports = { AudioSync, AudioSyncError };
export { AudioSync, AudioSyncError };
