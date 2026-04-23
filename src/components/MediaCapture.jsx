import React, { useState, useRef, useEffect } from 'react';

const MediaCapture = ({ type, onCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Sync stream to video element
  useEffect(() => {
    if (stream && videoRef.current && (type === 'video' || type === 'photo')) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Playback failed", e));
    }
  }, [stream, type]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const [isProcessing, setIsProcessing] = useState(false);

  const startStream = async () => {
    setIsReady(false);
    try {
      const constraints = {
        audio: true,
        video: type === 'video' || type === 'photo'
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  };

  const startRecording = () => {
    chunksRef.current = [];
    
    // Find best MIME type
    const mimeTypes = [
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'audio/mp4',
      'audio/webm',
      'audio/ogg'
    ];
    
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        if (m.startsWith(type === 'video' ? 'video' : 'audio')) {
          selectedMime = m;
          break;
        }
      }
    }
    
    if (!selectedMime) selectedMime = type === 'video' ? 'video/webm' : 'audio/webm';

    try {
      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        setIsProcessing(true);
        
        // Capture a thumbnail from the video stream if it's a video
        let thumbnail = null;
        if (type === 'video' && videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth / 4; // Smaller for thumbnail
          canvas.height = videoRef.current.videoHeight / 4;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        }

        const blob = new Blob(chunksRef.current, { type: selectedMime });
        const reader = new FileReader();
        reader.onloadend = () => {
          onCapture({
            id: crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`,
            name: `${type}-${Date.now()}.${selectedMime.includes('mp4') ? 'mp4' : 'webm'}`,
            data: reader.result,
            type: selectedMime,
            thumbnail: thumbnail
          });
          setIsProcessing(false);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(100); // Capture chunks every 100ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
      alert("Recording failed to start. Browser format mismatch.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopStream();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    const MAX_DIM = 1200;
    const scale = Math.min(1, MAX_DIM / Math.max(videoRef.current.videoWidth, videoRef.current.videoHeight));
    
    canvas.width = videoRef.current.videoWidth * scale;
    canvas.height = videoRef.current.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    onCapture({
      id: crypto.randomUUID ? crypto.randomUUID() : `photo-${Date.now()}`,
      name: `photo-${Date.now()}.jpg`,
      data: canvas.toDataURL('image/jpeg', 0.85),
      type: 'image/jpeg'
    });
    stopStream();
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="media-manager">
      <div className="capture-container">
        {type !== 'audio' && stream ? (
          <div className="capture-viewport">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              onLoadedMetadata={() => setIsReady(true)}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
            {isRecording && (
              <div className="recording-status">
                <span className="rec-dot"></span>
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
        ) : type === 'audio' && isRecording ? (
          <div className="audio-visualizer">
            <div className="pulse-circle"></div>
            <p>Recording... {formatTime(recordingTime)}</p>
          </div>
        ) : isProcessing ? (
          <div className="processing-indicator" style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', width: '100%' }}>
            <p>⏳ Finalizing recording... please wait.</p>
          </div>
        ) : !stream && (
          <div className="capture-placeholder" style={{padding: '2rem', textAlign: 'center', opacity: 0.5}}>
             {type === 'audio' ? '🎙️ Ready to record' : type === 'photo' ? '📸 Ready to capture' : '🎥 Ready to film'}
          </div>
        )}
        
        <div className="header-actions">
          {!stream ? (
            <button type="button" className="btn btn-primary" onClick={startStream}>
              {type === 'photo' ? 'Open Camera' : `Access ${type === 'video' ? 'Camera' : 'Mic'}`}
            </button>
          ) : (
            <div className="active-controls">
              {type === 'photo' ? (
                <button type="button" className="btn btn-primary" onClick={capturePhoto} disabled={!isReady}>📸 Save Photo Note</button>
              ) : (
                !isRecording ? (
                  <button type="button" className="btn btn-primary" onClick={startRecording}>🔴 Start Recording</button>
                ) : (
                  <button type="button" className="btn btn-danger" onClick={stopRecording}>⬛ Stop & Save Note</button>
                )
              )}
              <button type="button" className="btn btn-secondary" onClick={stopStream}>Cancel</button>
            </div>
          )}
        </div>

        <div className="file-upload-section">
          <p className="text-muted">Or upload a file:</p>
          <input 
            type="file" 
            accept={`${type}/*`} 
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                onCapture({
                  id: crypto.randomUUID ? crypto.randomUUID() : `file-${Date.now()}`,
                  name: file.name,
                  data: reader.result,
                  type: file.type
                });
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaCapture;
