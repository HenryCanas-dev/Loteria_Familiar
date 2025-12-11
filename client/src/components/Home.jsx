import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

const defaultNames = ["Darth Vader", "Luke Skywalker", "Yoda", "Princesa Leia", "Han Solo", "Chewbacca", "R2-D2", "C-3PO", "Boba Fett"];
const nombresMexicanos = ["El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "La Sirena", "La Escalera", "La Botella", "El Barril"];

function Home({ socket, onEnterGame }) {
  const [nickname, setNickname] = useState('');
  const [images, setImages] = useState([]);
  const [customNames, setCustomNames] = useState({});
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    socket.on('room_created', (roomId) => onEnterGame(roomId, true));
    socket.on('error', (msg) => alert(msg));
    return () => socket.off();
  }, [socket, onEnterGame]);

  const juegoRapido = () => {
    if (!nickname.trim()) return alert("Ingresa tu apodo");
    const starWarsImages = defaultNames.map((name, i) => ({
      id: uuid(),
      image: `/starwars/${i + 1}.jpg`,
      name
    }));
    const id = uuid().slice(0, 6).toUpperCase();
    socket.emit('create_room', { roomId: id, numPlayers: 4, images: starWarsImages });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 9) return alert("Sube al menos 9 imágenes");
    const loaded = files.map((file, i) => ({
      id: uuid(),
      image: URL.createObjectURL(file),
      name: nombresMexicanos[i]
    }));
    setImages(loaded);
    const init = {};
    loaded.forEach(img => init[img.id] = img.name);
    setCustomNames(init);
  };

  const updateName = (id, value) => {
    setCustomNames(prev => ({ ...prev, [id]: value }));
  };

  const getFinalImages = () => images.map(img => ({
    ...img,
    name: customNames[img.id]?.trim() || img.name
  }));

  const createRoom = () => {
    if (!nickname.trim() || images.length < 9) return alert("Completa todo");
    const finalImages = getFinalImages();
    const id = uuid().slice(0, 6).toUpperCase();
    socket.emit('create_room', { roomId: id, numPlayers: 4, images: finalImages });
  };

  const joinRoom = () => {
    if (!nickname.trim()) return alert("Ingresa tu apodo");
    if (joinCode.length !== 6) return alert("Código de 6 caracteres");
    onEnterGame(joinCode, false);
  };

  return (
    <div className="home-container">
      <h1 className="title">LOTTO FUN</h1>

      <input
        type="text"
        placeholder="Tu apodo en la galaxia"
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          localStorage.setItem('loteria_nickname', e.target.value);
        }}
        className="nickname-input"
      />

      <button onClick={juegoRapido} className="btn-quick">
        JUEGO RÁPIDO
      </button>

      <p className="separator">— O —</p>

      <div className="upload-section">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImages}
          className="file-input"
        />
        <p className="image-count">{images.length}/9 imágenes</p>
      </div>

      {/* PREVIEW + EDITAR NOMBRES */}
      {images.length > 0 && (
        <div className="preview-grid">
          {images.map((img, i) => (
            <div key={img.id} className="image-card">
              <img src={img.image} alt="preview" className="preview-img" />
              <input
                type="text"
                placeholder={nombresMexicanos[i]}
                value={customNames[img.id] || ''}
                onChange={(e) => updateName(img.id, e.target.value)}
                className="name-input"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={createRoom}
        disabled={!nickname || images.length < 9}
        className="btn-create"
      >
        CREAR SALA PERSONALIZADA
      </button>

      <div className="join-section">
        <input
          placeholder="CÓDIGO DE SALA"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="code-input"
        />
        <button onClick={joinRoom} className="btn-join">
          UNIRSE
        </button>
      </div>
    </div>
  );
}
