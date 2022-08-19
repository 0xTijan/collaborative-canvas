import React, { useRef, useState, useEffect, useCallback } from "react";
import CanvasSettingsRooms from "./CanvasSettingsRooms";
import { useNotification } from "@web3uikit/core";
import { getNotification } from "../../helpers/helpers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { getAbi, getAddress } from "../../helpers/contract";
import socket from "../../socket";

type Coordinate = {
  x: number;
  y: number;
}

interface CanvasRoomProps {
  roomId: string,
  setMembers: (members: number) => void,
}
  

const CanvasRooms: React.FC<CanvasRoomProps> = ({
  roomId,
  setMembers
}) => {

  const [color, setColor] = useState<string>("red");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notify = useNotification();
  const { authenticate, Moralis, isWeb3Enabled, enableWeb3 } = useMoralis();
  const Contract = useWeb3Contract({
    contractAddress: getAddress(),
    functionName: "mint",
    abi: getAbi()
  });

  const mintNFT = async() => {
    try{
      const image = getImageUrl();
      if(image) {
        if(!isWeb3Enabled) {
          await enableWeb3({ chainId: 80001 });
        }
        
        const _image = new Moralis.File("image.png", { base64: image });
        await _image.saveIPFS();
        
        const object = {
          name: "CanvasNFT",
          description: "Canvas NFTs are NFT created from online whiteboard app.",
          image: _image.hash()
        };        
        const URI = new Moralis.File("file.json", {
          base64: btoa(JSON.stringify(object)),
        });
        await URI.saveIPFS();
        
        const _params = {
          contractAddress: getAddress(),
          functionName: "mint",
          abi: getAbi(),
          params: {
            uri: `https://gateway.moralisipfs.com/ipfs/${URI.hash()}`
          }
        };

        const tx: any = await Contract.runContractFunction({ params: _params});
        if(tx) {
          const receipt = await tx.wait();
          const id = receipt.logs[0].topics[3];
          alert(`Your Canvas NFT was minted!!\nView it here:\nhttps://testnets.opensea.io/assets/mumbai/0x354e4a68435890edfbec9811cca3dde9dbca222d/${Number(id)}`);
        }
      }
    }catch(err: any){
      console.log(err);
      notify(getNotification("error", "Something went wrong while minting!", err.message));
    }
  };

  const sendCanvasImage = () => {
    const url = getImageUrl();
    if(url) {
      const obj = {
        image: url,
        roomId: roomId
      };
      socket.emit("canvas-rooms", obj);
    }
  };

  const downloadImage = () => {
    if(canvasRef.current) {
      if(window.confirm("Do you want to download this canvas?")) {
        const url = getImageUrl();
        if(url) {
          fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
              // Create blob link to download
              const url = window.URL.createObjectURL(
                new Blob([blob]),
              );
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute(
                "download", "canvas.png"
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
  };

  const getImageUrl = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    return image;
  };

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    };
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
    const context = canvas.getContext("2d");
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
  };

  const paint = useCallback((event: MouseEvent) => {
    if (isPainting) {
      const newMousePosition = getCoordinates(event);
      if (mousePosition && newMousePosition) {
        drawLine(mousePosition, newMousePosition);
        setMousePosition(newMousePosition);
      }
    }
  }, [isPainting, mousePosition]);

  const exitPaint = useCallback(() => {
    setIsPainting(false);
    sendCanvasImage();
    socket.emit("get-num-of-members", roomId);
  }, []);

  const clearCanvas = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
    sendCanvasImage();
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
  
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousedown", startPaint);

    return () => {
      canvas.removeEventListener("mousedown", startPaint);
    };    
  }, [startPaint]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousemove", paint);
    return () => {
      canvas.removeEventListener("mousemove", paint);
    };
  }, [paint]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mouseup", exitPaint);
    canvas.addEventListener("mouseleave", exitPaint);
    return () => {
      canvas.removeEventListener("mouseup", exitPaint);
      canvas.removeEventListener("mouseleave", exitPaint);
    };
  }, [exitPaint]);

  useEffect(() => {
    (async function get() {
      if (!canvasRef.current) {
        return;
      }

      const response = await fetch("/last-canvas");
      const lastImage = await response.json();

      const canvas: HTMLCanvasElement = canvasRef.current;
      if(canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        if(roomId=="public") {
          console.log("setting");
          if(lastImage) {
            if(lastImage.data) {
              const image = new Image();
              image.onload = function() {
                if(context) {
                  context.drawImage(image, 0, 0, canvas.width, canvas.height);
                }
              };
              image.src = lastImage.data;
            }
          }
        }
      }

      socket.on("canvas-rooms", (data) => {
        console.log("received data: ", data);
        if(canvasRef.current) {
          const canvas: HTMLCanvasElement = canvasRef.current;
          const context = canvas.getContext("2d");
          const image = new Image();
          image.onload = function() {
            if(context) {
              context.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
          };
          image.src = data.image;
        }
      });

      socket.on("members", (members) => {
        if(members>0) {
          console.log(members);
          setMembers(members);
        }
      });
    })();
  }, [roomId]);

  return(
    <>
      <div className="canvas-outer-box">
        <canvas className="canvas" height={window.innerHeight*0.75} width={window.innerWidth*0.65} ref={canvasRef} />
      </div>
      
      <CanvasSettingsRooms
        color={color}
        setColor={setColor}
        clearCanvas={clearCanvas}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
      />
      
      <div style={{ marginTop: "6vh", marginBottom: "8vh" }}>
        <button style={{ marginRight: "1vw" }} className="button-19" onClick={downloadImage}>Download Canvas</button>
        <button style={{ marginRight: "1vw" }} className="button-19" onClick={mintNFT}>Mint As NFT</button>
        {/*<button style={{ marginRight: "1vw" }} className="button-19">Send it to my Email</button>
        <button style={{ marginRight: "1vw" }} className="button-19">Tweet It</button>*/}
      </div>
    </>
  );
};

export default CanvasRooms;