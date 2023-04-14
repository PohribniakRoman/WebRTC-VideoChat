import { useCallback, useState } from "react";
import { useEffect, useRef } from "react";
import socket from "../socket";
//@ts-ignore
import {ACTIONS} from "../socket/actions.js"
import { useParams } from "react-router-dom";
import { useWebRTC } from "../hooks/useWebRTC";
import { validate,version } from "uuid";

export const Room:React.FC = ()=>{
    const {id:roomID} = useParams();
    const [clients,setClients] = useState<any[]>([])
    if(roomID && validate(roomID) && version(roomID) ===  4){
        useWebRTC(roomID)
    }
    return<>
    </>
}
// const connection = new RTCPeerConnection({
//     iceServers:freeice()
// });
// const videoHtmlRef = useRef<any>();
// const assignVideo= useCallback((index:number,video:MediaStream)=>{clients[index] = ,videoHtmlRef.current.srcObject = video,videoHtmlRef.current.volume = 0 },[]); 
// useEffect(()=>{
//     (async()=>{
//         const video = await navigator.mediaDevices.getUserMedia({audio:true,video:{width:1500,height:800}});
//         assignVideo(0,video);
//     })()
// },[])

{/* <video ref={videoHtmlRef} autoPlay playsInline/> */}