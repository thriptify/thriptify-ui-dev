const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

/** @type {import("expo/metro-config").MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add watchFolders to watch local packages
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const componentsPath = path.resolve(monorepoRoot, "thriptify-libs", "packages", "components");
const tokensPath = path.resolve(monorepoRoot, "thriptify-libs", "packages", "tokens");
const uiElementsPath = path.resolve(monorepoRoot, "thriptify-libs", "packages", "ui-elements");
const apiTypesPath = path.resolve(monorepoRoot, "thriptify-libs", "packages", "api-types");

config.watchFolders = [
  projectRoot,
  tokensPath,
  componentsPath,
  uiElementsPath,
  apiTypesPath,
];

// Configure resolver to handle local packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Ensure TypeScript files are resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, "ts", "tsx"];

// Custom resolver for @thriptify packages
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @thriptify packages
  if (moduleName.startsWith("@thriptify/")) {
    const packageName = moduleName.replace("@thriptify/", "");
    let packagePath;
    
    if (packageName === "components") {
      packagePath = componentsPath;
    } else if (packageName === "tokens") {
      packagePath = tokensPath;
    } else if (packageName === "ui-elements") {
      packagePath = uiElementsPath;
    } else if (packageName === "api-types") {
      packagePath = apiTypesPath;
    } else {
      packagePath = path.resolve(monorepoRoot, "thriptify-libs", "packages", packageName);
    }
    
    if (fs.existsSync(packagePath)) {
      const packageJsonPath = path.join(packagePath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = require(packageJsonPath);
        // Use module field if available, otherwise fall back to main
        const entryPoint = packageJson.module || packageJson.exports?.["."]?.import || packageJson.main;
        
        if (entryPoint) {
          const resolvedPath = path.resolve(packagePath, entryPoint);
          if (fs.existsSync(resolvedPath)) {
            return {
              type: "sourceFile",
              filePath: resolvedPath,
            };
          }
        }
      }
    }
  }
  
  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
