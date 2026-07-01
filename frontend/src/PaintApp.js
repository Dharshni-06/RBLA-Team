import React, { useRef, useState, useEffect } from "react";

const PaintApp = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [circleCount, setCircleCount] = useState(0);
  const [circleRadius, setCircleRadius] = useState(30); // Default radius
  const [circles, setCircles] = useState([]); // Store circles
  const [draggingCircle, setDraggingCircle] = useState(null); // Circle being dragged
  const [dragOffset] = useState({ x: 0, y: 0 }); // Offset of the mouse relative to the circle center

  // Initialize the canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8; // Full width minus padding
    canvas.height = 500; // Fixed height
    canvas.style.border = "1px solid black";

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    contextRef.current = ctx;
  }, [brushColor, brushSize]); // Add dependencies for dynamic updates

  // Function to draw circles
  const drawCircle = ({ x, y, radius }) => {
    contextRef.current.beginPath();
    contextRef.current.arc(x, y, radius, 0, 2 * Math.PI);
    contextRef.current.fill();
    contextRef.current.stroke();
  };

  // Draw all circles in the circles array
  const redrawCircles = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear canvas
    circles.forEach((circle) => drawCircle(circle)); // Redraw each circle
  };

  // Mouse move event to drag the circle
  const onMouseMove = ({ nativeEvent }) => {
    if (draggingCircle) {
      const { offsetX, offsetY } = nativeEvent;
      // Update the position of the circle being dragged
      const newCircle = {
        ...draggingCircle,
        x: offsetX - dragOffset.x,
        y: offsetY - dragOffset.y,
      };

      const updatedCircles = circles.map((circle) =>
        circle === draggingCircle ? newCircle : circle
      );
      setCircles(updatedCircles); // Update the circles array
      redrawCircles(); // Redraw the canvas with updated circles
    }
  };

  // Mouse up event to stop dragging
  const onMouseUp = () => {
    setDraggingCircle(null); // Stop dragging
  };

  // Add a new circle at the mouse position
  const addCircle = ({ nativeEvent }) => {
    if (circleCount >= 30) return; // Limit to 30 circles

    const { offsetX, offsetY } = nativeEvent;

    const newCircle = {
      x: offsetX,
      y: offsetY,
      radius: circleRadius,
    };

    setCircles((prevCircles) => [...prevCircles, newCircle]);
    setCircleCount(circleCount + 1);
    redrawCircles(); // Redraw the circles
  };

  // Clear the canvas and reset state
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setCircles([]);
    setCircleCount(0); // Reset circle count
  };

  // Save the drawing
  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "my-drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Paint Application</h1>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>
          Brush Color:
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ marginLeft: "5px" }}
          />
        </label>
        <label style={{ marginRight: "10px" }}>
          Brush Size:
          <input
            type="number"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(e.target.value)}
            style={{ marginLeft: "5px", width: "50px" }}
          />
        </label>
        <label style={{ marginRight: "10px" }}>
          Circle Radius:
          <input
            type="number"
            min="5"
            max="100"
            value={circleRadius}
            onChange={(e) => setCircleRadius(e.target.value)}
            style={{ marginLeft: "5px", width: "50px" }}
          />
        </label>
        <button onClick={clearCanvas} style={{ margin: "0 10px" }}>
          Clear Canvas
        </button>
        <button onClick={saveDrawing}>Save Drawing</button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={addCircle} // Add circle on click
        onMouseMove={onMouseMove} // Drag the circle
        onMouseUp={onMouseUp} // Stop dragging
        onMouseLeave={onMouseUp} // Stop dragging if mouse leaves canvas
        style={{
          cursor: "crosshair",
        }}
      ></canvas>
      <div>
        <p>Circles Drawn: {circleCount} / 30</p>
      </div>
    </div>
  );
};

export default PaintApp;
