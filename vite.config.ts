import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";

// Build info plugin
function buildInfoPlugin() {
  return {
    name: 'build-info',
    transformIndexHtml(html: string) {
      try {
        // Get git commit hash
        const commitHash = execSync('git rev-parse HEAD').toString().trim();

        // Get git commit message (first line)
        const commitMessage = execSync('git log -1 --pretty=%B').toString().trim().split('\n')[0];

        // Get package version
        const packageJson = require('./package.json');
        const version = packageJson.version;

        // Build time
        const buildTime = new Date().toISOString();

        const buildInfo = {
          version,
          commitHash,
          buildTime,
          commitMessage
        };

        // Inject build info as a global variable
        const buildInfoScript = `
          <script>
            window.__BUILD_INFO__ = ${JSON.stringify(buildInfo)};
          </script>
        `;

        return html.replace('</head>', `${buildInfoScript}</head>`);
      } catch (error) {
        console.warn('Failed to get build info:', error);
        // Fallback build info
        const fallbackBuildInfo = {
          version: 'unknown',
          commitHash: 'unknown',
          buildTime: new Date().toISOString(),
          commitMessage: 'unknown'
        };

        const buildInfoScript = `
          <script>
            window.__BUILD_INFO__ = ${JSON.stringify(fallbackBuildInfo)};
          </script>
        `;

        return html.replace('</head>', `${buildInfoScript}</head>`);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
  },
  plugins: [
    react(),
    buildInfoPlugin(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
