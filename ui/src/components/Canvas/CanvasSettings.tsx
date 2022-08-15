import { Slider } from "@mui/material";
import { type } from "@testing-library/user-event/dist/type";
import React, { useEffect, useState } from "react";
import DisplaySelectColor from "./DispalySelectColor";
import { CgErase } from "react-icons/cg";
import { IoMdColorFilter } from "react-icons/io";
import { FaRandom } from "react-icons/fa";
import { ChromePicker } from "react-color";


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
    colorName: "Pink",
    cssColorValue: "pink"
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
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "1000px",
  borderWidth: "4px",
  marginLeft: "1rem",
  marginRight: "1rem",
}

const popover = {
  position: 'absolute',
  zIndex: '2',
}
const cover = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
}

const CanvasSettings: React.FC<CanvasSettingsProps> = ({
  color,
  setColor,
  clearCanvas,
  lineWidth,
  setLineWidth
}) => {

  const [isColorPickerVisible, setIsColorPickerVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#FFFFFF");

  const getSelected = (cssColorValue: string) => {
    if(color==cssColorValue) return true;
    else return false;
  }

  const getEraserBg = () => {
    if(color=="white") return "grey"
    else return "transparent";
  }

  const getCustomBg = () => {

  }

  const handleCustomClick = () => {
    setSelectedColor(selectedColor);
    setIsColorPickerVisible(true);
  }

  useEffect(() => {
    if(selectedColor.toLowerCase() !== "#ffffff") {
      setColor(selectedColor);
    }
  }, [selectedColor])

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
          onClick={handleCustomClick}
        >
          <div style={{...EraserStyles, backgroundColor: selectedColor}}>
            <IoMdColorFilter className="icon" />
          </div>
          <span style={{ color: "white", marginTop: "1vh" }}>Custom</span>
        </div>
        {isColorPickerVisible ? (
          <div style={{ position: "absolute", zIndex: 1 }}>
            <div style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }} onClick={() => setIsColorPickerVisible(false)}/>
            <ChromePicker
              color={selectedColor}
              onChange={(color) => setSelectedColor(color.hex)}
            />
          </div> 
        ):null}    
        <div
          className="select-color"
          style={{ backgroundColor: getEraserBg() }}
          onClick={() => setColor("white")}
        >
          <div style={{...EraserStyles, backgroundColor: "white"}}>
            <FaRandom className="icon" />
          </div>
          <span style={{ color: "white", marginTop: "1vh" }}>Random</span>
        </div>
        <div
          className="select-color"
          style={{ backgroundColor: getEraserBg() }}
          onClick={() => setColor("white")}
        >
          <div style={{...EraserStyles, backgroundColor: "white"}}>
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