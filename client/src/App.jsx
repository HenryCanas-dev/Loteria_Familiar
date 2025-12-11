import { useState } from 'react';
import socket from './socket';
import Home from './components/Home';
import Game from './components/Game';

import { io } from 'socket.io-client';

const socket = io(window.location.origin);  // conecta al mismo dominio (funciona en local y producción)

export default socket;

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

export default App;
