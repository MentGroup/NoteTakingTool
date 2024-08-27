console.log("OpenAI API Key:", process.env.REACT_APP_OPENAI_API_KEY);

const { processAudioFile } = require('../src/services/audioToNotesService');

const testAudioFilePath = '/Users/ayushbhanot/Documents/Coding/TestAudio.wav'; // Audio test file path

const runTest = async () => {
    console.log('Testing audio-to-notes conversion...');
    const notes = await processAudioFile(testAudioFilePath);

    if (notes) {
        console.log('Generated Notes:', notes);
    } else {
        console.log('Failed to generate notes.');
    }
};

runTest();

//Test Terminal Command: node /Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/aitranscriptionapp/public/testAudioNotes.js /Users/ayushbhanot/Documents/Coding/TestAudio.wav

