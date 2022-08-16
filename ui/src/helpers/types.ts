export type Message = {
  sender: string,
  message: string,
  date: string
}

export type User = {
  userID: string,
  username: string
}

export type MessageRoom = {
  roomId: string,
  message: Message
}