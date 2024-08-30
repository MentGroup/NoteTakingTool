const { generateNotes } = require('../src/services/openAIService'); // Adjust the path if necessary
const { processAudioFile } = require('../src/services/audioToNotesService'); // Assuming this function handles transcription
const { organizeNotesByTopic } = require('../src/services/noteOrganizer'); // The file where organizeNotesByTopic is defined
const { transcribeAudio } = require('../src/services/transcriptionService');

async function runTest(audioFilePath) {
    try {
        const transcript = await transcribeAudio(audioFilePath);
        const notes = await generateNotes(transcript);
        const organizedNotes = organizeNotesByTopic(notes);  // Ensure this is called after defining the function
        console.log('Organized Notes:', organizedNotes);
    } catch (error) {
        console.error('Error processing audio file:', error);
    }
}



// Replace with the actual path to your audio file
const audioFilePath = '/Users/ayushbhanot/Documents/Coding/TestAudio.wav';
runTest(audioFilePath);


//Test Terminal Command: node /Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/aitranscriptionapp/public/testAudioNotes.js /Users/ayushbhanot/Documents/Coding/TestAudio.wav


