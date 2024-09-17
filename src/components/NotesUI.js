import React, { useRef } from 'react';
import './NotesUI.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NotesUI = ({ notes = {} }) => {
    const notesRef = useRef();  // Reference to the notes container for PDF generation

    const { 'Main Topics of Discussion': mainTopics, 'Key Takeaways': keyTakeaways, 'Next Steps/To Do\'s': nextSteps } = notes;

    const renderSection = (title, content) => (
        <div className="section">
            <h2 className="section-title">{title}</h2>
            <ul className="section-content">
                {content && content.length > 0 ? (
                    content.map((item, index) => (
                        <li 
                            key={index} 
                            className="note-item" 
                            contentEditable={true}  // Make notes editable
                            suppressContentEditableWarning={true}  // Suppress warning
                        >
                            {item}
                        </li>  // JSX corrected here
                    ))
                ) : (
                    <li className="note-item" style={{ color: '#999', fontStyle: 'italic' }}>None</li>  // Removed extra dash
                )}
            </ul>
        </div>
    );

    // Function to generate the PDF with a custom name
    const downloadPDF = async () => {
        const fileName = prompt('Enter the name for your PDF file:', 'meeting_notes');  // Prompt for file name

        if (!fileName) return;  // If the user cancels, don't proceed

        const input = notesRef.current;

        // Use html2canvas to capture the exact styles
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = canvas.height * pdfWidth / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);  // Save with the entered filename
    };

    return (
        <div className="notes-container" ref={notesRef}> {/* Wrap the notes in a ref */}
            {renderSection('Main Topics of Discussion', mainTopics)}
            {renderSection('Key Takeaways', keyTakeaways)}
            {renderSection('Next Steps / To Do\'s', nextSteps)}

            {/* Button only visible on screen, not in PDF */}
            <div id="bottom-right-container">
                <button className="download-btn" onClick={downloadPDF}>Download Notes as PDF</button>
            </div>
        </div>
    );
};

export default NotesUI;
