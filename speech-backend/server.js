const express = require('express');
const multer = require('multer');
const fs = require('fs');
const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const { generateNotes } = require('./backend-services/openAIService');
const cors = require('cors');
require('dotenv').config();

console.log('Google Cloud Credentials Path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const client = new speech.SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const convertToWebm = (inputPath, outputPath, format = 'webm') => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat(format) // Either 'webm' or 'wav'
            .audioCodec('libopus') // Use libopus codec for webm or pcm_s16le for wav
            .on('end', () => {
                console.log(`Conversion to ${format} successful: ${outputPath}`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error(`Conversion failed: ${err.message}`);
                reject(err);
            })
            .save(outputPath);
    });
};


app.post('/transcribe', upload.single('audio'), async (req, res) => {
    console.log('Received request:', req.body);
    console.log('Uploaded file:', req.file);
    
    if (!req.file || req.file.size === 0) {
        console.error('No file uploaded or file is empty.');
        return res.status(400).send('No file uploaded or file is empty.');
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/${req.file.filename}.webm`;

    try {
        // Convert MP4 to WEBM_OPUS if necessary
        if (req.file.mimetype === 'audio/mp4') {
            console.log('Converting MP4 to WEBM_OPUS...');
            await convertToWebm(inputPath, outputPath);
        }

        // Use the converted WEBM file or original file
        const audioFilePath = req.file.mimetype === 'audio/mp4' ? outputPath : inputPath;
        const audioFile = fs.readFileSync(audioFilePath);
        console.log('Converted file size:', fs.statSync(audioFilePath).size);
        
        const audioBytes = audioFile.toString('base64');
        console.log('Base64 audio length:', audioBytes.length);

        // Prepare the request for Google Speech API
        const request = {
            audio: { content: audioBytes },
            config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
            },
        };

        // Send the audio for transcription
        const [response] = await client.recognize(request);
        console.log('Transcription response:', JSON.stringify(response, null, 2));
        
        // Extract and return the transcription
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        
        res.json({ transcription });
    } catch (error) {
        console.error('Error transcribing audio:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).send(`Error transcribing audio: ${error.message}`);
    } finally {
        // Clean up uploaded and converted files
        try {
            await fs.promises.unlink(inputPath);
            if (fs.existsSync(outputPath)) {
                await fs.promises.unlink(outputPath);
            }
            console.log('Uploaded and converted audio files deleted');
        } catch (err) {
            console.error('Error deleting files:', err.message);
        }
    }
});



app.post('/generateNotes', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        return res.status(400).send('Transcript is required.');
    }

    try {
        const notes = await generateNotes(transcript);
        res.json({ notes });
    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).send('Error generating notes');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
