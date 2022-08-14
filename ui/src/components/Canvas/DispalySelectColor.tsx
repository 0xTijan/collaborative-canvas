import React from "react";

interface DisplaySelectColorProps {
  colorName: string,
  selected: boolean,
  cssColorValue: string,
  setColor: Function
}

const DisplaySelectColor: React.FC<DisplaySelectColorProps> = ({
  colorName,
  selected,
  cssColorValue,
  setColor
}) => {

  const getStyles = () => {
    return {
      backgroundColor: cssColorValue,
      width: "2.75rem",
      height: "2.75rem",
      borderRadius: "1000px",
      borderWidth: "4px",
      marginLeft: "1rem",
      marginRight: "1rem",
    };
  }

  const getBg = (selected: boolean) => selected ? "grey":"transparent" ;

  return(
    <div
      style={{ backgroundColor: getBg(selected) }}
      className="select-color"
      onClick={() => setColor(cssColorValue)}
    >
      <div style={getStyles()}></div>
      <span style={{ color: "white", marginTop: "1vh" }}>{colorName}</span>
    </div>
  )
}

export default DisplaySelectColor;