import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import FetchComponent from './components/FetchComponent';
import Canvas from './components/Canvas/Canvas';
import SocketTest from './components/SocketTest';
import Chat from './components/Chat/Chat';

function App() {

  const [nickname, setNickname] = useState<string>("");

  const getRandomName = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (let i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  useEffect(() => {
    if(nickname.length==0) {
      let _name = getRandomName();
      setNickname(_name);
    }
  }, [nickname]);

  const test = () => {
    let data = {
      to: "errors@tijan.dev",
      subject: "HTML Test",
      htmlTemplateNumber: 0
    }
    fetch('/send-email',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
    );
    console.log("called")
  }

  return (
    <>
    <div className="App">
      {/*<h1 className='title'>Real Time Canvas & Chat</h1>*/}
      <button>Solo</button>
      <button>Public Room</button>
      <button>Create Private Room</button>
      <button>Join Private Room</button>
      <br />
      <label className='nickname-text'>Your Nickname:</label><br />
      <input placeholder='John' value={nickname} onChange={(e: any) => setNickname(e.target.value)} />
      <div style={{ display: "flex", flexDirection: "row", justifySelf: "center", justifyContent: "center", marginLeft: "auto", marginRight: "auto" }}>
        <div>
          <Canvas />
        </div>
        <div>
          <Chat nickname={nickname} />
        </div>
      </div>
    </div>

    <button onClick={test}>test</button>
    </>
  );
}

export default App;
