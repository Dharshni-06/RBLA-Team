import React from "react";
import { Line } from "react-konva";

export default function LineShape({
  orientation,
  x,
  y,
  length,
  thickness,
  color,
  isEditing,
  onChange,
}) {
  return (
    <Line
      x={x}
      y={y}
      points={
        orientation === "vertical"
          ? [0, 0, 0, length] // vertical line
          : [0, 0, length, 0] // horizontal line
      }
      stroke={color}
      strokeWidth={thickness}
        lineCap="round"
        lineJoin="round"
      draggable={isEditing}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}
