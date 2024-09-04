const speech = require('@google-cloud/speech');
const fs = require('fs');
// Import statements

const client = new speech.SpeechClient({
    keyFilename: process.env.REACT_APP_GOOGLE_APPLICATION_CREDENTIALS, //Using environment variable
});
// Creating client variable to interact with Google Speech-to-Text API

const transcribeAudio = async (audioFilePath) => {
    const audio = fs.readFileSync(audioFilePath);
    const audioBytes = audio.toString('base64');

    const request = {
        audio: { content: audioBytes },
        config: {
            encoding: 'LINEAR16',
            languageCode: 'en-US',
        },
        // Prepare request with configured settings for Speech-to-Text
    };

    const [response] = await client.recognize(request);
    // Send request to Google Speech-to-Text and get the transcription
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    // Process the transcription response
    // console.log('Transcription:', transcription);
    return transcription;
};
// This function sends a request to Google Speech-to-Text to transcribe audio

module.exports = {
    transcribeAudio
};
