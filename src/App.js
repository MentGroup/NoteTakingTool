/*import React, { useState } from 'react';
import { startSpeechRecognition, stopSpeechRecognition } from './services/audioRecording'; // Adjust path as needed

function App() {
    const [isRecording, setIsRecording] = useState(false);

    const handleStartRecording = async () => {
        if (isRecording) return; // Prevent starting a new recording if one is already active
        setIsRecording(true);
        try {
            await startSpeechRecognition();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setIsRecording(false);
        }
    };

    const handleStopRecording = async () => {
        if (!isRecording) return; // Prevent stopping if no recording is active
        try {
            await stopSpeechRecognition();
        } catch (error) {
            console.error("Error stopping speech recognition:", error);
        } finally {
            setIsRecording(false);
        }
    };

    return (
        <div className="App">
            <h1>Zoom/Google Meet Audio Recorder</h1>
            <button onClick={handleStartRecording} disabled={isRecording}>
                Start Speech Recognition
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
                Stop Speech Recognition
            </button>
        </div>
    );
}

export default App;
*/
/* COMMENTED OUT MEDIARECORDER-BASED HANDLERS */
import React, { useState, useEffect } from 'react';
import { startRecording, stopRecording, generateNotesFromTranscript } from './services/audioRecording';
import NotesUI from './components/NotesUI';

const App = () => {
    const [generatedNotes, setGeneratedNotes] = useState({});  // State to hold the notes
    const [isRecording, setIsRecording] = useState(false);     // State to manage recording

    // Function to handle starting the recording
    const handleStartRecording = async () => {
        if (!isRecording) {
            setIsRecording(true);  // Set recording to true to disable start button
            await startRecording(setGeneratedNotes);  // Pass setGeneratedNotes to update notes
        }
    };

    // Function to handle stopping the recording
    const handleStopRecording = async () => {
        if (isRecording) {
            setIsRecording(false);  // Disable start button while processing
            
            try {
                const finalTranscript = await stopRecording();  // Wait for the final transcript
    
                if (finalTranscript && finalTranscript.trim() !== "") {
                    console.log('Combined Transcript:', finalTranscript);
    
                    const organizedNotes = await generateNotesFromTranscript(finalTranscript);  // Generate notes from transcript
                    if (organizedNotes) {
                        setGeneratedNotes(organizedNotes);  // Update notes in the UI
                    } else {
                        console.error('No organized notes were returned.');
                    }
                } else {
                    console.error('Transcript is undefined or empty.');
                }
            } catch (error) {
                console.error('Error while stopping recording:', error);
            }
        }
    };
    

    // Log whenever generated notes change
    useEffect(() => {
        console.log("Generated Notes updated in App:", generatedNotes);
    }, [generatedNotes]);

    return (
        <div>
            <h1>Audio Notes</h1>
            
            <button onClick={handleStartRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
            
            {/* Render Notes UI and pass down generated notes */}
            <NotesUI notes={generatedNotes} />
        </div>
    );
};

export default App;

