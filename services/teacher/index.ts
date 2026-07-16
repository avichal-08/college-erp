import app from "./src/app";
import { createWebSocketServer } from "./src/websocket";

const PORT = Number(process.env.PORT) || 5001;

const server = app.listen(PORT, () => {
  console.log(`Teacher service running on http://localhost:${PORT}`);
});

createWebSocketServer(server);
