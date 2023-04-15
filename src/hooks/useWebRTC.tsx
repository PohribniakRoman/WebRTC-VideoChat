import { useCallback, useEffect, useRef, useState } from 'react';
import socket from '../socket';
//@ts-ignore
import {ACTIONS} from "../socket/actions.js"
// @ts-ignore
import freeice from 'freeice';
import useStateWithCallback from './useStateWithCallback';

const flag = "LOCAL";


export const useWebRTC = (roomID:string):Record<string,any> => {
    const [clients,setClients] = useStateWithCallback([]);

    const addNewClient = useCallback((newClient:string,cb:any)=>{
            setClients((list:any)=>{
                if(!list.includes(newClient)){
                    return [...list,newClient];
                }
                return list
            },cb)
    },[clients,setClients])

    const peerConnections = useRef<Record<string,any>>({})
    const localMediaStream = useRef<null|MediaStream>(null);
    const peerMediaElements = useRef<Record<any,any>>({
        [flag]:null
    })
    

    useEffect(()=>{

        async function addPeer({peerID,createOffer}:Record<string,any>){
            
            if (peerID in peerConnections.current) {
                return console.warn(`Already connected to peer ${peerID}`);
            }
            
            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers:freeice()
            })
            peerConnections.current[peerID].onicecandidate = (event:RTCPeerConnectionIceEvent) => {
                if(event.candidate){
                    socket.emit(ACTIONS.RELAY_ICE,({peerID,iceCandidate:event.candidate}))
                }
            }

            let tracksCount = 0;
            peerConnections.current[peerID].ontrack = ({streams:[remoteStream]}:Record<string,MediaStream[]>) => {
                tracksCount++;
                if(tracksCount === 2){
                    addNewClient(peerID,()=>{
                        peerMediaElements.current[peerID].srcObject = remoteStream
                    })
                }
            }

            localMediaStream.current?.getTracks().forEach(track => {
                peerConnections.current[peerID].addTrack(track,localMediaStream.current)
            })

            if(createOffer){
               const offer = await peerConnections.current[peerID].createOffer();
               await peerConnections.current[peerID].setLocalDescription(offer);
                socket.emit(ACTIONS.RELAY_SDP,{peerID,sessionDescription:offer})
            }
        };

        const setRemoteMedia = async ({peerID,sessionDescription}:any) =>{
            console.log(sessionDescription);
            
            await peerConnections.current[peerID]?.setRemoteDescription(
                new RTCSessionDescription(sessionDescription)
            )
            
            if(sessionDescription.type === "offer"){
                const answer = await peerConnections.current[peerID].createAnswer();
                await peerConnections.current[peerID].setLocalDescription(answer);
                socket.emit(ACTIONS.RELAY_SDP,{peerID,sessionDescription:answer})
            }
        }

        async function addICE({peerID,iceCandidate}:Record<string,any>){
            if(peerConnections.current[peerID]){
                await peerConnections.current[peerID]?.addIceCandidate(new RTCIceCandidate(iceCandidate));
            }
        }

        socket.on(ACTIONS.ADD_PEER,addPeer)
        socket.on(ACTIONS.SESSION_DESCRIPTION,setRemoteMedia)
        // socket.on(ACTIONS.GET_ICE,addICE)


        async function startCapture() {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({audio:true,video:{width:1280,height:720}});
            
            addNewClient(flag,()=>{
                const localVideoElement = peerMediaElements.current[flag];
                
                if(localVideoElement){
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            })
        }
        startCapture()
        .then(()=>{socket.emit(ACTIONS.JOIN,{id:roomID})})
        .catch(e=>{console.log("Failed to capture media:",e)})

        return(()=>{
            localMediaStream.current?.getTracks().forEach(track=>track.stop())
            socket.emit(ACTIONS.LEAVE)
        })
    },[])


    useEffect(()=>{
        socket.on(ACTIONS.REMOVE_PEER,({peerID}:Record<string,string>)=>{
            if(peerConnections.current[peerID]){
                peerConnections.current[peerID].close();
            }
            delete peerConnections.current[peerID];
            delete peerMediaElements.current[peerID];
            setClients((list:string[])=>list.filter((c:string)=>c !== peerID))
        })
    },[])

    const assignRef = useCallback((id:string,node:HTMLElement)=>{
        peerMediaElements.current[id] = node;
    },[])    

    console.log(peerConnections.current);
    
    return{
        clients,
        assignRef
    }
}