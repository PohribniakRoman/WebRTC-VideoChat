import express from "express";
import { Server } from "socket.io";
import {createServer } from "http";
import { validate, version } from "uuid";

const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);


const joinRoom = (socket,id)=>{
    socket.join(id);
    shareRooms();
}

const leaveRoom = (socket,id)=>{
    socket.leave(id);
    shareRooms();
}



const shareRooms = () => {
    const roomList = Array.from(io.sockets.adapter.rooms.keys()).filter(roomId=>validate(roomId));
    io.emit("SHARE_ROOMS",{
        roomList
    })
}

io.on("connection",(socket)=>{
    shareRooms();

    socket.on("JOIN_ROOM",({roomId})=>joinRoom(socket,roomId));
    socket.on("LEAVE_ROOM",({roomId})=>leaveRoom(socket,roomId));
})

server.listen(PORT,()=>{
    console.log(`Server has been started on port:${PORT}`);
})