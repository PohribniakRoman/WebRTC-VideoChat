import { useEffect, useState } from "react"
import socket from "../socket"
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";

export const Home:React.FC = ()=>{
    const navigate = useNavigate();
    const [roomList,updateRoomList] = useState<string[]>([]);

        useEffect(()=>{
            socket.on("SHARE_ROOMS",({roomList})=>{
                updateRoomList(roomList);
            })
        },[])


    return<>
    {roomList.map(roomId=>{
        return <div key={roomId}>
            <h1>{roomId}</h1>
            <button onClick={()=>{navigate(`room/${roomId}`)}}>Join</button>
        </div>
    })}
    <button onClick={()=>{navigate(`room/${v4()}`)}}>Create Room</button>
    </>
}