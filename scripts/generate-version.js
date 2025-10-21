/**
 * Generate version.json for client-side version checking
 * Runs before every build (dev and production)
 */

import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

// Get directory name for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

// Extract version
const version = packageJson.version;
const buildTime = new Date().toISOString();
const buildVersion = buildTime.replace(/[-:T.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS

// Create version data
const versionData = {
  version,        // e.g., "1.0.4"
  buildVersion,   // e.g., "20251013143022"
  buildTime,      // e.g., "2025-10-13T14:30:22.123Z"
  environment: process.env.NODE_ENV || "production"
};

// Ensure public directory exists
const publicDir = path.resolve(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, {recursive: true});
}

// Write version.json to public folder
const versionJsonPath = path.resolve(publicDir, "version.json");
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2), "utf-8");

console.log(`✓ Generated version.json: v${version} (build: ${buildVersion})`);
console.log(`  Path: ${versionJsonPath}`);
console.log(`  Environment: ${versionData.environment}`);
