const express = require('express');
const multer = require('multer');
const fs = require('fs');
const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const cors = require('cors');
require('dotenv').config();

// Google Speech Client setup
const client = new speech.SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const app = express();
app.use(express.json());
app.use(cors());

// File upload middleware
const upload = multer({ dest: 'uploads/' });

// Convert audio file using ffmpeg
const convertToWebm = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on('end', () => {
                console.log(`Conversion to webm successful: ${outputPath}`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error(`Conversion failed: ${err.message}`);
                reject(err);
            })
            .save(outputPath);
    });
};

// Transcribe audio using Google Cloud Speech
const transcribeAudio = async (audioFile) => {
    const file = fs.readFileSync(audioFile);
    const audioBytes = file.toString('base64');
    
    const audio = {
        content: audioBytes,
    };

    const config = {
        encoding: 'WEBM_OPUS',
        languageCode: 'en-US',
    };

    const request = {
        audio: audio,
        config: config,
    };

    try {
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        return transcription;
    } catch (error) {
        console.error('Error transcribing audio:', error.message);
        throw error;
    }
};

// POST route for transcribing audio
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const outputFile = `${file.path}_converted.webm`;

        // Convert uploaded file to webm using ffmpeg
        await convertToWebm(file.path, outputFile);

        // Transcribe the converted file
        const transcript = await transcribeAudio(outputFile);

        if (transcript) {
            res.status(200).json({ transcription: transcript });
        } else {
            res.status(500).send('Transcription failed.');
        }
    } catch (err) {
        console.error('Error processing audio file:', err);
        res.status(500).send('Server error.');
    } finally {
        // Clean up files
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting original file:', err);
        });
        fs.unlink(`${req.file.path}_converted.webm`, (err) => {
            if (err) console.error('Error deleting converted file:', err);
        });
    }
});

// POST route for generating notes from the transcript
const { organizeNotesByTopic } = require('./backend-services/noteOrganizer');

app.post('/generateNotes', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript || transcript.trim() === "") {
        return res.status(400).send('Transcript is required.');
    }

    try {
        const organizedNotes = await organizeNotesByTopic(transcript);
        res.json({ notes: organizedNotes });
    } catch (error) {
        console.error('Error generating notes:', error.message);
        res.status(500).send('Error generating notes.');
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


/*
app.post('/transcribe', async (req, res) => {
    const { transcript } = req.body; // Expecting transcript text

    if (!transcript) {
        return res.status(400).send('Transcript is required.');
    }

    try {
        // Optionally send this transcript to OpenAI to process
        const notes = await generateNotes(transcript); // Assuming this generates notes from the transcript
        res.json({ notes });
    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).send('Error generating notes');
    }
});

app.use(express.json());  // Ensure you can parse JSON in the request body */
