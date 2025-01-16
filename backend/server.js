const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// GET tile images to then be able to use them
const path = require("path");
app.use('/Images', express.static(path.join(__dirname, '../Images')));
console.log("Serving images from:", path.join(__dirname, '../Images'));


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let canvasObjects = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Broadcast draw events
    socket.on("draw", (data) => {
        console.log("Broadcasting draw event:", data);
        socket.broadcast.emit("draw", data); // Notify all clients except sender
    });

    // Listen for a delete request
    socket.on('deleteObject', (objectId) => {
        console.log(`Delete request for object ID: ${objectId}`);
        delete canvasObjects[objectId]; // Remove from storage

        // Broadcast the deletion to all connected clients
        socket.broadcast.emit('objectDeleted', objectId);
    });

    socket.on('addObject', (data) => {
        console.log(`Adding object with ID: ${data.id}`);
    
        // Add the object to canvasObjects using its ID as the key
        canvasObjects[data.id] = data;
    
        // Broadcast the new object to all connected clients
        socket.broadcast.emit('objectAdded', data);
    
        console.log('Current canvasObjects:', canvasObjects);
    });

    // Broadcast update events
    socket.on("update", (data) => {
        console.log("Broadcasting update event:", data);
        socket.broadcast.emit("update", data); // Notify all clients except sender
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
