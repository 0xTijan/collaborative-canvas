import React, { useEffect, useState, useRef } from "react";
import { Message } from "../../helpers/types";
import socket from "../../socket";
import MessageComponent from "./components/Message";

interface ChatProps {
  nickname: string
}

const Chat: React.FC<ChatProps> = ({ nickname }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [toSend, setToSend] = useState<string>("");
  const [fetchAmount, setFetchAmount] = useState<number>(10);

  const bottomRef = useRef<any>(null);

  const sendMessage = () => {
    if(toSend.length!==0) {
      const d = new Date();
      const minutes = d.getMinutes()<10 ? `0${d.getMinutes()}`:d.getMinutes();
      const date = `${d.getHours()}:${minutes}`;
      const _message: Message = {
        sender: nickname,
        message: toSend,
        date: date
      };
      socket.emit("messages-public", _message);
    }
  };

  useEffect(() => {
    socket.on("messages-public", (data) => {
      console.log(data!=messages[messages.length-1]);
      console.log("data: ", data);
      console.log("messages ", messages);
      if(data!=messages[messages.length-1]) {
        setMessages(prev => [...prev, data]);
        setToSend("");
      }
    });
  }, []);

  useEffect(() => {
    (async function get() {
      const url = `/last-messages${fetchAmount==0 ? "":`?=${fetchAmount}`}`;
      console.log("url: ", url);
      const response = await fetch(url);
      const lastMessages = await response.json();
      setMessages(lastMessages.messages);
    })();
  }, [fetchAmount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  return(
    <div className="chat-div" style={{ height: window.innerHeight*0.85 }}>
      <div style={{ paddingTop: "1rem", paddingBottom: "1rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
        <p>Loaded last
          <select name="amounts" id="amount" value={fetchAmount} onChange={e => setFetchAmount(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={0}>all</option>
          </select>
        messages</p>
        {messages.map((message: Message, index: number) => {
          {/**fix later */}
          if(message!==messages[index-1]) {
            return(
              <MessageComponent
                key={index}
                message={message}
                nickname={nickname}
              />
            );
          }
        })}
        
        {/*        <div ref={bottomRef} />
*/}
        <div className="chat-input-box">
          <input className="input" placeholder="Type something . . ." value={toSend} onChange={e => setToSend(e.target.value)} />
          <button className="button-19" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;