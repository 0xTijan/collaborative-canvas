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
      borderColor: selected ? "green" : "gray",
      marginLeft: "1rem",
      marginRight: "1rem"
    };
  }

  return(
    <div
      style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}
      onClick={() => setColor(cssColorValue)}
    >
      <div style={getStyles()}></div>
      <span style={{ color: "white", marginTop: "1vh" }}>{colorName}</span>
    </div>
  )
}

export default DisplaySelectColor;