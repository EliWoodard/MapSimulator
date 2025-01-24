import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { io } from "socket.io-client";
import Toolbar from "./Toolbar";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // 1. Initialize Fabric Canvas
    const canvas = new fabric.Canvas("whiteboard", {
      width: 800,
      height: 800,
      selection: false,
    });
    canvasRef.current = canvas;

    drawGrid(canvas, 50);

    // Zoom and pan setup (same as you have)...
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY; // Get scroll direction
      let zoom = canvas.getZoom(); // Current zoom level
      zoom *= 0.999 ** delta; // Adjust zoom level (zoom out for positive delta, in for negative)
      zoom = Math.max(0.1, Math.min(zoom, 3)); // Clamp zoom level between 0.5x and 3x
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom); // Zoom relative to mouse position
      opt.e.preventDefault(); // Prevent default scrolling
      opt.e.stopPropagation(); // Stop event bubbling
    });

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e;
      if (evt.altKey) { // Use Alt key to differentiate dragging from other actions
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    // Mouse move - handle dragging
    canvas.on("mouse:move", (opt) => {
      if (isDragging) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;

        vpt[4] += evt.clientX - lastPosX; // Update viewport X translation
        vpt[5] += evt.clientY - lastPosY; // Update viewport Y translation

        canvas.requestRenderAll(); // Refresh the canvas
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    // Mouse up - stop dragging
    canvas.on("mouse:up", () => {
      isDragging = false;
    });

    // Delete key handler
    document.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
          // Correct emit
          socket.current.emit("deleteObject", activeObject.id);
        }
      }
    });

    // 2. Connect to Socket server
    socket.current = io("http://localhost:5000");

    // 3. On new connection, server sends existing objects:
    socket.current.on("initCanvas", (objects) => {
      console.log("Initializing canvas with existing objects:", objects);
      objects.forEach((objData) => {
        createFabricObject(objData, canvas);
      });
    });

    // 4. Listen for objectAdded (from other clients)
    socket.current.on("objectAdded", (data) => {
      console.log("objectAdded event received:", data);
      createFabricObject(data, canvas);
    });

    // 5. Listen for objectDeleted
    socket.current.on("objectDeleted", (objectId) => {
      console.log("objectDeleted event received:", objectId);
      const obj = canvas.getObjects().find((o) => o.id === objectId);
      if (obj) {
        canvas.remove(obj);
        canvas.renderAll();
      }
    });

    // 6. Listen for update (others moving/resizing objects)
    socket.current.on("update", ({ id, options }) => {
      const obj = canvas.getObjects().find((o) => o.id === id);
      if (obj) {
        obj.set(options);
        obj.setCoords();
        canvas.renderAll();
        console.log(`Object updated with ID: ${id}`);
      }
    });

    // 7. On your local object:modified => emit "update"
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj || !obj.id) return;
      socket.current.emit("update", {
        id: obj.id,
        options: obj.toObject(),
      });
    });

    // Cleanup
    return () => {
      socket.current.disconnect();
      canvas.dispose();
    };
  }, []);

  // Helper for building Fabric objects from data
  const createFabricObject = (data, canvas) => {
    const { id, type, options } = data;

    if (type === "circle") {
      const circle = new fabric.Circle(options);
      circle.id = id;
      canvas.add(circle);
      canvas.renderAll();
    } else if (type === "image" && options.src) {
      const imgEl = new Image();
      imgEl.src = options.src;
      imgEl.onload = () => {
        const fabricImg = new fabric.Image(imgEl, options);
        fabricImg.id = id;
        canvas.add(fabricImg);
        canvas.renderAll();
      };
      imgEl.onerror = (err) => {
        console.error("Failed to load tile image:", options.src, err);
      };
    }
    // handle more object types as needed...
  };

  // Add a tile
  const addTile = (tileInput) => {
    console.log("addTile() triggered");
    const url = "http://localhost:5000/Images/Tiles/" + tileInput + ".png";
    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const fabricImg = new fabric.Image(imgEl, {
        left: 100,
        top: 100,
        scaleX: 0.2,
        scaleY: 0.2,
        selectable: true,
      });
      fabricImg.id = `tile_${Date.now()}`;

      // Add locally
      canvasRef.current.add(fabricImg);
      canvasRef.current.renderAll();

      // Emit "addObject" to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: { ...fabricImg.toObject(), src: url },
      });
    };

    imgEl.onerror = (err) => {
      console.error("Failed to load local tile image:", err);
    };
  };

  // Add a circle
  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: "red",
      radius: 50,
      selectable: true,
    });
    circle.id = `circle_${Date.now()}`;

    // Add locally
    canvasRef.current.add(circle);
    canvasRef.current.renderAll();

    // Emit "addObject"
    socket.current.emit("addObject", {
      id: circle.id,
      type: "circle",
      options: circle.toObject(),
    });
  };

  // Draw a big grid for reference
  const drawGrid = (canvas, gridSize = 10) => {
        const maxGridSize = 200000;
        const virtualWidth = maxGridSize;
        const virtualHeight = maxGridSize;
    
    
        // Draw horizontal lines, centered on canvas
        for (let y = -virtualHeight / 2; y <= virtualHeight / 2; y += gridSize) {
          const lineY = y;
          const horizontalLine = new fabric.Line(
            [-virtualWidth / 2, lineY, virtualWidth / 2, lineY],
            {
              stroke: "#ccc",
              selectable: false,
              evented: false,
            }
          );
          horizontalLine.gridLine = true; // Mark as grid line
          canvas.add(horizontalLine);
        }
    
        // Draw vertical lines, centered on canvas
        for (let x = -virtualWidth / 2; x <= virtualWidth / 2; x += gridSize) {
          const lineX = x;
          const verticalLine = new fabric.Line(
            [lineX, -virtualHeight / 2, lineX, virtualHeight / 2],
            {
              stroke: "#ccc",
              selectable: false,
              evented: false,
            }
          );
          verticalLine.gridLine = true; // Mark as grid line
          canvas.add(verticalLine);
        }
    
        // Draw center lines
        const centerXLine = new fabric.Line(
          [400, -virtualHeight / 2, 400, virtualHeight / 2],
          {
            stroke: "black",
            strokeWidth: 2,
            selectable: false,
            evented: false,
          }
        );
    
        const centerYLine = new fabric.Line(
          [-virtualWidth / 2, 400, virtualWidth / 2, 400],
          {
            stroke: "black",
            strokeWidth: 2,
            selectable: false,
            evented: false,
          }
        );
    
        centerXLine.gridLine = true;
        centerYLine.gridLine = true;
    
        canvas.add(centerXLine);
        canvas.add(centerYLine);
    
        canvas.renderAll(); // Ensure all objects are re-rendered
      };

  return (
    <div>
      <Toolbar addTile={addTile} addCircle={addCircle} />
      <canvas id="whiteboard" />
    </div>
  );
};

export default Whiteboard;
