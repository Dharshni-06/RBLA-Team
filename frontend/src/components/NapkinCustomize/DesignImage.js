import React, { useEffect, useState } from "react";
import { Image } from "react-konva";

export default function DesignImage({
  src,
  x,
  y,
  width,
  height,
  isEditing,
  onChange,
  color
}) {
  const [img, setImg] = useState(null);

  useEffect(() => {
    const image = new window.Image();
    image.src = src;
    image.onload = () => setImg(image);
  }, [src]);

  return (
    <Image
      image={img}
      x={x}
      y={y}
      width={width}
      height={height}
      draggable={isEditing}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      filters={color ? [window.Konva.Filters.RGBA] : []} // apply filter if color exists
      fill={color} // apply selected color
    />
  );
}
