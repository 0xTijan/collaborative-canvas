import React, { useRef, useState, useEffect, useCallback } from "react";
import CanvasSettings from "./CanvasSettings";

interface CanvasProps {
  width?: number,
  height?: number,
}

type Coordinate = {
  x: number;
  y: number;
}
  

const Canvas: React.FC<CanvasProps> = ({
  width,
  height
}) => {

  const [color, setColor] = useState<string>("red");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);


  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    }
  };

  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);

    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  const drawLine = (originalMousePosition: Coordinate, newMousePosition: Coordinate) => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.strokeStyle = color;
      context.lineJoin = "round";
      context.lineWidth = lineWidth;

      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.closePath();

      context.stroke();
    }
  }

  const paint = useCallback((event: MouseEvent) => {
    if (isPainting) {
      const newMousePosition = getCoordinates(event);
      if (mousePosition && newMousePosition) {
        drawLine(mousePosition, newMousePosition);
        setMousePosition(newMousePosition);
      }
    }
  }, [isPainting, mousePosition])

  const exitPaint = useCallback(() => {
    setIsPainting(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
  
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousedown", startPaint);

    return () => {
      canvas.removeEventListener("mousedown", startPaint);
    }    
  }, [startPaint]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousemove', paint);
    return () => {
      canvas.removeEventListener('mousemove', paint);
    };
  }, [paint]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);
    return () => {
      canvas.removeEventListener('mouseup', exitPaint);
      canvas.removeEventListener('mouseleave', exitPaint);
    };
  }, [exitPaint]);

  return(
    <div className="canvas-outer-box">
      <canvas className="canvas" height={height} width={width} ref={canvasRef} />
      <CanvasSettings color={color} setColor={setColor} />
    </div>
  )
}

Canvas.defaultProps = {
  width: window.innerWidth*0.85,
  height: window.innerHeight*0.85
}

export default Canvas;