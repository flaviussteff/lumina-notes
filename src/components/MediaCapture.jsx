import React, { useState, useRef, useEffect } from 'react';

const MediaCapture = ({ type, onCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);

  const startStream = async () => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video' || type === 'photo'
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current && (type === 'video' || type === 'photo')) {
        videoRef.current.srcObject = newStream;
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
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    onCapture({
      id: crypto.randomUUID(),
      name: `photo-${Date.now()}.png`,
      data: dataUrl,
      type: 'image/png'
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
          <video ref={videoRef} className="video-preview" autoPlay muted playsInline />
        )}
        
        <div className="header-actions">
          {!stream ? (
            <button className="btn btn-primary" onClick={startStream}>
              {type === 'photo' ? 'Open Camera' : `Access ${type === 'video' ? 'Camera' : 'Mic'}`}
            </button>
          ) : (
            <>
              {type === 'photo' ? (
                <button className="btn btn-primary" onClick={capturePhoto}>📸 Capture Photo</button>
              ) : (
                !isRecording ? (
                  <button className="btn btn-primary" onClick={startRecording}>🔴 Start Recording</button>
                ) : (
                  <button className="btn btn-danger" onClick={stopRecording}>⬛ Stop Recording</button>
                )
              )}
              <button className="btn btn-secondary" onClick={stopStream}>Cancel</button>
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
