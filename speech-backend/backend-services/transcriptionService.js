const speech = require('@google-cloud/speech');
// Import statements

const client = new speech.SpeechClient({
    keyFilename: process.env.REACT_APP_GOOGLE_APPLICATION_CREDENTIALS, //Using environment variable
});
// Creating client variable to interact with Google Speech-to-Text API

const transcribeAudioBlob = async (audioBlob) => {
    // Convert the blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];

            const request = {
                audio: { content: base64Audio },
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
                resolve(transcription);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};
// This function sends a request to Google Speech-to-Text to transcribe audio

module.exports = {
    transcribeAudioBlob
};
