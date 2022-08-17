import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import FetchComponent from "./components/FetchComponent";
import Canvas from "./components/Canvas/Canvas";
import SocketTest from "./components/SocketTest";
import Chat from "./components/Chat/Chat";
import CanvasRooms from "./components/Rooms/CanvasRooms";
import socket from "./socket";
import { User } from "./helpers/types";
import ChatRooms from "./components/Rooms/ChatRooms";
import ErrorModal from "./components/Modals/ErrorModal";

function App() {

  const [isErrorModalVisible, setIsErrorModalVisible] = useState<boolean>(false);
  const openErrorModal = () => setIsErrorModalVisible(true);
  const closeErrorModal = () => setIsErrorModalVisible(false);
  const [errorText, setErrorText] = useState<string>("");

  const [members, setMembers] = useState<number>(1);
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
        setErrorText(error);
        //openErrorModal();
        window.alert(error);
      }
      console.log(error);
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


  return (
    <>
      <div className="App">
        {/*<h1 className='title'>Real Time Canvas & Chat</h1>*/}
        {!isLoggedIn ? (
          <>
            <label className='nickname'>Nickname:</label><br />
            <input placeholder='John' value={nickname} style={{ marginBottom: "2vh", marginTop: "1vh" }} className="input" onChange={e => setNickname(e.target.value)} />
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
                <p className='nickname-text' style={{ fontWeight: "300" }}>Draw & Chat on Public Canvas</p>
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
                <p className='nickname-text' style={{ fontWeight: "800" }}>Private Room Canvas & Chat</p>
                <p className="nickname-text" style={{ fontWeight: "300" }}>Room Code: <b>{room}</b></p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <p  className='nickname-text' style={{ fontWeight: "300" }}>Members: {members}</p>
                  <button onClick={leaveRoom} className="button-19" style={{ marginTop: "1.5vh", marginLeft: "1vw" }}>leave</button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifySelf: "center", justifyContent: "center", marginLeft: "auto", marginRight: "auto" }}>
                  <div>
                    <CanvasRooms setMembers={setMembers} roomId={room} />
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

      <ErrorModal
        text={errorText}
        title="Error!"
        isVisible={isErrorModalVisible}
        close={closeErrorModal}
      />
    </>
  );
}

export default App;
