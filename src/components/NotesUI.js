import React from 'react';
import './NotesUI.css';

const NotesUI = ({ notes = {} }) => {
    const renderNotes = () => {
        return Object.entries(notes).map(([topic, notes]) => (
            <div key={topic}>
                <div className="topic">{topic}</div>
                {notes.map((note, index) => (
                    <div key={index} className="note" contentEditable={true}>
                        {note}
                    </div>
                ))}
            </div>
        ));
    };

    const downloadNotes = () => {
        // Your download logic here...
    };

    return (
        <div>
            <div id="notes-container">
                {renderNotes()}
            </div>
            <div id="bottom-right-container">
                <button className="download-btn" onClick={downloadNotes}>Download Notes as PDF</button>
                <span className="instruction-text">Click any note to edit</span>
            </div>
        </div>
    );
};

export default NotesUI;
