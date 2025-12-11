import { useState } from 'react';
import io from 'socket.io-client';
import Home from './components/Home';
import Game from './components/Game';

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

const socket = SOCKET_URL 
  ? io(SOCKET_URL)                    // producción (Vercel)
  : io();                             // desarrollo (localhost)

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
