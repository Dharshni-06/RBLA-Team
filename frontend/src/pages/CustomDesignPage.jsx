import React, { useRef, useEffect, useState } from 'react';
import { Canvas, Rect, Circle, Textbox, Triangle, Ellipse, Polygon, Path } from 'fabric';  // Correct imports
import 'font-awesome/css/font-awesome.min.css'; // Import FontAwesome
import './CustomDesignPage.css'; // Import the CSS file


const CustomDesignPage = () => {
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]); // To track the history of actions for undo
  const [drawing, setDrawing] = useState(false); // Flag to check if the pencil tool is active
  const [isEraser, setIsEraser] = useState(false); // Flag to check if the eraser tool is active

  useEffect(() => {
    if (canvasRef.current) return; // ✅ prevent double init (React 18 Strict Mode)

    const canvas = new Canvas('designCanvas', {
      width: 600,
      height: 800,
      backgroundColor: '#f0f0f0',
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();       // ✅ properly destroy fabric canvas
      canvasRef.current = null;
    };
  }, []);
  // Function to start drawing with pencil tool
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!drawing || isEraser) return;

    const rect = canvas.getElement().getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const path = new Path(`M ${startX} ${startY}`, {
      fill: '',
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
    });

    canvas.add(path);
    setHistory((prevHistory) => [...prevHistory, path]);

    const onMouseMove = (e) => {
      if (drawing && !isEraser) {
        const pointer = canvas.getPointer(e.e); // ✅ Fabric event here, this is fine
        path.path.push(['L', pointer.x, pointer.y]);
        canvas.renderAll();
      }
    };

    const onMouseUp = () => {
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };

    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
  };

  // Function to start erasing
  const startErasing = (e) => {
    const canvas = canvasRef.current;
    if (!isEraser) return; // ✅ only run when eraser is active

    // ✅ e here is a React MouseEvent, not a Fabric event
    // so use e.nativeEvent directly, NOT canvas.getPointer(e.e)
    const rect = canvas.getElement().getBoundingClientRect();
    const pointer = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // ✅ Only erase when mouse button is held down
    if (e.buttons !== 1) return;

    const activeObject = canvas.findTarget(e.nativeEvent);

    if (activeObject) {
      canvas.remove(activeObject);
      setHistory((prevHistory) =>
        prevHistory.filter((item) => item !== activeObject)
      );
      canvas.renderAll();
    }
  };

  // Function to add shapes to the canvas
  const addShape = (shape) => {
    const canvas = canvasRef.current;
    let addedObject = null;

    if (shape === 'rectangle') {
      addedObject = new Rect({
        left: 50,
        top: 50,
        fill: 'blue',
        width: 100,
        height: 100,
      });
    } else if (shape === 'circle') {
      addedObject = new Circle({
        left: 150,
        top: 50,
        fill: 'red',
        radius: 50,
      });
    } else if (shape === 'triangle') {
      addedObject = new Triangle({
        left: 250,
        top: 50,
        width: 100,
        height: 100,
        fill: 'green',
      });
    } else if (shape === 'ellipse') {
      addedObject = new Ellipse({
        left: 350,
        top: 50,
        rx: 70,
        ry: 40,
        fill: 'purple',
      });
    } else if (shape === 'polygon') {
      addedObject = new Polygon([
        { x: 400, y: 100 },
        { x: 460, y: 150 },
        { x: 420, y: 210 },
        { x: 380, y: 210 },
        { x: 340, y: 150 },
      ], {
        fill: 'orange',
        left: 50,
        top: 200,
      });
    } else if (shape === 'star') {
      addedObject = new Polygon([
        { x: 500, y: 200 },
        { x: 520, y: 230 },
        { x: 550, y: 220 },
        { x: 530, y: 250 },
        { x: 540, y: 280 },
        { x: 500, y: 270 },
        { x: 460, y: 280 },
        { x: 470, y: 250 },
        { x: 450, y: 220 },
        { x: 480, y: 230 },
      ], {
        fill: 'yellow',
        left: 100,
        top: 300,
      });
    }

    if (addedObject) {
      canvas.add(addedObject);
      canvas.renderAll();
      setHistory((prevHistory) => [...prevHistory, addedObject]); // Track added object for undo
    }
  };

  // Function to add text to the canvas
  const addText = () => {
    const canvas = canvasRef.current;
    const text = new Textbox('Your Text Here', {
      left: 50,
      top: 200,
      width: 200,
      fontSize: 20,
    });
    canvas.add(text);
    canvas.renderAll();
    setHistory((prevHistory) => [...prevHistory, text]); // Track added text for undo
  };

  // Undo function to remove the last added object
  const undo = () => {
    const canvas = canvasRef.current;
    const lastObject = history[history.length - 1];
    if (lastObject) {
      canvas.remove(lastObject);
      setHistory(history.slice(0, -1)); // Remove the last object from history
    }
  };

  // Clear the entire canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.clear();
    setHistory([]); // Reset history after clearing the canvas
  };

  // Change the color of the selected object
  const changeColor = (color) => {
    const canvas = canvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      activeObject.set({ fill: color });
      canvas.renderAll();
    }
  };

  return (
    <div className="container">
      <div className="design-tools">
        <h3>Design Tools</h3>
        {/* Icons for design tools */}
        <div className="tools-icons">
          <i
            className="fa fa-square fa-2x"
            title="Add Rectangle"
            onClick={() => addShape('rectangle')}
          ></i>
          <i
            className="fa fa-circle fa-2x"
            title="Add Circle"
            onClick={() => addShape('circle')}
          ></i>
          <i
            className="fa fa-caret-up fa-2x"
            title="Add Triangle"
            onClick={() => addShape('triangle')}
          ></i>
          <i
            className="fa fa-font fa-2x"
            title="Add Text"
            onClick={addText}
          ></i>
          {/* Add new shapes */}
          <i
            className="fa fa-circle-o fa-2x"
            title="Add Ellipse"
            onClick={() => addShape('ellipse')}
          ></i>
          <i
            className="fa fa-star fa-2x"
            title="Add Star"
            onClick={() => addShape('star')}
          ></i>
          <i
            className="fa fa-diamond fa-2x"
            title="Add Polygon"
            onClick={() => addShape('polygon')}
          ></i>

          {/* Pencil Tool Icon */}
          <i
            className="fa fa-pencil fa-2x"
            title="Pencil Tool"
            onClick={() => {
              setDrawing(true);
              setIsEraser(false); // Disable eraser when using pencil tool
            }}
          ></i>

          {/* Eraser Tool Icon */}
          <i
            className="fa fa-eraser fa-2x"
            title="Eraser Tool"
            onClick={() => {
              setIsEraser(true);
              setDrawing(false); // Disable pencil tool when using eraser
            }}
          ></i>

          {/* Undo Icon */}
          <i
            className="fa fa-undo fa-2x"
            title="Undo"
            onClick={undo}
          ></i>

          {/* Clear Icon */}
          <i
            className="fa fa-trash fa-2x"
            title="Clear Canvas"
            onClick={clearCanvas}
          ></i>

          {/* Color Picker for Changing Colors */}
          <input
            type="color"
            title="Change Color"
            onChange={(e) => changeColor(e.target.value)}
          />
        </div>
      </div>
      <div
        className="design-canvas-wrapper"
        onMouseDown={startDrawing}  // This will trigger startDrawing when the mouse is pressed
        onMouseMove={startErasing}  // This will trigger startErasing when the mouse is moved
      >
        <canvas id="designCanvas"></canvas>
      </div>

    </div>
  );
};

export default CustomDesignPage;
