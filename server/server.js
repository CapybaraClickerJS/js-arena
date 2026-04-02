const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // Novo: para lidar com pastas

const app = express();
app.use(cors());

// --- A MÁGICA ESTÁ AQUI ---
// Isso diz ao Node para mostrar os arquivos da pasta onde você está
app.use(express.static(path.join(__dirname, '../'))); 

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log('Alguém conectou:', socket.id);

    socket.on('joinGame', (data) => {
        const room = data.roomToJoin || "global";
        socket.join(room);
        
        const clients = io.sockets.adapter.rooms.get(room);
        if (clients.size === 2) {
            io.to(room).emit('gameStart', {
                players: Array.from(clients),
                room: room
            });
        } else {
            socket.emit('waiting', 'Aguardando oponente na sala: ' + room);
        }
    });

    socket.on('makeMove', (data) => {
        socket.to(data.room).emit('moveMade', data);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`✅ Servidor ONLINE em http://localhost:${PORT}`));
