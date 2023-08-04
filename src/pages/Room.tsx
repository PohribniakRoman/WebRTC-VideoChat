import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import socket from "../socket";

export const Room:React.FC = ()=>{
    // useState()
    const params = useParams();
    useEffect(()=>{
        socket.emit("JOIN_ROOM",{roomId:params.id});
        return ()=>{
            socket.emit("LEAVE_ROOM",{roomId:params.id})
        }
    },[])

    return <div>
    
    </div>
}