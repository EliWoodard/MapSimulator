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
    // If it's a circle & missing zIndex, set default=10
    if (data.type === "circle") {
      if (data.options.zIndex === undefined) {
        data.options.zIndex = 10;
      }
    }
    // If it's an image & missing zIndex, set default=0
    else if (data.type === "image") {
      if (data.options.zIndex === undefined) {
        data.options.zIndex = 0;
      }
    }

    // Save in memory & file
    canvasObjects[data.id] = data;
    saveCanvasObjects();

    // Broadcast so others add it
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
  socket.on("update", ({ id, options }) => {
    if (canvasObjects[id]) {
      const oldOpts = canvasObjects[id].options;
      // Merge new & old so we don't lose zIndex if omitted
      canvasObjects[id].options = {
        ...oldOpts,
        ...options,
        zIndex:
          options.zIndex !== undefined ? options.zIndex : oldOpts.zIndex,
      };
      saveCanvasObjects();
    }
    socket.broadcast.emit("update", { id, options });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));