import React from "react";
import { Message } from "../../helpers/types";

interface MessageProps {
  message: Message,
  nickname: string,
}

const MessageComponent: React.FC<MessageProps> = ({ message, nickname }) => {
  const isSender = message.sender==nickname;
  console.log(message);

  const getClassName = () => {
    const isSender = message.sender === nickname;
    const isSystem = message.sender === "";
    if(isSystem) return "message-system-div-text";
    else if(isSender) return "message-sender-div-text";
    else return "message-div-text";
  };

  return(
    <div className={`${getClassName()} message-div`}>
      <span><b>{message.sender} {isSender ? "(you)":""}{"   "}{message.date}</b></span>
      <br />
      <span><i>{message.message}</i></span>
    </div>
  );
};

export default MessageComponent;