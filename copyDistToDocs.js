/**
 * copyDistToDocs.js v0.0.2
 *
 * A JavaScript file to copy the contents of the 'dist' directory to the 'docs'
 * directory in the root of the project. This is useful for GitHub Pages to
 * serve the contents of the 'docs' directory.
 *
 * Website:
 *
 * https://sine-wave-generator.com
 *
 * Source:
 *
 * https://github.com/sebastienrousseau/sine-wave-generator
 *
 */
"use strict";

const fs = require("fs-extra");
const path = require("path");

const distPath = path.resolve(__dirname, "dist");
const docsPath = path.resolve(__dirname, "docs");

// Ensure the 'docs' directory exists
fs.ensureDirSync(docsPath);

// Copy the contents of the 'dist' directory to the 'docs' directory
fs.copySync(distPath, docsPath, { overwrite: true });

console.log("Copied contents of dist to docs");
