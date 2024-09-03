import React, { useState, useEffect } from 'react';
import './App.css';
import NotesUI from './components/NotesUI';

function App() {
    const [notes, setNotes] = useState({});

    useEffect(() => {
        fetch('/notes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data); //Checks if data is being fetched
                setNotes(data);
            })
            .catch(error => console.error('Error fetching notes:', error));
    }, []);

    return (
        <div className="App">
            <NotesUI notes={notes} />
        </div>
    );
}

export default App;
