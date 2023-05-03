import express from "express";
import { Server } from "socket.io";
import { ACTIONS } from "../src/socket/actions.js";
import {createServer } from "http";
import { validate, version } from "uuid";

const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);


function getRooms() {
    const {rooms} = io.sockets.adapter;

    return Array.from(rooms.keys()).filter(roomID=> validate(roomID) && version(roomID)===4);
}

function shareRooms() {
    io.emit(ACTIONS.SHARE_ROOMS,{
        rooms:getRooms()
    });
}

const joinRoom = (socket,id) => {
    const {rooms:joinedRooms} = socket;
    if(Array.from(joinedRooms).includes(id)){
        return console.warn(`User is already in room:${id}`);
    }
    if(!validate(id) || !version(id) === 4){
        return console.warn(`Can't be room!`);
    }
    const clients = Array.from(io.sockets.adapter.rooms.get(id) || []);
    
    clients.forEach(clientID=>{
        io.to(clientID).emit(ACTIONS.ADD_PEER,{
            peerID:socket.id,
            createOffer:false,
        })
        
        socket.emit(ACTIONS.ADD_PEER,{
            peerID:clientID,
            createOffer:true,
        })
    })
    socket.join(id);
    shareRooms();
}

const leaveRoom = (socket) => {
    Array.from(socket.rooms?socket.adapter.rooms:[]).filter(roomID => validate(roomID[0]) && version(roomID[0])===4)
    .forEach(roomID=>{
        const clients = Array.from(roomID[1]);
        clients.forEach(clientID=>{ 
            io.to(clientID).emit(ACTIONS.REMOVE_PEER,{
                peerID:socket.id,
            })
            socket.emit(ACTIONS.REMOVE_PEER,{
                peerID:clientID,
            })
        })
        socket.leave(roomID);
    })

    shareRooms()
}

io.on("connection",(socket)=>{
    shareRooms();

    socket.on(ACTIONS.JOIN,({id})=>{joinRoom(socket,id)})
    socket.on(ACTIONS.LEAVE,()=>{leaveRoom(socket)})
    socket.on(ACTIONS.RELAY_SDP,({peerID,sessionDescription})=>{
        io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION,{
            peerID:socket.id,
            sessionDescription
        })
    })   
    socket.on(ACTIONS.RELAY_ICE,({peerID,iceCandidate})=>{
        io.to(peerID).emit(ACTIONS.GET_ICE,{
            peerID:socket.id,
            iceCandidate
        })
    })
    socket.on("disconnect",(socket)=>leaveRoom(socket))
})

server.listen(PORT,()=>{
    console.log(`Server has been started on port:${PORT}`);
})