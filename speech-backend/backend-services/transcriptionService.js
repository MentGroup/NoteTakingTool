const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Google Cloud Speech-to-Text client
const client = new speech.SpeechClient({
    keyFilename: process.env.REACT_APP_GOOGLE_APPLICATION_CREDENTIALS,
});

// Function to transcribe audio using Google Cloud Speech-to-Text API
export const transcribeAudio = async (audioFilePath) => {
    const audioBytes = fs.readFileSync(audioFilePath).toString('base64');
    const request = {
        audio: { content: audioBytes },
        config: {
            encoding: 'WEBM_OPUS',
            languageCode: 'en-US',
        },
    };

    try {
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        return transcription;
    } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
    }
};

const convertToWav = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('wav')
            .on('end', () => {
                resolve(outputPath);
            })
            .on('error', (err) => {
                reject(err);
            })
            .save(outputPath);
    });
};

const processAudioFile = async (audioFilePath) => {
    try {
        const outputPath = `${audioFilePath}.wav`;
        await convertToWav(audioFilePath, outputPath);
        const transcript = await transcribeAudio(outputPath);

        fs.unlink(outputPath, (err) => {
            if (err) console.error('Error deleting WAV file:', err);
        });

        return transcript;
    } catch (error) {
        console.error('Error processing audio file:', error);
        return null;
    }
};

module.exports = { processAudioFile };
