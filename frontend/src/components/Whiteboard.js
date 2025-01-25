import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { io } from "socket.io-client";
import Toolbar from "./Toolbar";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // 1) Create the Fabric canvas
    const canvas = new fabric.Canvas("whiteboard", {
      width: 800,
      height: 800,
      selection: false,
    });
    canvasRef.current = canvas;

    // 2) Draw a big grid
    drawGrid(canvas, 50);

    // 3) Zoom + pan listeners
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.max(0.1, Math.min(zoom, 3));
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e;
      if (evt.altKey) {
        isDragging = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isDragging) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPosX;
        vpt[5] += evt.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on("mouse:up", () => {
      isDragging = false;
    });

    // 4) Delete key => remove object
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
          socket.current.emit("deleteObject", activeObject.id);
        }
      }
    });

    // 5) Connect to server
    socket.current = io("http://localhost:5000");

    // 6) On initCanvas from server => create objects
    socket.current.on("initCanvas", (objects) => {
      console.log("initCanvas with objects:", objects);
      objects.forEach((objData) => {
        createFabricObject(objData, canvas);
      });
    });

    // 7) On objectAdded (from other clients)
    socket.current.on("objectAdded", (data) => {
      console.log("objectAdded from server:", data);
      createFabricObject(data, canvasRef.current);
    });

    // 8) On objectDeleted
    socket.current.on("objectDeleted", (objectId) => {
      console.log("objectDeleted from server:", objectId);
      const obj = canvas.getObjects().find((o) => o.id === objectId);
      if (obj) {
        canvas.remove(obj);
        canvas.renderAll();
      }
    });

    // 9) On update
    socket.current.on("update", ({ id, options }) => {
      console.log("update from server for:", id);
      const obj = canvas.getObjects().find((o) => o.id === id);
      if (obj) {
        obj.set(options);
        obj.setCoords();
        canvas.renderAll();
      }
    });

    // 10) local object modified => emit "update"
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj || !obj.id) return;
      socket.current.emit("update", {
        id: obj.id,
        options: obj.toObject(),
      });
    });

    // Cleanup on unmount
    return () => {
      socket.current.disconnect();
      canvas.dispose();
    };
  }, []);

  // Create any object from server data
  const createFabricObject = (data, canvas) => {
    const { id, type, options } = data;
    if (type === "circle") {
      const circle = new fabric.Circle(options);
      circle.id = id;
      canvas.add(circle);
      sortCanvasByZIndex(canvas);

      canvas.renderAll();
    }
    else if (type === "image" && options.src) {
      const imgEl = new Image();
      imgEl.src = options.src;
      imgEl.onload = () => {
        const fabricImg = new fabric.Image(imgEl, options);
        fabricImg.id = id;
        canvas.add(fabricImg);
        sortCanvasByZIndex(canvas);
        canvas.renderAll();
      };
      imgEl.onerror = (err) => {
        console.error("Image failed to load:", options.src, err);
      };
    }
    // else handle other object types...
  };

  // Add a tile (image)
  const addTile = (tileName) => {
    // E.g. tileName='100A' => URL='http://localhost:5000/Images/Tiles/100A.png'
    const url = `http://localhost:5000/Images/Tiles/${tileName}.png`;
    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const fabricImg = new fabric.Image(imgEl, {
        left: 100,
        top: 100,
        scaleX: 0.2,
        scaleY: 0.2,
        selectable: true
      });
      fabricImg.id = `tile_${Date.now()}`;

      // Emit to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: {
          ...fabricImg.toObject(),
          src: url
        },
      });
    };

    imgEl.onerror = (err) => {
      console.error("Could not load tile image:", url, err);
    };
  };

  // Add a circle
  const addCircle = () => {
    const circleId = `circle_${Date.now()}`;
  
    // We only create a minimal definition for the server
    const circleOptions = {
      left: 150,
      top: 150,
      radius: 50,
      fill: "red",
      selectable: true,
    };
  
    // 1) We do *not* immediately add it to the local canvas
    // 2) We simply emit to the server
    socket.current.emit("addObject", {
      id: circleId,
      type: "circle",
      options: circleOptions,
    });
  };

  // Draw a big grid
  const drawGrid = (canvas, gridSize=10) => {
    const maxGridSize = 200000;
    const virtualWidth = maxGridSize;
    const virtualHeight = maxGridSize;

    for (let y = -virtualHeight/2; y <= virtualHeight/2; y += gridSize) {
      const line = new fabric.Line(
        [-virtualWidth/2, y, virtualWidth/2, y],
        { stroke: "#ccc", selectable: false, evented: false }
      );
      line.gridLine = true;
      canvas.add(line);
    }
    for (let x = -virtualWidth/2; x <= virtualWidth/2; x += gridSize) {
      const line = new fabric.Line(
        [x, -virtualHeight/2, x, virtualHeight/2],
        { stroke: "#ccc", selectable: false, evented: false }
      );
      line.gridLine = true;
      canvas.add(line);
    }

    // Add center lines
    const centerX = new fabric.Line(
      [400, -virtualHeight/2, 400, virtualHeight/2],
      { stroke: "black", strokeWidth: 2, selectable: false, evented: false }
    );
    const centerY = new fabric.Line(
      [-virtualWidth/2, 400, virtualWidth/2, 400],
      { stroke: "black", strokeWidth: 2, selectable: false, evented: false }
    );
    canvas.add(centerX, centerY);

    canvas.renderAll();
  };

  // We also have optional "bringToFront" or "sendToBack" if needed
  const bringToFront = (canvas, obj) => {
    const objects = canvas._objects;
    const idx = objects.indexOf(obj);
    if (idx >= 0) {
      objects.splice(idx, 1);
      objects.push(obj);
      canvas.renderAll();
    }
  };
  const sendToBack = (canvas, obj) => {
    const objects = canvas._objects;
    const idx = objects.indexOf(obj);
    if (idx >= 0) {
      objects.splice(idx, 1);
      objects.unshift(obj);
      canvas.renderAll();
    }
  };

  function sortCanvasByZIndex(canvas) {
    // Sort the objects array by each object's zIndex
    canvas._objects.sort((a, b) => {
      const zA = a.zIndex || 0;
      const zB = b.zIndex || 0;
      return zA - zB; // lower zIndex => draw first => behind
    });
    // Re-render so the new order is visible
    canvas.renderAll();
  }
  

  return (
    <div>
      <Toolbar addTile={addTile} addCircle={addCircle} />
      <canvas id="whiteboard" />
    </div>
  );
};

export default Whiteboard;
