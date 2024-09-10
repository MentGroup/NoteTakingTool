let mediaRecorder = null; // Declare globally

// Function to check MediaRecorder support
function checkMediaRecorderSupport() {
    if (!window.MediaRecorder) {
        console.error('MediaRecorder API not supported.');
        alert('Your browser does not support recording features.');
        return false;
    }
    return true;
}

// Check for MediaRecorder support early
if (!checkMediaRecorderSupport()) {
    alert('Your browser does not support the necessary recording features.');
}

// Start recording function
export async function startRecording() {
    console.log('Attempting to start recording...');
    try {
        // Capture both microphone (and system audio if routed via a virtual device)
        const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                sampleRate: 44100
            }
        });
        console.log('Microphone stream acquired:', micStream);

        const combinedStream = micStream; // Simplified to capture mic audio (combine with system audio through external setup if needed)
        console.log('Combined stream:', combinedStream);

        if (combinedStream.getAudioTracks().length === 0) {
            throw new Error('Combined stream has no audio tracks.');
        }

        // MIME type fallback options for various browsers
        let options = { mimeType: 'audio/webm; codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/webm' };
        }
       if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/mp4' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = {}; // Fallback to default if none is supported
        }

        // Initialize MediaRecorder
        mediaRecorder = new MediaRecorder(combinedStream, options);
        console.log('MediaRecorder initialized:', mediaRecorder);

        let audioChunks = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                console.log('Audio chunk available:', event.data);
            }
        };

        mediaRecorder.onstart = () => {
            console.log('Recording started.');
        };

        mediaRecorder.onstop = () => {
            console.log('Recording stopped.');
            const audioBlob = new Blob(audioChunks, { type: options.mimeType || 'audio/webm' });
            console.log('Audio Blob size:', audioBlob.size);
            if (audioBlob.size > 0) {
                processAudioChunk(audioBlob); // Send audio to backend
            } else {
                console.error('Audio Blob is empty, not sending to backend');
            }
        };

        mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event.error);
        };

        // Start recording
        mediaRecorder.start();
    } catch (error) {
        console.error('Error capturing audio:', error);
    }
}

// Stop recording function
export function stopRecording() {
    if (mediaRecorder) {
        if (mediaRecorder.state !== 'inactive') {
            console.log('Stopping recording...');
            mediaRecorder.stop();
        } else {
            console.error('MediaRecorder is inactive.');
        }
    } else {
        console.error('No MediaRecorder instance found.');
    }
}

// Process audio and send to backend
export const processAudioChunk = async (audioBlob) => {
    if (!(audioBlob instanceof Blob)) {
        console.error('audioBlob is not a Blob instance.');
        return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm'); // Adjust to match backend expectations

    try {
        const response = await fetch('http://localhost:3001/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Transcription result:', result);
    } catch (error) {
        console.error('Error sending audio to backend:', error);
    }
};

// Additional browser support checks
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Your browser does not support the necessary APIs for recording.');
}
