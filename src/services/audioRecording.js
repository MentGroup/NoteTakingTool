// let mediaRecorder = null; // Declare globally (commented out, we won't use MediaRecorder)

// Function to check WebkitSpeechRecognition support
/*function checkSpeechRecognitionSupport() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        console.error('SpeechRecognition API not supported.');
        alert('Your browser does not support speech recognition features.');
        return false;
    }
    return true;
}

// Check for WebkitSpeechRecognition support early
if (!checkSpeechRecognitionSupport()) {
    alert('Your browser does not support the necessary speech recognition features.');
}

// Initialize WebkitSpeechRecognition
const recognition = new window.SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true; // Set to true to capture partial results
recognition.lang = 'en-US';
let isRecognitionRunning = false;
let finalTranscript = '';  // Store final transcript globally

// Function to request microphone permission
async function requestMicPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        stream.getTracks().forEach(track => track.stop());  // Stop the stream immediately
        return true;
    } catch (error) {
        console.error('Microphone permission denied:', error);
        alert('Microphone access is required for speech recognition.');
        return false;
    }
}

// Start speech recognition function
export async function startSpeechRecognition() {
    const permissionGranted = await requestMicPermission();  // Ensure permission is granted
    if (!permissionGranted) return;

    if (isRecognitionRunning) {
        console.error("Speech recognition is already running.");
        return;
    }
    try {
        finalTranscript = '';  // Clear transcript on new session
        recognition.start();
        isRecognitionRunning = true;
        console.log('Speech recognition started.');
    } catch (error) {
        console.error('Error starting speech recognition:', error);
    }
}

// Stop speech recognition function
export function stopSpeechRecognition() {
    if (!isRecognitionRunning) {
        console.error("Speech recognition is not running.");
        return;
    }
    console.log('Stopping speech recognition...');
    recognition.stop();
}

// Handle when recognition ends
recognition.onend = () => {
    isRecognitionRunning = false;
    console.log('Speech recognition stopped.');
    
    // Send the final transcript to backend for transcription when stopped
    if (finalTranscript) {
        processTranscript(finalTranscript);  // Send final transcript to backend
    } else {
        console.error("No transcript available to send.");
    }
};

// Handle when recognition is aborted
recognition.onabort = (event) => {
    console.error('Speech recognition was aborted:', event);
    // Optionally, restart recognition if needed
    setTimeout(() => {
        console.log('Attempting to restart speech recognition...');
        startSpeechRecognition();
    }, 1000);  // Delay to prevent immediate restart
};

// Process the transcript and send to backend
// Process the transcript and send to backend
export const processTranscript = async (transcript) => {
    try {
        // Send as JSON, not FormData, because the backend likely expects a JSON payload
        const response = await fetch('http://localhost:3001/generateNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript }),  // Send the transcript as JSON
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Generated notes:', result);
    } catch (error) {
        console.error('Error sending transcript to backend:', error);
    }
};


// Event handler for when recognition results are available
recognition.onresult = (event) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
            finalTranscript += result[0].transcript;
        } else {
            interimTranscript += result[0].transcript;
        }
    }

    console.log('Interim Transcript:', interimTranscript);
    console.log('Final Transcript:', finalTranscript);  // Only append the final result once
};

recognition.onerror = (event) => {
    console.error('Speech Recognition Error:', event.error);

    // Handle specific "no-speech" error
    if (event.error === 'no-speech') {
        console.log('No speech detected. Please try speaking more clearly.');
        alert('No speech detected. Please try again.');
        // Optionally, restart the recognition
        setTimeout(() => {
            console.log('Restarting speech recognition after no-speech error...');
            startSpeechRecognition();
        }, 1000);  // Delay before restarting
    }

    if (event.error === 'audio-capture') {
        console.error('Microphone access issue.');
        alert('Please check your microphone permissions.');
    }
};
recognition.onabort = (event) => {
    console.error('Speech recognition was aborted:', event);
    // Optionally restart recognition
    setTimeout(() => {
        console.log('Attempting to restart speech recognition...');
        startSpeechRecognition();
    }, 1000);  // Delay to prevent immediate restart
};
*/

// COMMENTED OUT MEDIARECORDER CODE
let mediaRecorder = null; // Declare MediaRecorder globally
let combinedTranscript = ""; // Store the combined transcript
let audioChunks = []; // Store audio chunks

export async function startRecording() {
    console.log('Attempting to start recording...');
    combinedTranscript = "";  // Reset combined transcript on new recording

    try {
        const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                sampleRate: 44100
            }
        });

        console.log('Microphone stream acquired:', micStream);

        const combinedStream = micStream;
        console.log('Combined stream:', combinedStream);

        if (combinedStream.getAudioTracks().length === 0) {
            throw new Error('Combined stream has no audio tracks.');
        }

        let options = { mimeType: 'audio/webm; codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/webm' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/mp4' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = {};
        }

        mediaRecorder = new MediaRecorder(combinedStream, options);
        console.log('MediaRecorder initialized:', mediaRecorder);

        mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
                console.log('Audio chunk available:', event.data);
                audioChunks.push(event.data);

                // Process the individual blob immediately after it becomes available
                await processAudioChunk(event.data);
            }
        };

        mediaRecorder.onstart = () => {
            console.log('Recording started.');
        };

        mediaRecorder.onstop = () => {
            console.log('Recording stopped.');
            if (audioChunks.length === 0) {
                console.error('No audio chunks recorded.');
            }

            // Final processing after all blobs are processed
            console.log('Final Combined Transcript:', combinedTranscript);
        };

        // Start recording and generate a new blob every 30 seconds
        mediaRecorder.start(10000); // timeslice of 30 seconds
    } catch (error) {
        console.error('Error capturing audio:', error);
    }
}

export function stopRecording() {
    if (mediaRecorder) {
        if (mediaRecorder.state !== 'inactive') {
            console.log('Stopping recording...');
            mediaRecorder.stop();
        } else {
            console.error('MediaRecorder is already inactive.');
        }
    } else {
        console.error('No MediaRecorder instance found.');
    }
}

export async function processAudioChunk(audioBlob) {
    console.log('Processing audio chunk for upload...');
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

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

        if (result && result.transcription) {
            combinedTranscript += " " + result.transcription.trim(); // Append transcription
            console.log('Combined transcript:', combinedTranscript);
        } else {
            console.error('Transcription is empty or undefined:', result);
        }
    } catch (error) {
        console.error('Error uploading audio:', error);
    }
}

// Function to send the combined transcript to the backend for note generation
export async function generateNotesFromTranscript() {
    if (!combinedTranscript || combinedTranscript.trim() === "") {
        console.error('Transcript is undefined or empty.');
        return;
    }

    console.log('Sending transcript:', combinedTranscript);

    try {
        const response = await fetch('http://localhost:3001/generateNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript: combinedTranscript }),  // Send combined transcript
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Generated notes:', result.notes);
        return result.notes;
    } catch (error) {
        console.error('Error generating notes:', error);
    }
}

