const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

function getSessionFilePath(sessionId) {
  return path.join(__dirname, `canvasObjects_${sessionId}.json`);
}

function loadCanvasObjects(sessionId) {
  const filePath = getSessionFilePath(sessionId);
  try {
    const data = fs.readFileSync(filePath, "utf8");
    console.log(`Loaded canvas objects for session ${sessionId}`);
    return JSON.parse(data);
  } catch (error) {
    console.log(`No file found for session ${sessionId}. Starting new session.`);
    return {};
  }
}

function saveCanvasObjects(sessionId, canvasObjects) {
  const filePath = getSessionFilePath(sessionId);
  fs.writeFileSync(filePath, JSON.stringify(canvasObjects, null, 2), "utf8");
}

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const sessionId = socket.handshake.query.sessionId || "default";
  const isCreate = socket.handshake.query.create === "true";
  const sessionFilePath = getSessionFilePath(sessionId);

  if (isCreate) {
    if (fs.existsSync(sessionFilePath)) {
      socket.emit("sessionError", { message: "Session already exists" });
      socket.disconnect();
      return;
    } else {
      saveCanvasObjects(sessionId, {}); // Creates a new file for the session.
      console.log(`Created new session file for session ${sessionId}`);
    }
  } else {
    if (!fs.existsSync(sessionFilePath)) {
      socket.emit("sessionError", { message: "Session does not exist" });
      socket.disconnect();
      return;
    }
  }

  // Have the socket join a room based on sessionId.
  socket.join(sessionId);

  // Load session-specific canvas objects.
  let canvasObjects = loadCanvasObjects(sessionId);

  // Send current canvas objects to the newly connected client.
  socket.emit("initCanvas", Object.values(canvasObjects));

  // Handle "addObject"
  socket.on("addObject", (data) => {
    let stringId = data.id;
    let spliceDataType = stringId.split('_');

    if (spliceDataType[0] === "circle" || spliceDataType[0] === "player" || spliceDataType[0] === "enemy" || spliceDataType[0] === "banner") {
      if (data.options.zIndex === undefined) {
        data.options.zIndex = 10;
      }
    } else if (spliceDataType[0] === "token" || spliceDataType[0] === "environment") {
      data.options.zIndex = 9;
    } else if (spliceDataType[0] === "image") {
      if (data.options.zIndex === undefined) {
        data.options.zIndex = 0;
      }
    }

    canvasObjects[data.id] = data;
    saveCanvasObjects(sessionId, canvasObjects);
    io.in(sessionId).emit("objectAdded", data);
  });

  // Handle "deleteObject"
  socket.on("deleteObject", (objectId) => {
    delete canvasObjects[objectId];
    saveCanvasObjects(sessionId, canvasObjects);
    io.to(sessionId).emit("objectDeleted", objectId);
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
      saveCanvasObjects(sessionId, canvasObjects);
    }
    io.to(sessionId).emit("update", { id, options });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected from session ${sessionId}:`, socket.id);
  });
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
