import React, { useState } from 'react';
import axios from 'axios';
import NotesUI from './components/NotesUI';
import { startSpeechRecognition, stopRecognition, getFinalTranscript, resetTranscript } from './services/audioRecording';

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [generatedNotes, setGeneratedNotes] = useState({});

    const handleStartRecording = async () => {
        if (isRecording) return;
        setIsRecording(true);
        try {
            await startSpeechRecognition();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setIsRecording(false);
        }
    };
    const handleReset = () => {
        resetTranscript();  // Manually reset the transcript
    };
    const handleStopRecording = async () => {
        try {
            console.log("Stopping recognition...");
            stopRecognition();
            setIsRecording(false); // Disable stop button after stopping

            const finalTranscript = getFinalTranscript();

            if (!finalTranscript.trim()) {
                console.log("Final transcript is empty. Not sending to server.");
                return; // Exit if no transcript exists
            }

            console.log("Sending final transcript to server:", finalTranscript);

            // Send the transcript to the backend for note generation
            const response = await axios.post('http://localhost:3001/transcribe', { transcript: finalTranscript });
            const notes = response.data.notes;

            console.log("Received notes:", notes);
            setGeneratedNotes(notes);  // Pass the notes to your NotesUI component
        } catch (error) {
            console.error("Error stopping speech recognition or sending transcript:", error);
        }
    };

    return (
        <div className="App">
            <h1>Speech to Notes</h1>
            <button onClick={handleStartRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
            <button onClick={handleReset}>Reset</button>
            <NotesUI notes={generatedNotes} /> {/* Pass generated notes to your NotesUI */}
        </div>
    );
}

export default App;
