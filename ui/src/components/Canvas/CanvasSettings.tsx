import { Slider } from "@mui/material";
import { type } from "@testing-library/user-event/dist/type";
import React from "react";
import DisplaySelectColor from "./DispalySelectColor";
import { CgErase } from "react-icons/cg";

interface CanvasSettingsProps {
  color: string,
  setColor: Function,
  clearCanvas: Function,
  lineWidth: number,
  setLineWidth: Function,
}

type color= {
  colorName: string,
  cssColorValue: string
}

const Colors: color[] = [
  {
    colorName: "Red",
    cssColorValue: "red"
  },
  {
    colorName: "Green",
    cssColorValue: "green"
  },
  {
    colorName: "Blue",
    cssColorValue: "blue"
  },
  {
    colorName: "Yellow",
    cssColorValue: "yellow"
  },
  {
    colorName: "Orange",
    cssColorValue: "orange"
  },
  {
    colorName: "Purple",
    cssColorValue: "purple"
  },
  {
    colorName: "Grey",
    cssColorValue: "grey"
  },
  {
    colorName: "Cyan",
    cssColorValue: "cyan"
  },
  {
    colorName: "Brown",
    cssColorValue: "brown"
  },
];

const EraserStyles = {
  backgroundColor: "white",
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "1000px",
  borderWidth: "4px",
  marginLeft: "1rem",
  marginRight: "1rem",
}

const CanvasSettings: React.FC<CanvasSettingsProps> = ({
  color,
  setColor,
  clearCanvas,
  lineWidth,
  setLineWidth
}) => {

  const getSelected = (cssColorValue: string) => {
    if(color==cssColorValue) return true;
    else return false;
  }

  const getEraserBg = () => {
    if(color=="white") return "grey"
    else return "transparent";
  }

  return(
    <div>
      <div className="canvas-settings-div1">
        {Colors.map((color: color, index: number) => {
          return(
            <DisplaySelectColor
              key={index}
              colorName={color.colorName}
              cssColorValue={color.cssColorValue}
              selected={getSelected(color.cssColorValue)}
              setColor={setColor}
            />
          )
        })}
        <div
          className="select-color"
          style={{ backgroundColor: getEraserBg() }}
          onClick={() => setColor("white")}
        >
          <div style={EraserStyles}>
            <CgErase className="icon" />
          </div>
          <span style={{ color: "white", marginTop: "1vh" }}>Eraser</span>
        </div>
      </div>

      <div className="width-setting">
        <p>Width: {lineWidth}</p>
        <Slider
          defaultValue={5}
          aria-label="Default"
          valueLabelDisplay="auto"
          min={1}
          max={100}
          color="primary"
          value={lineWidth}
          onChange={(e: any) => setLineWidth(e.target.value)}
        />
      </div>

      <button
        onClick={() => clearCanvas()}
      >
        Clear All
      </button>
      {/**<button>Undo</button> naredi če bo čas */}
    </div>
  )
}

export default CanvasSettings;