import { defineConfig } from "vite";
import path from "path";
import { exec } from "child_process";
import chokidar from "chokidar";
import glsl from "vite-plugin-glsl";
// import { VitePWA } from "vite-plugin-pwa";

// Export a Vite configuration
const __dirname = process.cwd();
export default defineConfig(({ mode }) => {
  // Common configuration for all modes
  let config = {
    build: {
      outDir: "dist", // Default output directory
      sourcemap: mode === "development", // Generate sourcemap only in development
    },
    optimizeDeps: {
      exclude: ["@babylonjs/havok"],
    },
    resolve: {
      alias: [
        {
          find: "~",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    plugins: [
      // VitePWA({ registerType: "autoUpdate" }),
      glsl(),
      {
        name: "custom-watch-plugin",
        configureServer(server) {
          // Watch the specific folder hierarchy
          // const watcher = chokidar.watch(
          //   "src/templates/ThirdPerson/data/**/*",
          //   {
          //     ignored: /[\/\\]\./,
          //     persistent: true,
          //   },
          // );
          const watcher = chokidar.watch(
            "./src/templates/ThirdPerson/data/**/*",
            {
              atomic: true,
              awaitWriteFinish: true,
            },
          );

          // Run the script when changes are detected
          watcher.on("change", (path) => {
            console.log(`File ${path} has been changed`);
            exec("npm run games", (err, stdout) => {
              if (err) {
                console.error(`exec error: ${err}`);
                return;
              }
              console.log(`stdout: ${stdout}`);
              // Send reload command to the client
              server.ws.send({
                type: "full-reload",
              });
            });
          });
        },
      },
      // obfuscator({
      //   options: {
      //     // Your javascript-obfuscator options here
      //     // See what's allowed: https://github.com/javascript-obfuscator/javascript-obfuscator
      //   },
      // }),
    ],
  };

  // Customize based on environment
  if (mode === "production") {
    config.build = {
      ...config.build,
      minify: true, // Minify for production builds
      outDir: "dist/prod", // Separate output folder for production
      // Add more production-specific options here
    };
  }
  return config;
});
