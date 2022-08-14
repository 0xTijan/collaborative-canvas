import React, { useRef, useState, useEffect, useCallback } from "react";
import CanvasSettings from "./CanvasSettings";
import { io } from "socket.io-client";
import { inflateRaw } from "zlib";
import { useNotification } from "@web3uikit/core";
import { getNotification } from "../../helpers/helpers";

const socket = io("http://localhost:3001/");

type Coordinate = {
  x: number;
  y: number;
}
  

const Canvas = () => {

  const [color, setColor] = useState<string>("red");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notify = useNotification();

  const sendCanvasImage = () => {
    let url = getImageUrl();
    if(url) {
      socket.emit('canvas-data', url);
    }
  }

  const downloadImage = () => {
    if(canvasRef.current) {
      if(window.confirm("Do you want to download this canvas?")) {
        let url = getImageUrl();
        if(url) {
          fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
              // Create blob link to download
              const url = window.URL.createObjectURL(
                new Blob([blob]),
              );
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute(
                'download', "canvas.png"
              );

              // Append to html link element page
              document.body.appendChild(link);

              // Start download
              link.click();

              // Clean up and remove the link
              link?.parentNode?.removeChild(link);

              notify(getNotification("success", "Image Downloaded! 😀", "Image downloaded successfully!"));
            });
        }
      }
    }
  }

  const getImageUrl = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    return image;
  }

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
    sendCanvasImage();
  }, []);

  const clearCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    context?.clearRect(0, 0, canvas.width, canvas.height);
  }

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

  useEffect(() => {
    (async function get() {
      if (!canvasRef.current) {
        return;
      }

      const response = await fetch('/last-canvas');
      const lastImage = await response.json();

      const canvas: HTMLCanvasElement = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      if(lastImage) {
        if(lastImage.data) {
          let image = new Image();
          image.onload = function() {
            if(context) {
              context.drawImage(image, 0, 0);
            }
          }
          image.src = lastImage.data;
        }
      }

      socket.on("canvas-data", (data) => {
        console.log(data)
        if(canvasRef.current) {
          const canvas: HTMLCanvasElement = canvasRef.current;
          const context = canvas.getContext('2d');
          let image = new Image();
          image.onload = function() {
            if(context) {
              context.drawImage(image, 0, 0);
            }
          }
          image.src = data;
        }
      })
    })();
  }, []);

  return(
    <>
      <div className="canvas-outer-box">
        <canvas className="canvas" height={window.innerHeight*0.85} width={window.innerWidth*0.85} ref={canvasRef} />
      </div>
      
      <CanvasSettings
        color={color}
        setColor={setColor}
        clearCanvas={clearCanvas}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
      />
      
      <>
        <button onClick={downloadImage}>Download Canvas</button>
        <button onClick={() => {}}>Mint As NFT</button>
        <button onClick={() => {}}>Send it to my Email</button>
      </>
    </>
  )
}

export default Canvas;