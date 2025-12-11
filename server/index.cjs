const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });
const { v4: uuid } = require('uuid');

const rooms = {};

io.on('connection', (socket) => {
  console.log('Jugador conectado:', socket.id);

  // CREAR SALA
  socket.on('create_room', ({ roomId, numPlayers, images }) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log("Error: alguien intentó crear sala sin imágenes");
      return socket.emit('error', 'No se recibieron imágenes');
    }

    if (rooms[roomId]) {
      console.log(`Reentrando a sala existente: ${roomId}`);
      socket.emit('room_created', roomId);
      return;
    }

    rooms[roomId] = {
      host: socket.id,
      numPlayers,
      players: [],
      images: images.map(img => ({ ...img, id: uuid() })),
      currentCardIndex: -1,
      boards: {},
      winner: null
    };

    socket.join(roomId);
    console.log(`Sala creada: ${roomId} con ${images.length} imágenes`);
    socket.emit('room_created', roomId);
  });

  // UNIRSE A SALA
  socket.on('join_room', ({ roomId, nickname }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit('error', 'Sala no existe');
    if (room.players.length >= room.numPlayers) return socket.emit('error', 'Sala llena');

    // Generar tablero único de 9 cartas COMPLETAS
    const shuffled = [...room.images].sort(() => Math.random() - 0.5);
    const playerBoard = shuffled.slice(0, 9);

    // Guardamos solo los IDs para el servidor
    room.boards[socket.id] = playerBoard.map(c => c.id);

    // Añadimos al jugador
    room.players.push({
      id: socket.id,
      nickname,
      marked: new Set()
    });

    socket.join(roomId);

    // SOLO ENVÍAMOS UNA VEZ: EL TABLERO COMPLETO
    socket.emit('your_board', playerBoard);

    // Avisamos a todos
    io.to(roomId).emit('player_joined', room.players.map(p => p.nickname));

    if (room.players.length === room.numPlayers) {
      io.to(roomId).emit('game_ready', '¡Todos listos!');
    }
  });

  // SACAR CARTA
  socket.on('draw_card', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || socket.id !== room.host) return;

    room.currentCardIndex++;
    if (room.currentCardIndex >= room.images.length) {
      io.to(roomId).emit('game_over', '¡Se acabaron las cartas!');
      return;
    }

    const card = room.images[room.currentCardIndex];
    io.to(roomId).emit('new_card', card);
  });

  // GANADOR
  socket.on('player_won', ({ roomId, nickname }) => {
    const room = rooms[roomId];
    if (room && !room.winner) {
      room.winner = nickname;
      io.to(roomId).emit('winner', nickname);
      console.log(`GANADOR: ${nickname} en sala ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Jugador desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('SERVIDOR FUNCIONANDO EN http://localhost:3000');
  console.log('Listo para la lotería Star Wars!');
});