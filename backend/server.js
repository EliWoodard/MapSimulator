const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve tile images:
app.use('/Images', express.static(path.join(__dirname, '../Images')));
console.log("Serving images from:", path.join(__dirname, '../Images'));

// Load existing canvas objects from JSON file (if present)
let canvasObjects = {};
try {
  const data = fs.readFileSync("canvasObjects.json", "utf8");
  canvasObjects = JSON.parse(data);
  console.log("Loaded existing canvas objects from file.");
} catch (error) {
  console.log("No existing canvasObjects.json found or error reading file.");
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Helper to save canvasObjects to JSON
function saveCanvasObjects() {
  fs.writeFileSync("canvasObjects.json", JSON.stringify(canvasObjects, null, 2), "utf8");
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1. Immediately send current canvas objects to the newly connected client
  //    We'll send them as an array (Object.values(...)) or as the entire object. 
  //    The client can then iterate and create each Fabric object.
  socket.emit("initCanvas", Object.values(canvasObjects));

  // 2. Handle "addObject"
  socket.on("addObject", (data) => {
    console.log(`Adding object with ID: ${data.id}`);
    canvasObjects[data.id] = data;   // store in memory
    saveCanvasObjects();            // persist to JSON

    // Broadcast to other clients so they add it to their canvas
    socket.broadcast.emit("objectAdded", data);
  });

  // 3. Handle "deleteObject"
  socket.on("deleteObject", (objectId) => {
    console.log(`Delete request for object ID: ${objectId}`);

    // Remove from memory
    delete canvasObjects[objectId];
    saveCanvasObjects();

    // Broadcast to other clients
    socket.broadcast.emit("objectDeleted", objectId);
  });

  // 4. Handle "update" (e.g., after object movement, resize, etc.)
  socket.on("update", (data) => {
    console.log("Broadcasting update event:", data);
    const { id, options } = data;

    // Update our stored version
    if (canvasObjects[id]) {
      canvasObjects[id].options = options;
      saveCanvasObjects();
    }

    // Notify all clients except the sender
    socket.broadcast.emit("update", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
