import { useState } from 'react';
import socket from './socket';
import Home from './components/Home';
import Game from './components/Game';

import { io } from 'socket.io-client';

import { io } from 'socket.io-client';

const socket = io(); // ← así funciona en local y en Vercel


function App() {
  const [gameState, setGameState] = useState({
    inGame: false,
    roomId: '',
    isHost: false
  });

  const enterGame = (roomId, isHost) => {
    setGameState({ inGame: true, roomId, isHost });
  };

  return (
    <>
      {!gameState.inGame ? (
        <Home socket={socket} onEnterGame={enterGame} />
      ) : (
        <Game 
          socket={socket} 
          roomId={gameState.roomId} 
          isHost={gameState.isHost} 
        />
      )}
    </>
  );
}

