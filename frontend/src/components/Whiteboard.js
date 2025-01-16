import React, { useEffect, useRef } from "react";
import * as fabric from "fabric"; // Import everything from Fabric.js
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
    drawGrid(canvas, 50); // 50px grid size

    // Zoom functionality
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

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();

        // To access information on an active object
        // if (activeObject) {
        //   console.log('Object Details:');
        //   console.log(`Type: ${activeObject.type}`);
        //   console.log(`Left: ${activeObject.left}`);
        //   console.log(`Top: ${activeObject.top}`);
        //   console.log(`Width: ${activeObject.width * activeObject.scaleX}`); // Scaled width
        //   console.log(`Height: ${activeObject.height * activeObject.scaleY}`); // Scaled height
        //   console.log(`Fill Color: ${activeObject.fill}`);
        //   console.log(`ID: ${activeObject.id}`); // Access custom properties
        // }

        canvas.remove(activeObject);
        socket.emi('deleteObject', activeObject.id);
      }
    });

    // 2. Connect Socket
    socket.current = io("http://localhost:5000");

    // 3. Socket 'draw' event => add objects
    socket.current.on("draw", (data) => {
      console.log("Received draw event:", data);
      const { id, type, options } = data;

      if (type === "circle") {
        const circle = new fabric.Circle(options);
        circle.id = id;
        canvas.add(circle);
        canvas.renderAll();
        console.log(`Circle added with ID: ${id}`);
      } else if (type === "image" && options.src) {
        console.log("Loading tile image from URL:", options.src);

        // Create a plain HTML image
        const imgEl = new Image();
        imgEl.src = options.src;
        imgEl.onload = () => {
          const fabricImg = new fabric.Image(imgEl, options);
          fabricImg.id = id;
          canvas.add(fabricImg);
          canvas.renderAll();
          console.log(`Tile added with ID: ${id}`);
        };
        imgEl.onerror = (err) => {
          console.error("Failed to load tile image:", options.src, err);
        };
      }

      console.log("Current canvas objects after draw:", canvas.getObjects());
    });

    // 4. Socket 'update' => modify objects
    socket.current.on("update", ({ id, options }) => {
      const obj = canvas.getObjects().find((o) => o.id === id);
      if (obj) {
        obj.set(options);
        obj.setCoords();
        canvas.renderAll();
        console.log(`Object updated with ID: ${id}`);
      }
    });

    // 5. On object:modified => broadcast 'update'
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

  const addTile = () => {
    console.log("addTile() triggered");
    const url = "http://localhost:5000/Images/Tiles/100A.png";

    // 1. Make a plain HTML image
    const imgEl = new Image();
    imgEl.src = url;

    // 2. onload => create Fabric object
    imgEl.onload = () => {
      console.log("imgEl loaded:", imgEl.width, imgEl.height);

      const fabricImg = new fabric.Image(imgEl, {
        left: 100,
        top: 100,
        scaleX: 0.2,
        scaleY: 0.2,
        selectable: true,
      });

      fabricImg.id = `tile_${Date.now()}`;

      // Add to local canvas
      canvasRef.current.add(fabricImg);
      canvasRef.current.renderAll();

      // Broadcast "add"
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: { ...fabricImg.toObject(), src: url },
      });

      // // Broadcast "draw"
      // socket.current.emit("draw", {
      //   id: fabricImg.id,
      //   type: "image",
      //   options: { ...fabricImg.toObject(), src: url },
      // });

      console.log("Tile object added locally:", fabricImg);
      console.log("Objects after addTile:", canvasRef.current.getObjects());
    };

    // 3. onerror => debug
    imgEl.onerror = (err) => {
      console.error("Failed to load local tile image:", err);
    };
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: "red",
      radius: 50,
      selectable: true,
    });
    circle.id = `circle_${Date.now()}`;

    // Add to local canvas
    canvasRef.current.add(circle);
    canvasRef.current.renderAll();

    // Emit "draw"
    socket.current.emit("draw", {
      id: circle.id,
      type: "circle",
      options: circle.toObject(),
    });
  };

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
