import React from 'react';
import logo from './logo.svg';
import './App.css';
import FetchComponent from './components/FetchComponent';
import Canvas from './components/Canvas/Canvas';
import SocketTest from './components/SocketTest';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <>
    <div className="App">
      {/*<h1 className='title'>Real Time Canvas & Chat</h1>*/}
      <button>Solo</button>
      <button>Public Room</button>
      <button>Create Private Room</button>
      <button>Join Private Room</button>
      <Canvas />
      <Chat />
    </div>
    </>
  );
}

export default App;
