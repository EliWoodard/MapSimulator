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

// Serve frontend (React build)
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

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

  // Send current canvas objects to the newly connected client
  socket.emit("initCanvas", Object.values(canvasObjects));

  // Handle "addObject"
  socket.on("addObject", (data) => {
    let stringId = data.id;
    let spliceDataType = stringId.split('_');

    if (spliceDataType[0] === "circle" || spliceDataType[0] === "player" || spliceDataType[0] === "enemy") {
      if (data.options.zIndex === undefined) {
        data.options.zIndex = 10;
      }
    } else if (spliceDataType[0] === "image") {
      if (data.options.zIndex === undefined) {
        data.options.zIndex = 0;
      }
    }

    // Save in memory & file
    canvasObjects[data.id] = data;
    saveCanvasObjects();

    // Broadcast so others add it
    io.emit("objectAdded", data);
  });

  // Handle "deleteObject"
  socket.on("deleteObject", (objectId) => {
    console.log(`Delete request for object ID: ${objectId}`);

    // Remove from memory
    delete canvasObjects[objectId];
    saveCanvasObjects();

    // Broadcast to other clients
    socket.broadcast.emit("objectDeleted", objectId);
  });

  // Handle "update"
  socket.on("update", ({ id, options }) => {
    if (canvasObjects[id]) {
      const oldOpts = canvasObjects[id].options;
      canvasObjects[id].options = {
        ...oldOpts,
        ...options,
        zIndex: options.zIndex !== undefined ? options.zIndex : oldOpts.zIndex,
      };
      saveCanvasObjects();
    }
    socket.broadcast.emit("update", { id, options });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
