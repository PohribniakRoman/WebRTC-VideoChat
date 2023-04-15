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
    if(!roomID || !validate(roomID) || version(roomID) !==  4){
        return <>Eror</>
    }
    const {clients,assignRef} = useWebRTC(roomID);

    return<div>
        {clients.map((peerID:string)=>{
            return <video key={peerID} ref={(element)=>assignRef(peerID,element)} autoPlay playsInline/>
        })}
    </div>
}