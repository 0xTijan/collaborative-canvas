import React, { useRef, useState, useEffect, useCallback } from "react";
import CanvasSettings from "./CanvasSettings";
import { useNotification } from "@web3uikit/core";
import { getNotification } from "../../helpers/helpers";
import { io } from "socket.io-client";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { getAbi, getAddress } from "../../helpers/contract";

const URL = "http://localhost:3001/";
const socket = io(URL, { autoConnect: true });

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
          description: "Canvas NFTs are NFT created from collab-convas app.",
          image: _image.hash()
        }        
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
        }

        let tx: any = await Contract.runContractFunction({ params: _params});
        if(tx) {
          let receipt = await tx.wait();
          let id = receipt.logs[0].topics[3];
          alert(`Your Canvas NFT was minted!!\nView it here:\nhttps://testnets.opensea.io/assets/mumbai/0x354e4a68435890edfbec9811cca3dde9dbca222d/${Number(id)}`)
        }
      }
    }catch(err: any){
      console.log(err)
      notify(getNotification("error", "Something went wrong while minting!", err.message))
    }
  }

  const sendCanvasImage = () => {
    let url = getImageUrl();
    if(url) {
      socket.emit('canvas-data-public', url);
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

      socket.on("canvas-data-public", (data) => {
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
        <button onClick={mintNFT}>Mint As NFT</button>
        <button onClick={() => {}}>Send it to my Email</button>
        <button onClick={() => {}}>Tweet It</button>
      </>
    </>
  )
}

export default Canvas;


/**
 * 
 *   const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ 
        provider: "metamask",
        chainId: 43113,
        signingMessage: "Authenticate for better experience and additional features in X!"
      });
    }
  }

  useEffect(() => {
    console.log(user)
  }, [user]);

  const mintNFT = async() => {
    try{
      const image = getImageUrl();
      if(image) {
        const file = new Moralis.File("canvas-nft.png", { base64: image });
        await file.saveIPFS();
        let hash = file.hash();
        console.log(hash)
        notify(getNotification("error", "Success!", "CanvasNFT was minted successfully!"));
      }
    }catch(err: any){
      console.log(err)
      notify(getNotification("error", "Something went wrong while minting!", err.message))
    }
  }
 */