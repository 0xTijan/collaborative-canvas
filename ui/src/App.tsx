import React, { useEffect, useState } from "react";
import "./App.css";
import ChatRooms from "./components/Chat/ChatRooms";
import socket from "./socket";
import { User } from "./helpers/types";
import CanvasRooms from "./components/Canvas/CanvasRooms";

function App() {

  const [members, setMembers] = useState<number|string>(1);
  const [room, setRoom] = useState<string>("");
  const [roomInput, setRoomInput] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User|null>(null);

  const login = () => {
    if(nickname.length>1) {
      console.log(socket.connected);
      socket.disconnect();
      const username = nickname;
      socket.auth = { username };
      socket.connect();
      console.log("logged in");
      console.log(socket.connected);
    }else{
      window.alert("Nickname must be longer than 1!");
    }
  };

  useEffect(() => {
    console.log("in use effect");
    socket.on("users", (users) => {
      users.map((user: User) => {
        const isLoggedIn = user.userID === socket.id;
        if(isLoggedIn){
          setIsLoggedIn(true);
          setUser(user);
        }
      });
    });
    socket.on("disconnect", () => {
      setUser(null);
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
      console.log("new message received: ", message);
    });
    socket.on("errors", (error) => {
      if(error.length>0) {
        window.alert(error);
      }
      console.log(error);
    });
    socket.on("connect_error", (err) => {
      if(err.message) {
        window.alert(err.message);
      }
    });
  }, []);

  const joinRoom = () => {
    if(roomInput.length>0) {
      socket.emit("join-room", roomInput);
    }
  };

  const createRoom = () => {
    socket.emit("create-room", room);
  };

  useEffect(() => {
    console.log("connected: ", socket.connected);
  }, [socket.connected]);

  const leaveRoom = () => {
    if(room.length>0) {
      socket.emit("leave-room", room);
      setRoom("");
    }
  };

  const joinPublicRoom = () => {
    socket.emit("join-room", "public");
  };

  return (
    <>
      <div className="App">
        {!isLoggedIn ? (
          <>
            <label className='nickname'>Nickname:</label><br />
            <input placeholder='Nickname' value={nickname} style={{ marginBottom: "2vh", marginTop: "1vh" }} className="input" onChange={e => setNickname(e.target.value)} />
            <br />
            <button onClick={login} className="button-19">Go!</button>
          </>
        ):(
          <>
            <p className='nickname-text-big'><span style={{ fontWeight: "300" }}>Nickname: </span>{user?.username}</p>
            {room.length==0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", justifySelf: "center", marginTop: "1vh" }}>
                  <div>
                    <p className='nickname-text' style={{ fontWeight: "300", textAlign: "center", marginTop: "0" }}>Join a Private Room:</p>
                    <input placeholder='Private Room Code' className="input" value={roomInput} onChange={e => setRoomInput(e.target.value)} />
                    <br />
                    <button onClick={joinRoom} className="button-19" style={{ marginBottom: "3vh", marginTop: "1vh" }}>Join</button>
                  </div>
                  <p className="nickname" style={{ marginTop: "6vh", marginLeft: "3vw", marginRight: "3vw" }}>OR</p>
                  <div>
                    <p className='nickname-text' style={{ fontWeight: "300", textAlign: "center", marginTop: "0" }}>Create a Private Room:</p> 
                    <button style={{ marginTop: "1vh" }} onClick={createRoom} className="button-19">Create Private Room</button>
                  </div>
                </div>
                <div>
                  <p className='nickname-text' style={{ fontWeight: "300" }}>Draw & Chat on Public Canvas</p>
                  <button className="button-19" style={{ marginTop: "1vh" }} onClick={joinPublicRoom}>Join Public Room</button>
                </div>
              </>
            ):(
              <>
                <p className='nickname-text' style={{ fontWeight: "800" }}>{room.length>19 ? "Private":"Public"} Room Canvas & Chat</p>
                {room.length>19 ? <p className="nickname-text" style={{ fontWeight: "300" }}>Room Code: <b>{room}</b></p>:null}
                <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", justifySelf: "center", justifyItems: "center", width: "fit-content", marginLeft: "auto", marginRight: "auto" }}>
                  <button onClick={leaveRoom} className="button-19" style={{ marginTop: "0", marginBottom: "1vh" }}>Leave</button>
                  <p  className='nickname-text' style={{ fontWeight: "300" }}>Members: {members}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifySelf: "center", justifyContent: "center", marginLeft: "auto", marginRight: "auto" }}>
                  {room.length>19 ? (
                    <>
                      <div>
                        <CanvasRooms setMembers={setMembers} roomId={room} />
                      </div>
                      <div>
                        <ChatRooms roomId={room} user={user ? user:{userID: "", username: ""}} />
                      </div>
                    </>
                  ):(
                    <>
                      <div>
                        <CanvasRooms setMembers={setMembers} roomId={"public"} />
                      </div>
                      <div>
                        <ChatRooms roomId={"public"} user={user ? user:{userID: "", username: ""}} />
                      </div>
                    </>
                  )}
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