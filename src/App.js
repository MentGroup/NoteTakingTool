import React, { useState } from 'react';
import { startRecording, stopRecording } from './services/audioRecording'; // Adjust path as needed

function App() {
    const [isRecording, setIsRecording] = useState(false);

    const handleStartRecording = async () => {
        if (isRecording) return; // Prevent starting a new recording if one is already active
        setIsRecording(true);
        try {
            await startRecording();
        } catch (error) {
            console.error("Error starting recording:", error);
            setIsRecording(false);
        }
    };

    const handleStopRecording = async () => {
        if (!isRecording) return; // Prevent stopping if no recording is active
        try {
            await stopRecording();
        } catch (error) {
            console.error("Error stopping recording:", error);
        } finally {
            setIsRecording(false);
        }
    };

    return (
        <div className="App">
            <h1>Zoom/Google Meet Audio Recorder</h1>
            <button onClick={handleStartRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
        </div>
    );
}

export default App;