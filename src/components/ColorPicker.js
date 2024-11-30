import React, { useEffect, useState } from "react";

const colors = [
  { r: 0xe4, g: 0x3f, b: 0x00 },
  { r: 0xfa, g: 0xe4, b: 0x10 },
  { r: 0x55, g: 0xcc, b: 0x3b },
  { r: 0x09, g: 0xad, b: 0xff },
  { r: 0x6b, g: 0x0e, b: 0xfd },
  { r: 0xe7, g: 0x0d, b: 0x86 },
  { r: 0xe4, g: 0x3f, b: 0x00 },
];

const rgbToHex = (r, g, b) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

const CircularColorPicker = ({ onColorSelect }) => {
  const [isPicking, setIsPicking] = useState(false);

  const handleStart = (e) => {
    setIsPicking(true);
    pickColor(e);
  };

  const handleEnd = () => {
    setIsPicking(false);
  };

  const handleMove = (e) => {
    if (isPicking) {
      pickColor(e);
    }
  };

  const pickColor = (e) => {
    e.preventDefault();

    const colorWheel = document.getElementById("color-wheel");
    const rect = colorWheel.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = 2 * (clientX - rect.left) / (rect.right - rect.left) - 1;
    const y = 1 - 2 * (clientY - rect.top) / (rect.bottom - rect.top);
    let a = ((Math.PI / 2 - Math.atan2(y, x)) / Math.PI) * 180;
    if (a < 0) a += 360;
    a = (a / 360) * (colors.length - 1);
    const a0 = Math.floor(a) % colors.length;
    const a1 = (a0 + 1) % colors.length;
    const c0 = colors[a0];
    const c1 = colors[a1];
    const a1w = a - Math.floor(a);
    const a0w = 1 - a1w;
    let color = {
      r: c0.r * a0w + c1.r * a1w,
      g: c0.g * a0w + c1.g * a1w,
      b: c0.b * a0w + c1.b * a1w,
    };
    const r = Math.min(1, Math.sqrt(x * x + y * y));
    const cw = r < 0.8 ? r / 0.8 : 1;
    const ww = 1 - cw;
    color.r = Math.round(color.r * cw + 255 * ww);
    color.g = Math.round(color.g * cw + 255 * ww);
    color.b = Math.round(color.b * cw + 255 * ww);
    const hexColor = rgbToHex(color.r, color.g, color.b);
    onColorSelect(hexColor);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, []);

  return (
    <div
      id="color-wheel"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      style={{
        width: "170px",
        height: "170px",
        margin: "6px 0px",
        background:
          "radial-gradient(white, transparent 80%), conic-gradient(#e43f00, #fae410, #55cc3b, #09adff, #6b0efd, #e70d86, #e43f00)",
        borderRadius: "50%",
        position: "relative",
        cursor: "crosshair",
      }}
    ></div>
  );
};

export default CircularColorPicker;
