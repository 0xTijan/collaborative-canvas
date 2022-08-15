import { useEffect, useState } from "react";
import socket from "../../socket";

const Chat = () => {

  const [messages, setMessages] = useState<any>([]);
  const [toSend, setToSend] = useState<string>("");


  /*const sendMessage = () => {
    if(toSend.length!==0) {
      let _message = {
        sender: "Tijan",
        message: toSend
      }
      socket.emit("messages-public", _message);
    }
  }

  useEffect(() => {
    (async function get() {
      socket.on("messages-public", (data) => {
        if(data!=messages[messages.length-1]) {
          let newMessages = messages;
          newMessages.push(data);
          console.log("new message was sent: ", newMessages)
          setMessages(newMessages);
          setToSend("");
        }
      });
    })();
  }, []);*/

  return(
    <div className="chat-div">
      {messages.map((message: any, index: number) => {
        return(
          <div key={index}>
            <p>{message.sender}</p>
            <p><i>{message.message}</i></p>
          </div>
        )
      })}
      <hr/>
      <div>
        <input placeholder="Type something . . ." value={toSend} onChange={(e: any) => setToSend(e.target.value)} />
        <button onClick={() => {}}>Send</button>
      </div>
    </div>
  )
}

export default Chat;