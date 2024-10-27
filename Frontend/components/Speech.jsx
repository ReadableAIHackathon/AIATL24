// src/components/Book.jsx
'use client'

import { useEffect, useState, useRef } from "react";
import styled from 'styled-components';
import { FaMicrophone } from 'react-icons/fa';

// Setup the AudioButton style
const AudioButton = styled.button`
  background: ${({ isRecording }) => (isRecording ? 'red' : 'rgba(255, 255, 255, 0.8)')};
  /* styling setup */
`;

// MicrophoneComponent handling recognition
export default function MicrophoneComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    recognitionRef.current.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <AudioButton onClick={toggleRecording} isRecording={isRecording}>
      <FaMicrophone />
      {isRecording ? <p>Recording...</p> : <p>{transcript}</p>}
    </AudioButton>
  );
}
