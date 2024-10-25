import React, { useState } from "react";
import Wheel from "@uiw/react-color-wheel";
import { hsvaToHex } from "@uiw/react-color";

export function ColorPicker({ onColorChange }) {
  const [hsva, setHsva] = useState({ h: 214, s: 43, v: 90, a: 1 });

  return (
    <>
      <div className="colorpicker-container grid justify-center">
        <Wheel
          color={hsva}
          onChange={(color) => {
            setHsva(color.hsva);
            onColorChange(hsvaToHex(color.hsva));
          }}
        />
      </div>
    </>
  );
}
