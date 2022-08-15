import React, { useEffect, useState } from "react";
import { Message } from "../../helpers/types";
import socket from "../../socket";

interface ChatProps {
  nickname: string
}

const Chat: React.FC<ChatProps> = ({ nickname }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesToRender, setMessagesToRender] = useState<Message[]>([]);
  const [toSend, setToSend] = useState<string>("");


  const sendMessage = () => {
    if(toSend.length!==0) {
      let _message = {
        sender: nickname,
        message: toSend
      }
      socket.emit("messages-public", _message);
    }
  }

  useEffect(() => {
    socket.on("messages-public", (data) => {
      console.log(data!=messages[messages.length-1])
      console.log("data: ", data)
      console.log("messages ", messages)
      if(data!=messages[messages.length-1]) {
        setMessages(prev => [...prev, data]);
        setToSend("");
      }
    });
  }, []);

  return(
    <div className="chat-div">
      {messages.map((message: Message, index: number) => {
        {/**fix later */}
        if(index%2==0) {
          return(
            <div key={index}>
              <p>{message.sender} {message.sender==nickname ? "(you)":""}</p>
              <p><i>{message.message}</i></p>
              <hr/>
            </div>
          )
        }
      })}
      <div>
        <input placeholder="Type something . . ." value={toSend} onChange={(e: any) => setToSend(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default Chat;