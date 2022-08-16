import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import FetchComponent from './components/FetchComponent';
import Canvas from './components/Canvas/Canvas';
import SocketTest from './components/SocketTest';
import Chat from './components/Chat/Chat';
import CanvasRooms from './components/Rooms/CanvasRooms';
import socket from './socket';
import { User } from './helpers/types';
import ChatRooms from './components/Rooms/ChatRooms';

function App() {

  const [room, setRoom] = useState<string>("");
  const [roomInput, setRoomInput] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User|null>(null);

  const login = () => {
    if(nickname.length>0) {
      console.log(socket.connected);
      socket.disconnect();
      let username = nickname;
      socket.auth = { username };
      socket.connect();
      console.log("logged in");
      console.log(socket.connected);
    }
  }

  useEffect(() => {
    socket.on("users", (users) => {
      users.map((user: User) => {
        let isLoggedIn = user.userID === socket.id;
        if(isLoggedIn){
          setIsLoggedIn(true);
          setUser(user);
        }
      })
    });
    socket.on("disconnect", () => {
      setUser(null)
    });
    socket.on("joined-room", (room) => {
      setRoom(room);
      console.log(room);
    });
    socket.on("message", (message) => {
      console.log("message received: ", message);
    });
    console.log("connected: ", socket.connected); 
    socket.on("test", (message) => {
      console.log("new message received: ", message)
    })
  }, []);

  const joinRoom = () => {
    if(roomInput.length>0) {
      socket.emit("join-room", roomInput);
    }
  }

  const createRoom = () => {
    socket.emit("create-room", room);
  }

  const sendMessage = () => {
    console.log(room)
    socket.emit("test", room)
  }

  useEffect(() => {
    console.log("connected: ", socket.connected)
  }, [socket.connected]);

  const leaveRoom = () => {
    if(room.length>0) {
      socket.emit("leave-room", room);
      setRoom("");
    }
  }


  return (
    <>
    <div className="App">
      {/*<h1 className='title'>Real Time Canvas & Chat</h1>*/}
      {!isLoggedIn ? (
        <>
          <label className='nickname-text'>Your Nickname:</label><br />
          <input placeholder='John' value={nickname} onChange={(e: any) => setNickname(e.target.value)} />
          <button onClick={login}>Go</button>
        </>
      ):(
        <>
          <p className='nickname-text'>{user?.username}</p>
          {room.length==0 ? (
            <>
              <input placeholder='Room Code' value={roomInput} onChange={(e: any) => setRoomInput(e.target.value)} />
              <button onClick={joinRoom}>Join Private Room</button>
              <br />
              <button onClick={createRoom}>Create Private Room</button>
              <p className='nickname-text'>Public Canvas</p>
              <div style={{ display: "flex", flexDirection: "row", justifySelf: "center", justifyContent: "center", marginLeft: "auto", marginRight: "auto" }}>
                <div>
                  <Canvas />
                </div>
                <div>
                  <Chat nickname={nickname} />
                </div>
              </div>
            </>
          ):(
            <>
              <p className='nickname-text'>Private Canvas</p>
              <p>Room Code: {room}</p>
              <button onClick={leaveRoom}>leave</button>
              <div style={{ display: "flex", flexDirection: "row", justifySelf: "center", justifyContent: "center", marginLeft: "auto", marginRight: "auto" }}>
                <div>
                  <CanvasRooms roomId={room} />
                </div>
                <div>
                  <ChatRooms roomId={room} user={user ? user:{userID: "", username: ""}} />
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
    </>
  );
}

export default App;
