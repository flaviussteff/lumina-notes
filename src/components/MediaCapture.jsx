import React, { useState, useRef, useEffect } from 'react';

const MediaCapture = ({ type, onCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);

  const startStream = async () => {
    setIsReady(false);
    try {
      const constraints = {
        audio: true,
        video: type === 'video' || type === 'photo'
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current && (type === 'video' || type === 'photo')) {
        videoRef.current.srcObject = newStream;
        // Explicitly call play to handle some browser policies
        videoRef.current.play().catch(e => console.error("Playback failed", e));
      }
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
    const options = { mimeType: type === 'video' ? 'video/webm' : 'audio/webm' };
    const recorder = new MediaRecorder(stream, options);
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture({
          id: crypto.randomUUID(),
          name: `${type}-${Date.now()}.${type === 'video' ? 'webm' : 'webm'}`,
          data: reader.result,
          type: blob.type
        });
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopStream();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isReady || videoRef.current.videoWidth === 0) {
      alert('Camera initializing... please wait 1-2 seconds.');
      return;
    }

    const canvas = document.createElement('canvas');
    // Scale down for storage efficiency and to avoid "corruption" from huge strings
    const MAX_WIDTH = 1024;
    const scale = Math.min(1, MAX_WIDTH / videoRef.current.videoWidth);
    canvas.width = videoRef.current.videoWidth * scale;
    canvas.height = videoRef.current.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for better compression
    onCapture({
      id: crypto.randomUUID(),
      name: `photo-${Date.now()}.jpg`,
      data: dataUrl,
      type: 'image/jpeg'
    });
    stopStream();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture({
        id: crypto.randomUUID(),
        name: file.name,
        data: reader.result,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="media-manager">
      <div className="capture-container">
        {type !== 'audio' && stream && (
          <video 
            ref={videoRef} 
            className="video-preview" 
            autoPlay 
            muted 
            playsInline 
            onLoadedMetadata={() => setIsReady(true)}
            onCanPlay={() => setIsReady(true)}
          />
        )}
        
        <div className="header-actions">
          {!stream ? (
            <button type="button" className="btn btn-primary" onClick={startStream}>
              {type === 'photo' ? 'Open Camera' : `Access ${type === 'video' ? 'Camera' : 'Mic'}`}
            </button>
          ) : (
            <>
              {type === 'photo' ? (
                <button type="button" className="btn btn-primary" onClick={capturePhoto}>📸 Capture Photo</button>
              ) : (
                !isRecording ? (
                  <button type="button" className="btn btn-primary" onClick={startRecording}>🔴 Start Recording</button>
                ) : (
                  <button type="button" className="btn btn-danger" onClick={stopRecording}>⬛ Stop Recording</button>
                )
              )}
              <button type="button" className="btn btn-secondary" onClick={stopStream}>Cancel</button>
            </>
          )}
        </div>

        <div style={{marginTop: '1rem', textAlign: 'center'}}>
          <p className="text-muted">Or upload a file:</p>
          <input 
            type="file" 
            accept={`${type}/*`} 
            onChange={handleFileUpload}
            style={{marginTop: '0.5rem'}}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaCapture;
