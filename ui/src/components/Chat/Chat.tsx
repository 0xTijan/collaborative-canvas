import React, { useEffect, useState } from "react";
import { Message } from "../../helpers/types";
import socket from "../../socket";
import MessageComponent from "./components/Message";

interface ChatProps {
  nickname: string
}

const Chat: React.FC<ChatProps> = ({ nickname }) => {

  const [messages, setMessages] = useState<Message[]>([]);
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
    (async function get() {
      const response = await fetch('/last-messages?amount=10');
      const lastMessages = await response.json();
      setMessages(lastMessages.messages);
      console.log(lastMessages.messages);

      socket.on("messages-public", (data) => {
        console.log(data!=messages[messages.length-1])
        console.log("data: ", data)
        console.log("messages ", messages)
        if(data!=messages[messages.length-1]) {
          setMessages(prev => [...prev, data]);
          setToSend("");
        }
      });
    })();
  }, []);

  return(
    <div className="chat-div" style={{ height: window.innerHeight*0.85 }}>
      {messages.map((message: Message, index: number) => {
        {/**fix later */}
        if(message!==messages[index-1]) {
          return(
            <MessageComponent
              key={index}
              message={message}
              nickname={nickname}
            />
          )
        }
      })}
      <div className="chat-input-box">
        <input placeholder="Type something . . ." value={toSend} onChange={(e: any) => setToSend(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default Chat;