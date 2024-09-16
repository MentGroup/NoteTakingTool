const express = require('express');
const cors = require('cors');
const { organizeNotesByTopic } = require('./backend-services/openAIService'); // Assuming you already have this function

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body data

// API endpoint to handle the transcript and generate notes
app.post('/transcribe', async (req, res) => {
    try {
        const { transcript } = req.body; // Extract 'transcript' from the request body
        if (!transcript || typeof transcript !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing transcript.' });
        }

        // Generate notes based on the transcript
        const notes = await organizeNotesByTopic(transcript);  // Use your service function to generate notes
        if (!notes) {
            return res.status(500).json({ error: 'Failed to generate notes.' });
        }

        // Return the notes to the frontend
        res.json({ notes });
    } catch (error) {
        console.error('Error during note generation:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
