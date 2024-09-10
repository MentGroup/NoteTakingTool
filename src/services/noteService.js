export const sendTranscriptToBackend = async (transcript) => {
    try {
        const response = await fetch('http://localhost:3001/generateNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript }), // Send transcript to backend
        });

        const data = await response.json();
        console.log('Generated Notes:', data.notes); // Display the generated notes
        return data.notes;
    } catch (error) {
        console.error('Error sending transcript to backend:', error);
        return null;
    }
};