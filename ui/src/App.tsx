import React from 'react';
import logo from './logo.svg';
import './App.css';
import FetchComponent from './components/FetchComponent';
import Canvas from './components/Canvas/Canvas';
import SocketTest from './components/SocketTest';

function App() {
  return (
    <>
    <div className="App">
      <h1 className='title'>Real Time Canvas & Chat</h1>
      <Canvas />
    </div>
    </>
  );
}

export default App;
