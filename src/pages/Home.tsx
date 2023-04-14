import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from 'uuid';
import socket from "../socket";
//@ts-ignore
import {ACTIONS} from "../socket/actions.js"

export const Home:React.FC = ()=>{
    const [activeRooms,setRooms] = useState<string[]>([]);
    const navigate = useNavigate()
    useEffect(()=>{
        socket.on(ACTIONS.SHARE_ROOMS,({rooms}:Record<string,string[]>)=>{
            setRooms(rooms);
        })
    })
    return<>
        <ul>
        {activeRooms.map(roomID=>{
            return <li key={roomID}>{roomID}<button onClick={()=>{navigate(`/room/${roomID}`)}}>Join</button></li>
        })}
        </ul>
        <button onClick={()=>{
            navigate(`/room/${v4()}`)
        }}>Create Room</button>
    </>
}