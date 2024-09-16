let recognition;
export let finalTranscript = ''; // This will hold the full transcript
let interimTranscript = ''; // This will hold the interim transcript during a session
let isRecognitionRunning = false;
let inactivityTimeout; // For tracking inactivity timeout
const INACTIVITY_THRESHOLD = 10000; // Waits 10 seconds of inactivity before restarting
const RESTART_DELAY = 1000;  // 1-second delay before restarting
const CHARACTER_THRESHOLD = 300; // Threshold for interim transcript size

// Request microphone permission
async function requestMicPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
        return true;
    } catch (error) {
        alert('Microphone access is required.');
        console.log('Microphone permission denied');
        return false;
    }
}

// Initialize SpeechRecognition API
function initializeRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        alert('Browser does not support SpeechRecognition API.');
        console.log('SpeechRecognition API not supported');
        return;
    }

    recognition = new window.SpeechRecognition();
    recognition.continuous = true; // Keep recognition continuous
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        clearTimeout(inactivityTimeout); // Clear inactivity timeout on result
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            // Only append to finalTranscript if the result is final
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' '; // Append final transcript
                console.log('Final Transcript (updated):', finalTranscript);
            } else {
                interim += transcript;
                interimTranscript += transcript; // Accumulate interim transcript
            }
        }

        // Append interim transcript to finalTranscript if it exceeds the character threshold
        if (interimTranscript.length > CHARACTER_THRESHOLD) {
            finalTranscript += interimTranscript.trim() + ' ';
            interimTranscript = ''; // Reset interim transcript after appending
            console.log('Appended Interim Transcript:', finalTranscript);
        }

        // Restart if no activity for a defined threshold duration
        inactivityTimeout = setTimeout(() => {
            console.log('No activity detected. Restarting recognition...');
            restartRecognition();
        }, INACTIVITY_THRESHOLD);
    };

    recognition.onerror = (event) => {
        console.log('Recognition error:', event.error);
        restartRecognition();
    };

    recognition.onend = () => {
        console.log('Recognition ended.');
        // Append any remaining interim transcript to the final transcript
        if (interimTranscript.trim() !== '') {
            finalTranscript += interimTranscript.trim() + ' ';
            interimTranscript = ''; // Reset interim transcript after appending
            console.log('Appended final Interim Transcript:', finalTranscript);
        }

        if (isRecognitionRunning) {
            console.log('Recognition stopped unexpectedly. Restarting...');
            restartRecognition(); // Restart when stopped unexpectedly
        }
    };

    console.log('Speech recognition initialized.');
}

// Start Speech Recognition
export async function startSpeechRecognition() {
    if (!isRecognitionRunning) {
        finalTranscript = '';  // Reset final transcript for new session
        interimTranscript = ''; // Reset interim transcript for new session
        const permissionGranted = await requestMicPermission();
        if (!permissionGranted) return;

        if (!recognition) initializeRecognition();
        startRecognition();
    }
}

// Function to start recognition
function startRecognition() {
    if (!isRecognitionRunning) {
        console.log('Starting recognition...');
        try {
            recognition.start();
            isRecognitionRunning = true;
        } catch (error) {
            console.log('Recognition start failed:', error);
        }
    } else {
        console.log('Recognition already running.');
    }
}

// Restart recognition with a delay
function restartRecognition() {
    if (isRecognitionRunning) {
        console.log('Stopping recognition before restarting...');
        recognition.stop();
        isRecognitionRunning = false;

        setTimeout(() => {
            console.log('Restarting recognition...');
            startRecognition();  // Restart after delay
        }, RESTART_DELAY);
    }
}

// Stop recognition
export function stopRecognition() {
    if (isRecognitionRunning) {
        console.log('Stopping recognition...');
        recognition.stop();
        clearTimeout(inactivityTimeout); // Clear timeout when stopping
        isRecognitionRunning = false;
    }
}

// Export the final transcript for use elsewhere
export const getFinalTranscript = () => finalTranscript;
