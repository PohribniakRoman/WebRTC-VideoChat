import { useEffect, useRef, useState } from 'react';
import socket from '../socket';
//@ts-ignore
import {ACTIONS} from "../socket/actions.js"
// @ts-ignore
import freeice from 'freeice';


export const useWebRTC = (roomID:string) => {
    const peerConnections = useRef<Record<string,any>>({})
    const [clients,setClients] = useState<string[]>([]);

    useEffect(()=>{
        socket.emit(ACTIONS.JOIN_ROOM,{id:roomID});
        async function addPeer({peerID,createOffer}:Record<string,any>){
            
            if (peerID in peerConnections.current) {
                return console.warn(`Already connected to peer ${peerID}`);
              }
            
            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers:freeice()
            })
            peerConnections.current[peerID].onicecandidate = (event:RTCPeerConnectionIceEvent) => {
                socket.emit(ACTIONS.RELAY_ICE,({roomID,iceCandidate:event.candidate}))
            }
            const dataChennel = peerConnections.current[peerID].createDataChannel("test");
            dataChennel.onopen = () =>{
                console.log("CHANNEL OPEND");
            }
            console.log(createOffer);
            
            if(createOffer){
               const offer = await peerConnections.current[peerID].createOffer();
               await peerConnections.current[peerID].setLocalDescription(offer);
               
                // socket.emit()
            }
        };

        async function assignOffer({peerID,iceCandidate}:Record<string,any>){
            if(peerConnections.current[peerID]){
                await peerConnections.current[peerID].addIceCandidate(iceCandidate);
            }
        }


        socket.on(ACTIONS.GET_ICE,assignOffer)
        socket.on(ACTIONS.ADD_PEER,addPeer)
},[])
    
    return{}
}