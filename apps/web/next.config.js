import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
};

export default nextConfig;