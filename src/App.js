import React, { useState, useEffect } from 'react';
import './App.css';
import NotesUI from './components/NotesUI';

function App() {
    const [notes, setNotes] = useState({}); // Initialize with an empty object

    useEffect(() => {
        // Simulate fetching or generating notes data with mock data
        const mockNotes = {
            "Spider-Man": [
                "Likes to fight bad guys",
                "Enjoys saving the day",
                "Real name is Peter Parker"
            ],
            "Arch Enemy Venom": [
                "Venom is Spider-Man's arch enemy"
            ]
        };
        setNotes(mockNotes);
    }, []);

    return (
        <div className="App">
            <NotesUI notes={notes} />
        </div>
    );
}

export default App;
