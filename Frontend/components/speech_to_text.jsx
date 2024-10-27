// src/components/SpeechToText.jsx
import React, { useState, useRef, useEffect } from 'react';

export const SpeechToText = ({
  onTranscriptChange,
  onFinalTranscript,
  onError,
  onStartRecording,
  onStopRecording,
  autoStop = false,
  maxDuration,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const handleError = (error) => {
    setIsRecording(false);
    if (onError) onError(error);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      const wsUrl = process.env.NEXT_PUBLIC_GOOGLE_SPEECH_WEBSOCKET_URL;
      if (!wsUrl) throw new Error('WebSocket URL not configured');

      // Establish WebSocket connection
      console.log(wsUrl);
      //socketRef.current = new WebSocket(wsUrl);
      socketRef.current = io(wsUrl)
      
      socketRef.current.onopen = () => {
        const audioConfig = {
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'latest_long',
            useEnhanced: true,
          },
          interimResults: true,
        };
        
        socketRef.current.send(JSON.stringify(audioConfig));
      };
      
      socketRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.results) {
          const result = response.results[0];
          if (result.alternatives) {
            const newTranscript = result.alternatives[0].transcript;
            if (result.isFinal) {
              setTranscript(prev => {
                const updatedTranscript = prev + ' ' + newTranscript;
                if (onFinalTranscript) onFinalTranscript(updatedTranscript.trim());
                return updatedTranscript;
              });
            } else {
              setTranscript(newTranscript);
              if (onTranscriptChange) onTranscriptChange(newTranscript);
            }
          }
        }
      };

      socketRef.current.onerror = () => {
        handleError('Connection error occurred');
      };

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        bitsPerSecond: 16000
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };
      
      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      if (onStartRecording) onStartRecording();

      if (autoStop && maxDuration) {
        timerRef.current = setTimeout(stopRecording, maxDuration);
      }
      
    } catch (err) {
      let errorMessage = 'An error occurred while starting the recording';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found';
      }
      
      handleError(errorMessage);
      console.error('Recording Error:', err);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    if (onStopRecording) onStopRecording();
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <p>{transcript}</p>
    </div>
  );
};
