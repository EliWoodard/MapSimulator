import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { io } from "socket.io-client";
import Toolbar from "./Toolbar";

const production = true;

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const socket = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Define map tile values
  const tileDimensions = {
    'Images/Tiles/100A.png': { width: 15, height: 10 },
    'Images/Tiles/100B.png': { width: 15, height: 10 },
    'Images/Tiles/101A.png': { width: 15, height: 10 },
    'Images/Tiles/101B.png': { width: 15, height: 10 },
    'Images/Tiles/102A.png': { width: 15, height: 10 },
    'Images/Tiles/102B.png': { width: 15, height: 10 },
    'Images/Tiles/103A.png': { width: 15, height: 10 },
    'Images/Tiles/103B.png': { width: 15, height: 10 },
    'Images/Tiles/104A.png': { width: 15, height: 10 },
    'Images/Tiles/104B.png': { width: 15, height: 10 },
    'Images/Tiles/200A.png': { width: 20, height: 20 },
    'Images/Tiles/200B.png': { width: 20, height: 20 },
    'Images/Tiles/201A.png': { width: 15, height: 17.5 },
    'Images/Tiles/201B.png': { width: 15, height: 17.5 },
    'Images/Tiles/202A.png': { width: 15, height: 20 },
    'Images/Tiles/202B.png': { width: 15, height: 20 },
    'Images/Tiles/203A.png': { width: 15, height: 22.5 },
    'Images/Tiles/203B.png': { width: 15, height: 22.5 },
    'Images/Tiles/204A.png': { width: 10, height: 22.5 },
    'Images/Tiles/204B.png': { width: 10, height: 22.5 },
    'Images/Tiles/205A.png': { width: 20, height: 17.5 },
    'Images/Tiles/205B.png': { width: 20, height: 17.5 },
    'Images/Tiles/206A.png': { width: 20, height: 17.5 },
    'Images/Tiles/206B.png': { width: 20, height: 17.5 },
    'Images/Tiles/207A.png': { width: 20, height: 12.5 },
    'Images/Tiles/207B.png': { width: 20, height: 12.5 },
    'Images/Tiles/208A.png': { width: 25, height: 15 },
    'Images/Tiles/208B.png': { width: 25, height: 15 },
    'Images/Tiles/209A.png': { width: 20, height: 15 },
    'Images/Tiles/209B.png': { width: 20, height: 15 },
    'Images/Tiles/210A.png': { width: 25, height: 15 },
    'Images/Tiles/210B.png': { width: 25, height: 15 },
    'Images/Tiles/211A.png': { width: 25, height: 17.5 },
    'Images/Tiles/211B.png': { width: 25, height: 17.5 },
    'Images/Tiles/212A.png': { width: 20, height: 15 },
    'Images/Tiles/212B.png': { width: 20, height: 15 },
    'Images/Tiles/213A.png': { width: 15, height: 17.5 },
    'Images/Tiles/213B.png': { width: 15, height: 17.5 },
    'Images/Tiles/214A.png': { width: 25, height: 17.5 },
    'Images/Tiles/214B.png': { width: 25, height: 17.5 },
    'Images/Tiles/215A.png': { width: 20, height: 15 },
    'Images/Tiles/215B.png': { width: 20, height: 15 },
    'Images/Tiles/216A.png': { width: 20, height: 15 },
    'Images/Tiles/216B.png': { width: 20, height: 15 },
    'Images/Tiles/217A.png': { width: 20, height: 15 },
    'Images/Tiles/217B.png': { width: 20, height: 15 },
    'Images/Tiles/218A.png': { width: 20, height: 15 },
    'Images/Tiles/218B.png': { width: 20, height: 15 },
    'Images/Tiles/219A.png': { width: 20, height: 12.5 },
    'Images/Tiles/219B.png': { width: 20, height: 12.5 },
    'Images/Tiles/220A.png': { width: 15, height: 20 },
    'Images/Tiles/220B.png': { width: 15, height: 20 },
    'Images/Tiles/221A.png': { width: 20, height: 15 },
    'Images/Tiles/221B.png': { width: 20, height: 15 },
    'Images/Tiles/222A.png': { width: 25, height: 12.5 },
    'Images/Tiles/222B.png': { width: 25, height: 12.5 },
    'Images/Tiles/223A.png': { width: 25, height: 15 },
    'Images/Tiles/223B.png': { width: 25, height: 15 },
    'Images/Tiles/224A.png': { width: 25, height: 12.5 },
    'Images/Tiles/224B.png': { width: 25, height: 12.5 },
    'Images/Tiles/225A.png': { width: 25, height: 17.5 },
    'Images/Tiles/225B.png': { width: 25, height: 17.5 },
    'Images/Tiles/226A.png': { width: 20, height: 17.5 },
    'Images/Tiles/226B.png': { width: 20, height: 17.5 },
    'Images/Tiles/227A.png': { width: 20, height: 17.5 },
    'Images/Tiles/227B.png': { width: 20, height: 15 },
    'Images/Tiles/300A.png': { width: 25, height: 17.5 },
    'Images/Tiles/300B.png': { width: 25, height: 17.5 },
    'Images/Tiles/301A.png': { width: 25, height: 20 },
    'Images/Tiles/301B.png': { width: 25, height: 20 },
    'Images/Tiles/302A.png': { width: 20, height: 22.5 },
    'Images/Tiles/302B.png': { width: 20, height: 22.5 },
    'Images/Tiles/303A.png': { width: 25, height: 20 },
    'Images/Tiles/303B.png': { width: 25, height: 20 },
    'Images/Tiles/304A.png': { width: 20, height: 25 },
    'Images/Tiles/304B.png': { width: 20, height: 25 },
    'Images/Tiles/305A.png': { width: 20, height: 22.5 },
    'Images/Tiles/305B.png': { width: 20, height: 22.5 },
    'Images/Tiles/306A.png': { width: 20, height: 20 },
    'Images/Tiles/306B.png': { width: 20, height: 20 },
    'Images/Tiles/307A.png': { width: 20, height: 22.5 },
    'Images/Tiles/307B.png': { width: 20, height: 22.5 },
    'Images/Tiles/308A.png': { width: 20, height: 22.5 },
    'Images/Tiles/308B.png': { width: 20, height: 22.5 },
    'Images/Tiles/309A.png': { width: 25, height: 20 },
    'Images/Tiles/309B.png': { width: 25, height: 20 },
    'Images/Tiles/310A.png': { width: 25, height: 17.5 },
    'Images/Tiles/310B.png': { width: 25, height: 17.5 },
    'Images/Tiles/311A.png': { width: 25, height: 20 },
    'Images/Tiles/311B.png': { width: 25, height: 20 },
    'Images/Tiles/312A.png': { width: 25, height: 20 },
    'Images/Tiles/312B.png': { width: 25, height: 20 },
    'Images/Tiles/313A.png': { width: 25, height: 15 },
    'Images/Tiles/313B.png': { width: 25, height: 15 },
    'Images/Tiles/314A.png': { width: 25, height: 17.5 },
    'Images/Tiles/314B.png': { width: 25, height: 17.5 },
    'Images/Tiles/315A.png': { width: 35, height: 15 },
    'Images/Tiles/315B.png': { width: 35, height: 15 },
    'Images/Tiles/316A.png': { width: 20, height: 22.5 },
    'Images/Tiles/316B.png': { width: 20, height: 22.5 },
    'Images/Tiles/317A.png': { width: 25, height: 25 },
    'Images/Tiles/317B.png': { width: 25, height: 25 },
    'Images/Tiles/318A.png': { width: 25, height: 15 },
    'Images/Tiles/318B.png': { width: 25, height: 15 },
    'Images/Tiles/319B.png': { width: 25, height: 17.5 },
    'Images/Tiles/320A.png': { width: 30, height: 25 },
    'Images/Tiles/320B.png': { width: 30, height: 25 },
    'Images/Tiles/400A.png': { width: 25, height: 25 },
    'Images/Tiles/400B.png': { width: 25, height: 25 },
    'Images/Tiles/401A.png': { width: 25, height: 22.5 },
    'Images/Tiles/401B.png': { width: 25, height: 22.5 },
    'Images/Tiles/402A.png': { width: 25, height: 25 },
    'Images/Tiles/402B.png': { width: 25, height: 25 },
    'Images/Tiles/403A.png': { width: 35, height: 27.5 },
    'Images/Tiles/403B.png': { width: 35, height: 27.5 },
    'Images/Tiles/404A.png': { width: 30, height: 20 },
    'Images/Tiles/404B.png': { width: 30, height: 20 },
    'Images/Tiles/500A.png': { width: 30, height: 27.5 },
    'Images/Tiles/500B.png': { width: 30, height: 27.5 },
    'Images/Tiles/Battlemap(1).png': { width: 40, height: 40 },
    'Images/Tiles/Battlemap(2).png': { width: 40, height: 40 },
    // 'Images/Tiles/100A.png': { width: 12, height: 8 },
    // 'Images/Tiles/100B.png': { width: 12, height: 8 },
    // 'Images/Tiles/101A.png': { width: 12, height: 8 },
    // 'Images/Tiles/101B.png': { width: 12, height: 8 },
    // 'Images/Tiles/102A.png': { width: 12, height: 8 },
    // 'Images/Tiles/102B.png': { width: 12, height: 8 },
    // 'Images/Tiles/103A.png': { width: 12, height: 8 },
    // 'Images/Tiles/103B.png': { width: 12, height: 8 },
    // 'Images/Tiles/104A.png': { width: 12, height: 8 },
    // 'Images/Tiles/104B.png': { width: 12, height: 8 },
    // 'Images/Tiles/200A.png': { width: 16, height: 16 },
    // 'Images/Tiles/200B.png': { width: 16, height: 16 },
    // 'Images/Tiles/201A.png': { width: 12, height: 14 },
    // 'Images/Tiles/201B.png': { width: 12, height: 14 },
    // 'Images/Tiles/202A.png': { width: 12, height: 16 },
    // 'Images/Tiles/202B.png': { width: 12, height: 16 },
    // 'Images/Tiles/203A.png': { width: 12, height: 18 },
    // 'Images/Tiles/203B.png': { width: 12, height: 18 },
    // 'Images/Tiles/204A.png': { width: 8, height: 18 },
    // 'Images/Tiles/204B.png': { width: 8, height: 18 },
    // 'Images/Tiles/205A.png': { width: 16, height: 14 },
    // 'Images/Tiles/205B.png': { width: 16, height: 14 },
    // 'Images/Tiles/206A.png': { width: 16, height: 14 },
    // 'Images/Tiles/206B.png': { width: 16, height: 14 },
    // 'Images/Tiles/207A.png': { width: 16, height: 10 },
    // 'Images/Tiles/207B.png': { width: 16, height: 10 },
    // 'Images/Tiles/208A.png': { width: 20, height: 12 },
    // 'Images/Tiles/208B.png': { width: 20, height: 12 },
    // 'Images/Tiles/209A.png': { width: 16, height: 12 },
    // 'Images/Tiles/209B.png': { width: 16, height: 12 },
    // 'Images/Tiles/210A.png': { width: 20, height: 12 },
    // 'Images/Tiles/210B.png': { width: 20, height: 12 },
    // 'Images/Tiles/211A.png': { width: 20, height: 14 },
    // 'Images/Tiles/211B.png': { width: 20, height: 14 },
    // 'Images/Tiles/212A.png': { width: 16, height: 12 },
    // 'Images/Tiles/212B.png': { width: 16, height: 12 },
    // 'Images/Tiles/213A.png': { width: 12, height: 14 },
    // 'Images/Tiles/213B.png': { width: 12, height: 14 },
    // 'Images/Tiles/214A.png': { width: 20, height: 14 },
    // 'Images/Tiles/214B.png': { width: 20, height: 14 },
    // 'Images/Tiles/215A.png': { width: 16, height: 12 },
    // 'Images/Tiles/215B.png': { width: 16, height: 12 },
    // 'Images/Tiles/216A.png': { width: 16, height: 12 },
    // 'Images/Tiles/216B.png': { width: 16, height: 12 },
    // 'Images/Tiles/217A.png': { width: 16, height: 12 },
    // 'Images/Tiles/217B.png': { width: 16, height: 12 },
    // 'Images/Tiles/218A.png': { width: 16, height: 12 },
    // 'Images/Tiles/218B.png': { width: 16, height: 12 },
    // 'Images/Tiles/219A.png': { width: 16, height: 10 },
    // 'Images/Tiles/219B.png': { width: 16, height: 10 },
    // 'Images/Tiles/220A.png': { width: 12, height: 16 },
    // 'Images/Tiles/220B.png': { width: 12, height: 16 },
    // 'Images/Tiles/221A.png': { width: 16, height: 12 },
    // 'Images/Tiles/221B.png': { width: 16, height: 12 },
    // 'Images/Tiles/222A.png': { width: 20, height: 10 },
    // 'Images/Tiles/222B.png': { width: 20, height: 10 },
    // 'Images/Tiles/223A.png': { width: 20, height: 12 },
    // 'Images/Tiles/223B.png': { width: 20, height: 12 },
    // 'Images/Tiles/224A.png': { width: 20, height: 10 },
    // 'Images/Tiles/224B.png': { width: 20, height: 10 },
    // 'Images/Tiles/225A.png': { width: 20, height: 14 },
    // 'Images/Tiles/225B.png': { width: 20, height: 14 },
    // 'Images/Tiles/226A.png': { width: 16, height: 14 },
    // 'Images/Tiles/226B.png': { width: 16, height: 14 },
    // 'Images/Tiles/227A.png': { width: 16, height: 12 },
    // 'Images/Tiles/227B.png': { width: 16, height: 12 },
    // 'Images/Tiles/300A.png': { width: 20, height: 14 },
    // 'Images/Tiles/300B.png': { width: 20, height: 14 },
    // 'Images/Tiles/301A.png': { width: 20, height: 16 },
    // 'Images/Tiles/301B.png': { width: 20, height: 16 },
    // 'Images/Tiles/302A.png': { width: 16, height: 18 },
    // 'Images/Tiles/302B.png': { width: 16, height: 18 },
    // 'Images/Tiles/303A.png': { width: 20, height: 16 },
    // 'Images/Tiles/303B.png': { width: 20, height: 16 },
    // 'Images/Tiles/304A.png': { width: 16, height: 20 },
    // 'Images/Tiles/304B.png': { width: 16, height: 20 },
    // 'Images/Tiles/305A.png': { width: 16, height: 18 },
    // 'Images/Tiles/305B.png': { width: 16, height: 18 },
    // 'Images/Tiles/306A.png': { width: 16, height: 16 },
    // 'Images/Tiles/306B.png': { width: 16, height: 16 },
    // 'Images/Tiles/307A.png': { width: 16, height: 18 },
    // 'Images/Tiles/307B.png': { width: 16, height: 18 },
    // 'Images/Tiles/308A.png': { width: 16, height: 18 },
    // 'Images/Tiles/308B.png': { width: 16, height: 18 },
    // 'Images/Tiles/309A.png': { width: 20, height: 16 },
    // 'Images/Tiles/309B.png': { width: 20, height: 16 },
    // 'Images/Tiles/310A.png': { width: 20, height: 14 },
    // 'Images/Tiles/310B.png': { width: 20, height: 14 },
    // 'Images/Tiles/311A.png': { width: 20, height: 16 },
    // 'Images/Tiles/311B.png': { width: 20, height: 16 },
    // 'Images/Tiles/312A.png': { width: 20, height: 16 },
    // 'Images/Tiles/312B.png': { width: 20, height: 16 },
    // 'Images/Tiles/313A.png': { width: 20, height: 12 },
    // 'Images/Tiles/313B.png': { width: 20, height: 12 },
    // 'Images/Tiles/314A.png': { width: 20, height: 14 },
    // 'Images/Tiles/314B.png': { width: 20, height: 14 },
    // 'Images/Tiles/315A.png': { width: 28, height: 12 },
    // 'Images/Tiles/315B.png': { width: 28, height: 12 },
    // 'Images/Tiles/316A.png': { width: 16, height: 18 },
    // 'Images/Tiles/316B.png': { width: 16, height: 18 },
    // 'Images/Tiles/317A.png': { width: 20, height: 20 },
    // 'Images/Tiles/317B.png': { width: 20, height: 20 },
    // 'Images/Tiles/318A.png': { width: 20, height: 12 },
    // 'Images/Tiles/318B.png': { width: 20, height: 12 },
    // 'Images/Tiles/319B.png': { width: 20, height: 14 },
    // 'Images/Tiles/320A.png': { width: 24, height: 20 },
    // 'Images/Tiles/320B.png': { width: 24, height: 20 },
    // 'Images/Tiles/400A.png': { width: 20, height: 20 },
    // 'Images/Tiles/400B.png': { width: 20, height: 20 },
    // 'Images/Tiles/401A.png': { width: 20, height: 18 },
    // 'Images/Tiles/401B.png': { width: 20, height: 18 },
    // 'Images/Tiles/402A.png': { width: 20, height: 20 },
    // 'Images/Tiles/402B.png': { width: 20, height: 20 },
    // 'Images/Tiles/403A.png': { width: 28, height: 22 },
    // 'Images/Tiles/403B.png': { width: 28, height: 22 },
    // 'Images/Tiles/404A.png': { width: 24, height: 16 },
    // 'Images/Tiles/404B.png': { width: 24, height: 16 },
    // 'Images/Tiles/500A.png': { width: 24, height: 22 },
    // 'Images/Tiles/500B.png': { width: 24, height: 22 },
    // 'Images/Tiles/Battlemap(1).png': { width: 40, height: 40 },
    // 'Images/Tiles/Battlemap(2).png': { width: 40, height: 40 },
  };

  function createLobby() {
    const newSessionId = Math.random().toString(36).substr(2, 8);
    setSessionId(newSessionId);
    setIsCreating(true);
    document.getElementById("mainLobby").style.display = "none";
  }

  function enterJoinLobby() {
    document.getElementById("mainLobby").style.display = "none";
    document.getElementById("joinLobby").style.display = "flex";
  }

  function joinLobby() {
    const inputSession = document.getElementById("sessionInput").value;
    if (inputSession) {
      setSessionId(inputSession);
      setIsCreating(false);
      document.getElementById("joinLobby").style.display = "none";
    }
  }

  function goBack() {
    document.getElementById("joinLobby").style.display = "none";
    document.getElementById("mainLobby").style.display = "flex";
  }

  useEffect(() => {
    if (!sessionId) return;
    // Use production or test host
    let serverUrl = "";
    if (production == false) {
      serverUrl = "http://localhost:5000";
      socket.current = io(serverUrl, {
        query: { sessionId, create: isCreating.toString() },
      });
    } else {
      serverUrl = process.env.REACT_APP_SERVER_URL || window.location.origin;
      socket.current = io(serverUrl, {
        query: { sessionId, create: isCreating.toString() },
      });
    }

    const containerEl = document.getElementById("canvasContainer");
    const whiteboardEl = document.getElementById("whiteboard");

    // 1) Create the Fabric.js canvas with minimal config
    const canvas = new fabric.Canvas(whiteboardEl, {
      selection: false,
      preserveObjectStacking: true
    });

    // 2) Match the drawing surface to the container's size
    canvas.setWidth(containerEl.clientWidth);
    canvas.setHeight(containerEl.clientHeight);

    // (Optional) If you want to re-size automatically on window resize:
    function handleResize() {
      canvas.setWidth(containerEl.clientWidth);
      canvas.setHeight(containerEl.clientHeight);
      // Re-render
      canvas.renderAll();
    }
    window.addEventListener("resize", handleResize);

    // 3) Now set background gradient or anything else
    // const gradient = new fabric.Gradient({
    //   type: 'linear',
    //   coords: { x1: 0, y1: 0, x2: canvas.getWidth(), y2: canvas.getHeight() },
    //   colorStops: [
    //     { offset: 0, color: '#ffffff' },
    //     { offset: 1, color: '#ACACAC' }
    //   ]
    // });
    canvas.backgroundColor = "rgb(231, 231, 231)";
    canvas.renderAll();


    canvasRef.current = canvas;

    // 2) Draw a big grid
    drawGrid(canvas, 50);

    // Repositions the grid to be centered
    const vpt = canvas.viewportTransform;
    vpt[4] = canvas.getWidth() / 2;
    vpt[5] = canvas.getHeight() / 2;
    canvas.setViewportTransform(vpt);
    canvas.renderAll();

    let isRotating = false;

    document.addEventListener("keydown", (e) => {
      // Skip repeated events if you only want one rotation per press
      if (e.repeat) return;

      // If arrow keys, prevent default page scroll
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }

      const activeObject = canvasRef.current.getActiveObject();
      if (!activeObject || activeObject.type !== 'image') return;

      let newAngle = activeObject.angle || 0;
      if (e.key === 'ArrowLeft') {
        newAngle -= 15;
      } else if (e.key === 'ArrowRight') {
        newAngle += 15;
      } else {
        return; // not a rotation key
      }

      activeObject.set('angle', newAngle);
      activeObject.setCoords();
      canvasRef.current.renderAll();

      socket.current.emit("update", {
        id: activeObject.id,
        options: activeObject.toObject(),
      });
    });

    // 3) Zoom + pan listeners
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.max(0.2, Math.min(zoom, 3));
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

    // 5) On initCanvas from server => create objects
    socket.current.on("initCanvas", (objects) => {
      console.log("initCanvas with objects:", objects);
      objects.forEach((objData) => {
        createFabricObject(objData, canvas);
      });
    });

    // 6) On objectAdded (from other clients)
    socket.current.on("objectAdded", (data) => {
      console.log("objectAdded from server:", data);
      createFabricObject(data, canvasRef.current);
    });

    // 7) On objectDeleted
    socket.current.on("objectDeleted", (objectId) => {
      console.log("objectDeleted from server:", objectId);
      const obj = canvas.getObjects().find((o) => o.id === objectId);
      if (obj) {
        canvas.remove(obj);
        canvas.renderAll();
      }
    });

    // 8) On update
    socket.current.on("update", ({ id, options }) => {
      console.log("update from server for:", id);
      const obj = canvas.getObjects().find((o) => o.id === id);
      if (obj) {
        obj.set(options);
        obj.setCoords();
        canvas.renderAll();
      }
    });

    // 9) local object modified => emit "update"
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
      window.removeEventListener("resize", () => { });
      socket.current && socket.current.disconnect();
      canvas.dispose();
    };
  }, [sessionId, isCreating]);

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

        // Remove custom rotation and resizing
        fabricImg.set({
          originX: 'center',
          originY: 'center',
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hasControls: false,
        });

        fabricImg.id = id;
        canvas.add(fabricImg);
        sortCanvasByZIndex(canvas);
        canvas.renderAll();
      };
      imgEl.onerror = (err) => {
        console.error("Image failed to load:", options.src, err);
      };
    }
    // else handle future object types...
  };

  // Add a tile (image)
  const addTile = (tileName) => {
    let url = "";
    if (production == false) {
      url = `http://localhost:5000/Images/Tiles/${tileName}.png`
    } else {
      url = `${window.location.origin}/Images/Tiles/${tileName}.png`;
    }
    
    const tilePath = `Images/Tiles/${tileName}.png`;
    // Add player
    // const playerPath = `Images/Tokens/${tileName}.png`
    let { newWidth, newHeight } = tileDimensions[tilePath];

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const originalWidth = imgEl.naturalWidth;
      const originalHeight = imgEl.naturalHeight;

      let { width: tileWidth, height: tileHeight } = tileDimensions[tilePath];

      // Set the scale factor based on the original image size
      const scaleX = tileWidth / (originalWidth / 30);
      const scaleY = tileHeight / (originalHeight / 30);

      const fabricImg = new fabric.Image(imgEl, {
        left: 400,
        top: 400,
        width: originalWidth,  // Fabric sets this automatically
        height: originalHeight,
        scaleX: scaleX, // Scale to match tile dimensions
        scaleY: scaleY,
      });


      fabricImg.id = `tile_${Date.now()}`;

      canvasRef.current.renderAll();

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

  function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.classList.toggle("hidden");
  }

  function selectPlayer(playerName) {
    toggleDropdown();
    console.log(`Selected player: ${playerName}`);

    // Emit player to backend
    let url = "";
    if (production == false) {
      url = `http://localhost:5000/Images/Players/${playerName}.png`;
    } else {
      url = `${window.location.origin}/Images/Players/${playerName}.png`;  
    }
    

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const originalWidth = imgEl.naturalWidth;
      const originalHeight = imgEl.naturalHeight;


      const fabricImg = new fabric.Image(imgEl, {
        left: 400,
        top: 400,
        width: originalWidth,
        height: originalHeight,
        scaleX: .2,
        scaleY: .2,
      });


      fabricImg.id = `player_${Date.now()}`;

      canvasRef.current.renderAll();

      // Emit to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: {
          ...fabricImg.toObject(),
          src: url
        },
      });
    }
  }

  function toggleDropdownEnemy() {
    const dropdownMenuEnemy = document.getElementById("dropdownMenuEnemy");
    dropdownMenuEnemy.classList.toggle("hidden");
  }

  function selectEnemy(enemyName) {
    toggleDropdownEnemy();
    console.log(`Selected enemy: ${enemyName}`);

    // Emit enemy to backend
    let url = "";
    if (production == false) {
      url = `http://localhost:5000/Images/Enemys/${enemyName}.png`;
    } else {
      url = `${window.location.origin}/Images/Enemys/${enemyName}.png`;
    }

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const originalWidth = imgEl.naturalWidth;
      const originalHeight = imgEl.naturalHeight;

      const fabricImg = new fabric.Image(imgEl, {
        left: 400,
        top: 400,
        width: originalWidth,
        height: originalHeight,
        scaleX: .2,
        scaleY: .2,
      });

      fabricImg.id = `enemy_${Date.now()}`;

      canvasRef.current.renderAll();

      // Emit to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: {
          ...fabricImg.toObject(),
          src: url
        },
      });
    }
  }

  function toggleDropdownBanner() {
    const dropdownMenuBanner = document.getElementById("dropdownMenuBanner");
    dropdownMenuBanner.classList.toggle("hidden");
  }

  function selectBanner(bannerName) {
    toggleDropdownBanner();
    console.log(`Selected banner: ${bannerName}`);

    // Emit banner to backend
    let url = "";
    if (production == false) {
      url = `http://localhost:5000/Images/Banners/${bannerName}.png`;
    } else {
      url = `${window.location.origin}/Images/Banners/${bannerName}.png`;
    }

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const originalWidth = imgEl.naturalWidth;
      const originalHeight = imgEl.naturalHeight;

      const fabricImg = new fabric.Image(imgEl, {
        left: 400,
        top: 400,
        width: originalWidth,
        height: originalHeight,
        scaleX: .2,
        scaleY: .2,
      });

      fabricImg.id = `banner_${Date.now()}`;

      canvasRef.current.renderAll();

      // Emit to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: {
          ...fabricImg.toObject(),
          src: url
        },
      });
    }
  }

  function toggleDropdownToken() {
    const dropdownMenuTokens = document.getElementById("dropdownMenuTokens");
    dropdownMenuTokens.classList.toggle("hidden");
  }

  function selectToken(tokenName) {
    toggleDropdownToken();
    console.log(`Selected Token: ${tokenName}`);

    // Emit token to backend
    let url = "";
    if (production == false) {
      url = `http://localhost:5000/Images/Tokens/${tokenName}.png`;
    } else {
      url = `${window.location.origin}/Images/Tokens/${tokenName}.png`;
    }

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const originalWidth = imgEl.naturalWidth;
      const originalHeight = imgEl.naturalHeight;

      const fabricImg = new fabric.Image(imgEl, {
        left: 400,
        top: 400,
        width: originalWidth,
        height: originalHeight,
        scaleX: .2,
        scaleY: .2,
      });

      fabricImg.id = `token_${Date.now()}`;

      canvasRef.current.renderAll();

      // Emit to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: {
          ...fabricImg.toObject(),
          src: url
        },
      });
    }
  }

  function toggleDropdownEnvironment() {
    const dropdownMenuTokens = document.getElementById("dropdownMenuEnvironments");
    dropdownMenuTokens.classList.toggle("hidden");
  }

  function selectEnvironment(EnvironmentName) {
    toggleDropdownEnvironment();
    console.log(`Selected Environment: ${EnvironmentName}`);

    // Emit Environment to backend
    let url = "";
    if (production == false) {
      url = `http://localhost:5000/Images/Environments/${EnvironmentName}.png`;
    } else {
      url = `${window.location.origin}/Images/Environments/${EnvironmentName}.png`;
    }

    const imgEl = new Image();
    imgEl.src = url;

    imgEl.onload = () => {
      const originalWidth = imgEl.naturalWidth;
      const originalHeight = imgEl.naturalHeight;

      const fabricImg = new fabric.Image(imgEl, {
        left: 400,
        top: 400,
        width: originalWidth,
        height: originalHeight,
        scaleX: .2,
        scaleY: .2,
      });

      fabricImg.id = `environment_${Date.now()}`;

      canvasRef.current.renderAll();

      // Emit to server
      socket.current.emit("addObject", {
        id: fabricImg.id,
        type: "image",
        options: {
          ...fabricImg.toObject(),
          src: url
        },
      });
    }
  }

  // Draw a big grid
  const drawGrid = (canvas, gridSize = 10) => {
    const maxGridSize = 200000;
    const virtualWidth = maxGridSize;
    const virtualHeight = maxGridSize;

    for (let y = -virtualHeight / 2; y <= virtualHeight / 2; y += gridSize) {
      const line = new fabric.Line(
        [-virtualWidth / 2, y, virtualWidth / 2, y],
        { stroke: "#333", selectable: false, evented: false }
      );
      line.gridLine = true;
      canvas.add(line);
    }
    for (let x = -virtualWidth / 2; x <= virtualWidth / 2; x += gridSize) {
      const line = new fabric.Line(
        [x, -virtualHeight / 2, x, virtualHeight / 2],
        { stroke: "#333", selectable: false, evented: false }
      );
      line.gridLine = true;
      canvas.add(line);
    }

    // Add center lines
    const centerX = new fabric.Line(
      [0, -virtualHeight / 2, 0, virtualHeight / 2],
      { stroke: "black", strokeWidth: 2, selectable: false, evented: false }
    );

    const centerY = new fabric.Line(
      [-virtualWidth / 2, 0, virtualWidth / 2, 0],
      { stroke: "black", strokeWidth: 2, selectable: false, evented: false }
    );

    canvas.add(centerX, centerY);

    canvas.renderAll();
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
    <div id="mainBody">
      <div id="mainLobby">
        <button className="lobbyButtons" id="createLobby" onClick={createLobby}>
          Create Lobby
        </button>
        <button className="lobbyButtons" id="enterJoinLobby" onClick={enterJoinLobby}>
          Join Lobby
        </button>
      </div>
      <div id="joinLobby">
        <button className="backButton" onClick={goBack}>&larr;</button>
        <input className="inputBox" id="sessionInput" placeholder="Enter Session ID" />
        <button className="lobbyButtons" onClick={joinLobby}>
          Join Lobby
        </button>
      </div>
      <div id="toolbar">
        <Toolbar
          addTile={addTile}
          addCircle={addCircle}
          selectPlayer={selectPlayer}
          toggleDropdown={toggleDropdown}
          selectEnemy={selectEnemy}
          toggleDropdownEnemy={toggleDropdownEnemy}
          selectBanner={selectBanner}
          toggleDropdownBanner={toggleDropdownBanner}
          selectToken={selectToken}
          toggleDropdownToken={toggleDropdownToken}
          selectEnvironment={selectEnvironment}
          toggleDropdownEnvironment={toggleDropdownEnvironment}
        />
      </div>
      <div id="canvasContainer">
        <canvas id="whiteboard" />
      </div>
      {sessionId && (
        <div id="sessionIdDisplay">
          Session ID: {sessionId}
        </div>
      )}
    </div>
  );
};
export default Whiteboard;
