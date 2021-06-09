import React, { useRef, useEffect } from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import io from 'socket.io-client';

import Routes from './Routes';

const App = (props) => {

  const videoRef = useRef();
  const remoteVideoRef = useRef();
  const textRef = useRef();
  const candidates = useRef([]);

  // const pc_config = null;
  // configuration object example
  const pc_config = {
    iceServers: [
      // {
      //   urls: 'stun[STUN-IP]:[PORT]',
      //   credential: '[YOUR CREDENTIAL]',
      //   username: '[USERNAME]'
      // },
      {
        urls:"stun:stun.l.google.com:19302"
      }
    ]
  }

    // const socket = io(
    //   'https://sunzao.us/meet/socket'
    // );// failed
    const socket = io(
      '/webrtcPeer'
    );// worked

    // const socket = io(
    //   '/webrtcPeer',
    //   {
    //     path: '/liftoff/'
    //   }
    // );// worked

    // const socket = io.connect("http://localhost:3002/meet");//works - meet namespace
    // const socket = io.connect("https://sunzao.us/meet");//works - meet namespace
    // [using socket.io with express docs](https://socket.io/docs/#using-with-express-3/4)
  // const socket = io(
  //   {
  //     path: '/meet/socket'
  //   }
  // );

  // const socket = io(
  //   `http://localhost:3002/webrtcPeer`,
  //   {
  //     // path: '/meet/socket',
  //   }
  // );//this works

    // const socket = io(
    //   `https://sunzao.us/webrtcPeer`,
    //   {
    //     path: '/meet/socket.io',
    //   }
    // );//this fails

  // const socket = io(
  //   `167.99.57.20:3002`,
  //   {
  //     path: '/meet',
  //   }
  // );//this fails
  // transports:['websocket']// doesn't work

  const pc = new RTCPeerConnection(pc_config);
  // get access to the camera

  useEffect(() => {

    socket.on('connection-success', (success) => {
      console.log('[success]',success);
    })

    socket.on('offerOrAnswer', (sdp) => {
      textRef.current.value = JSON.stringify(sdp);
      setRemoteDescription();// i put this here the instructor kept hitting the btn
    });// offerOrAnswer

    socket.on('candidate', (candidate) => {
      console.log("receiving candidates...");
      candidates.current = [...candidates.current, candidate];
      // we can set this to auto answer or only on btn approval
      addCandidate();//FUTURE: in one to one calls this should pick up immediately
      //FUTURE: in selective broadcasts this should only set the candidate of the host selected socketID
      // we can separate it by using a json indicator, it will also not add to the candidates array
      // but replace it
    })

    pc.onicecandidate = (e) => {
      // if(e.candidate) console.log(JSON.stringify(e.candidate));
      sendToPeer('candidate',e.candidate);
    }// onicecandidate

    pc.oniceconnectionstatechange = (e) => {
      console.log(e);
    }// oniceconnecionstatechange

    pc.onaddstream = (e) => {
      remoteVideoRef.current.srcObject = e.stream;
    }// onaddstream

    const constraints = {video: true};//audio: true
    // const constraints = {video: true, audio: true};// this audio: true may be the src for a mute btn, same with video

    // both set to false may be the key to receiving and watching a stream without sending sending one (in a way - still sending an empty one)

    const success = (stream) => {
      videoRef.current.srcObject = stream;
      pc.addStream(stream);
    }// success

    const failure = (e) => {
      console.log('[getUserMedia] error:', e);
    }

    // navigator.getUserMedia( constraints, success, failure);// don't run both - this one is deprecated
    navigator.mediaDevices.getUserMedia( constraints)
    .then(success)
    .catch(failure);

  },[]);

  const sendToPeer = (messageType, payload) => {
    socket.emit(messageType, {
      socketID: socket.id,
      payload
    })
  }

  // (async () => {
  //   const stream  = await navigator.mediaDevices.getUserMedia( constraints);
  //   success(stream)
  // }().catch(failure);
  const createOffer = () => {
    console.log('[Offer]');
    pc.createOffer({offerToReceiveVideo: 1})
    .then((sdp) => {
      // console.log('[sdp]',JSON.stringify(sdp));
      pc.setLocalDescription(sdp);// set my own sdp

      sendToPeer('offerOrAnswer', sdp);
    }, e => {})// never seen this one on a then statement
  }

  const setRemoteDescription = () => {
    const desc = JSON.parse(textRef.current.value);
    pc.setRemoteDescription(new RTCSessionDescription(desc));
  }

  const createAnswer = () => {
    console.log('[Answer]');
    pc.createAnswer({offerToReceiveVideo: 1})
    .then((sdp) => {
      // console.log('[sdp]',JSON.stringify(sdp));
      pc.setLocalDescription(sdp);// set my own sdp
      sendToPeer('offerOrAnswer', sdp);
    }, e => {})
  }

  const addCandidate = () => {
    // const candidate = JSON.parse(textRef.current.value);
    // console.log('[adding candidate]', candidate);
    // pc.addIceCandidate(new RTCIceCandidate(candidate));
    candidates.current.forEach((candidate) => {
      console.log('[adding candidate]', JSON.stringify(candidate));
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    })
  }

  return (
    <BrowserRouter>
    <div >
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5, backgroundColor: 'black'
        }}
        ref={videoRef}
        autoPlay></video>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5, backgroundColor: 'black'
          }}
          ref={remoteVideoRef}
          autoPlay></video>
          <button onClick={createOffer}>Offer</button>
          <button onClick={createAnswer}>Answer</button>
          <br/>
          <textarea ref={textRef}></textarea>
          <br/>
          {/* <button onClick={setRemoteDescription}>Set Remote Description</button> */}
          {/* <button onClick={addCandidate}>Add Candidate</button> */}
    </div>
  </BrowserRouter>
  );
}

export default App;

// urls: [
//   "stun:stun.l.google.com: 19302",
//   "stun:stun1.l.google.com: 19302",
//   "stun:stun2.l.google.com: 19302",
//   "stun:stun3.l.google.com: 19302",
//   "stun:stun4.l.google.com: 19302"
// ]