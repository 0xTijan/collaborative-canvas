import React from "react";
import { Message } from "../../../helpers/types";

interface MessageProps {
  message: Message,
  nickname: string,
}

const MessageComponent: React.FC<MessageProps> = ({ message, nickname }) => {
  let isSender = message.sender==nickname;

  return(
    <div className={`${isSender ? "message-sender-div-text" : "message-div-text"} message-div`}>
      <span><b>{message.sender} {isSender ? "(you)":""}{"   "}{message.date}</b></span>
      <br />
      <span><i>{message.message}</i></span>
    </div>
  )
}

export default MessageComponent;