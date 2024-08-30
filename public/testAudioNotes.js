const { generateNotes } = require('../src/services/openAIService'); // Adjust the path if necessary
const { processAudioFile } = require('../src/services/audioToNotesService'); // Assuming this function handles transcription
const { organizeNotesByTopic } = require('../src/services/noteOrganizer'); // The file where organizeNotesByTopic is defined
const { transcribeAudio } = require('../src/services/transcriptionService');
/*
const runTest = async (audioFilePath) => {
    console.log("Testing audio-to-notes conversion...");
    
    try {
        console.log("Starting transcription...");
        const transcript = await processAudioFile(audioFilePath);
        console.log("Transcription successful:", transcript);

        console.log("Generating notes from the transcript...");
        const notes = await generateNotes(transcript);
        if (notes) {
            console.log("Notes generation successful:", notes);
            
            // Now we organize the notes by topic
            console.log("Organizing notes by topic...");
            const organizedNotes = organizeNotesByTopic(notes);
            console.log("Organized Notes:", JSON.stringify(organizedNotes, null, 2));
        } else {
            console.error("Note generation failed.");
        }
    } catch (error) {
        console.error("Error processing audio file:", error);
    }
};*/
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


