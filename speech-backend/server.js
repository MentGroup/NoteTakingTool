const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { generateStructuredNotes } = require('./backend-services/openAIService'); 

const app = express();
app.use(cors());
app.use(express.json()); 

// API endpoint to handle the transcript and generate notes
app.post('/transcribe', async (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript || typeof transcript !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing transcript.' });
        }

        // Generate structured notes based on the transcript
        const notes = await generateStructuredNotes(transcript);
        if (!notes) {
            return res.status(500).json({ error: 'Failed to generate notes.' });
        }

        // Return the structured notes to the frontend
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
