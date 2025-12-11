import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Game({ socket, roomId, isHost }) {
  const [nickname, setNickname] = useState('');
  const [board, setBoard] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [marked, setMarked] = useState(new Set());
  const [winner, setWinner] = useState('');

  useEffect(() => {
    const savedNick = localStorage.getItem('loteria_nickname') || 'Jugador';
    setNickname(savedNick);
    socket.emit('join_room', { roomId, nickname: savedNick });

    socket.on('your_board', (boardImages) => {
      setBoard(boardImages);
    });

    socket.on('new_card', (card) => {
      setCurrentCard(card);
    });

    socket.on('winner', (name) => {
      setWinner(name);
      if (name === savedNick) {
        confetti({
          particleCount: 500,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffd700', '#ff00ff']
        });
      }
    });

    return () => {
      socket.off('your_board');
      socket.off('new_card');
      socket.off('winner');
    };
  }, [socket, roomId]);

  const toggleMark = (cardId) => {
    setMarked(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(cardId)) {
        newMarked.delete(cardId);
      } else {
        newMarked.add(cardId);
      }
      if (newMarked.size === 9) {
        socket.emit('player_won', { roomId, nickname });
      }
      return newMarked;
    });
  };

  const drawCard = () => socket.emit('draw_card', { roomId });

  if (board.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '100px', color: 'white', fontSize: '3rem' }}>
      Cargando tu tablero de Star Wars...
    </h2>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000428, #004e92)',
      color: 'white',
      padding: '10px'
    }}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', margin: 0, color: '#00ffff', textShadow: '0 0 30px #00ffff' }}>
          Sala: {roomId}
        </h1>
        <h2 style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', margin: '10px 0', color: '#ffd700' }}>
          ¡Hola {nickname}!
        </h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div style={{
          minWidth: '280px',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          padding: '20px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '30px'
        }}>
          {isHost && (
            <button onClick={drawCard} style={{
              width: '100%',
              padding: '25px',
              fontSize: '2.5rem',
              background: '#ff1744',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              boxShadow: '0 20px 50px rgba(255,23,68,0.8)',
              fontWeight: 'bold'
            }}>
              SACAR CARTA
            </button>
          )}

          {currentCard && (
            <div style={{
              background: 'linear-gradient(45deg, #000428, #004e92)',
              borderRadius: '35px',
              padding: '20px',
              boxShadow: '0 0 50px #00ffff',
              border: '12px solid #ffd700'
            }}>
              <img
                src={currentCard.image}
                alt={currentCard.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '450px',
                  objectFit: 'cover',
                  borderRadius: '25px',
                  border: '8px solid white'
                }}
              />
              <h3 style={{
                marginTop: '20px',
                fontSize: '3rem',
                color: '#ffd700',
                textShadow: '0 0 20px black',
                textAlign: 'center'
              }}>
                {currentCard.name}
              </h3>
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          maxWidth: '1100px',
          margin: '20px auto'
        }}>
          {board.map(img => (
            <div
              key={img.id}
              onClick={() => toggleMark(img.id)}
              style={{
                background: marked.has(img.id) ? '#1b5e20' : 'white',
                borderRadius: '35px',
                padding: '20px',
                cursor: 'pointer',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                transform: marked.has(img.id) ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.4s',
                border: marked.has(img.id) ? '15px solid gold' : '8px solid #00ffff'
              }}
            >
              <img
                src={img.image}
                onError={(e) => e.target.src = "/starwars/fallback.jpg"}
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  borderRadius: '25px',
                  border: '6px solid white'
                }}
                alt={img.name}
              />
              <h3 style={{
                textAlign: 'center',
                marginTop: '15px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: marked.has(img.id) ? 'gold' : '#00ffff',
                textShadow: '0 0 15px black'
              }}>
                {img.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* GANADOR */}
      {winner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.98)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: 'clamp(8rem, 20vw, 15rem)', color: 'gold', textShadow: '0 0 60px yellow' }}>
            ¡LOTERÍA!
          </h1>
          <h2 style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', color: 'white' }}>
            {winner} GANA
          </h2>
        </div>
      )}
    </div>
  );
}