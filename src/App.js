import React, { useState } from 'react';
import { FaPlay, FaStop, FaSync } from 'react-icons/fa';
import axios from 'axios';
import NotesUI from './components/NotesUI'; // Import NotesUI
import './App.css';
import mentIcon from './assets/MENT-Icon.jpeg';
import { startSpeechRecognition, stopRecognition, getFinalTranscript, resetTranscript } from './services/audioRecording';
import jsPDF from 'jspdf'; // Import jsPDF

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [generatedNotes, setGeneratedNotes] = useState({
        'Main Topics of Discussion': [],
        'Key Takeaways': [],
        'Next Steps/To Do\'s': []
    });

    // Function to start recording
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

    // Function to reset notes and transcript
    const handleReset = () => {
        resetTranscript();
        setGeneratedNotes({
            'Main Topics of Discussion': [],
            'Key Takeaways': [],
            'Next Steps/To Do\'s': []
        });
    };

    // Function to stop recording and send the transcript to the server
    const handleStopRecording = async () => {
        try {
            stopRecognition();
            setIsRecording(false);

            const finalTranscript = getFinalTranscript();
            if (!finalTranscript.trim()) {
                console.log("Final transcript is empty. Not sending to server.");
                return;
            }

            const response = await axios.post('http://localhost:3001/transcribe', { transcript: finalTranscript });
            const notes = response.data.notes;
            setGeneratedNotes(notes);
        } catch (error) {
            console.error("Error stopping speech recognition or sending transcript:", error);
        }
    };

    // Function to generate PDF and prompt user for filename
    const downloadPDF = (notes) => {
        const filename = prompt('Enter a name for the file:', 'Meeting_Notes'); // Prompt for filename
        if (!filename) return; // Exit if no filename is provided

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Meeting Recap", 10, 10);

        const sections = ['Main Topics of Discussion', 'Key Takeaways', 'Next Steps/To Do\'s'];
        let yOffset = 20;

        sections.forEach((section) => {
            doc.setFontSize(14);
            doc.text(`${section}:`, 10, yOffset);
            yOffset += 10;
            const content = notes[section];
            if (content.length === 0) {
                doc.text("- None", 10, yOffset);
            } else {
                content.forEach(note => {
                    doc.text(`- ${note}`, 10, yOffset);
                    yOffset += 10;
                });
            }
            yOffset += 10;
        });

        doc.save(`${filename}.pdf`); // Save the PDF with the given filename
    };

    return (
        <div className="App">
            <header className="App-header">
                <div className="top-bar">
                    <img src={mentIcon} alt="MENT Logo" className="logo" />
                    <span className="header-title">MENT</span>
                </div>
                <h1>Meeting Recap</h1>
                <NotesUI notes={generatedNotes} downloadPDF={downloadPDF} /> {/* Pass the downloadPDF function as a prop */}
                <div className="controls">
                    <button onClick={handleStartRecording} disabled={isRecording}>
                        <FaPlay /> Start Recording
                    </button>
                    <button onClick={handleStopRecording} disabled={!isRecording}>
                        <FaStop /> Stop Recording
                    </button>
                    <button onClick={handleReset}><FaSync /> Reset</button>
                </div>
            </header>
        </div>
    );
}

export default App;
