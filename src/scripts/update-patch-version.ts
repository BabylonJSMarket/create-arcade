import fs from "fs";

function updatePatchVersion(filePath: string): void {
  try {
    const packageJsonContent = fs.readFileSync(filePath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    const currentVersion = packageJson.version as string | undefined;
    if (!currentVersion) {
      console.error(`Error: 'version' field not found in ${filePath}`);
      return;
    }

    const versionParts = currentVersion.split(".");
    if (versionParts.length !== 3) {
      console.error(
        `Error: Invalid version format '${currentVersion}' in ${filePath}. Expected major.minor.patch.`,
      );
      return;
    }

    const major = parseInt(versionParts[0], 10);
    const minor = parseInt(versionParts[1], 10);
    const patch = parseInt(versionParts[2], 10);

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      console.error(
        `Error: Invalid version components in '${currentVersion}' in ${filePath}.`,
      );
      return;
    }

    const newPatch = patch + 1;
    const newVersion = `${major}.${minor}.${newPatch}`;
    packageJson.version = newVersion;

    fs.writeFileSync(
      filePath,
      JSON.stringify(packageJson, null, 2) + "\n",
      "utf-8",
    );

    console.log(`Successfully updated version in ${filePath} to ${newVersion}`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.error(`Error: File not found at ${filePath}`);
    } else if (error instanceof SyntaxError) {
      console.error(`Error: Failed to parse JSON in ${filePath}`);
    } else {
      console.error(`An unexpected error occurred: ${error.message}`);
    }
  }
}

updatePatchVersion("package.json");
