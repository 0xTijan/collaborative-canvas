import React from "react";
import DisplaySelectColor from "./DispalySelectColor";

interface CanvasSettingsProps {
  color: string,
  setColor: Function
}

const CanvasSettings: React.FC<CanvasSettingsProps> = ({
  color,
  setColor
}) => {
  return(
    <div className="canvas-settings-div">
      <DisplaySelectColor
        colorName="Red"
        cssColorValue="red"
        selected={false}
        setColor={setColor}
      />
      <DisplaySelectColor
        colorName="Blue"
        cssColorValue="blue"
        selected={false}
        setColor={setColor}
      />
      <DisplaySelectColor
        colorName="Green"
        cssColorValue="green"
        selected={false}
        setColor={setColor}
      />
      <DisplaySelectColor
        colorName="Yellow"
        cssColorValue="yellow"
        selected={false}
        setColor={setColor}
      />
      <DisplaySelectColor
        colorName="Black"
        cssColorValue="black"
        selected={false}
        setColor={setColor}
      />
    </div>
  )
}

export default CanvasSettings;