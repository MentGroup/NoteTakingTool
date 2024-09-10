const { transcribeAudio } = require('./transcriptionService');
const { generateNotes } = require('./openAIService');
//Import necessary functions

const processAudioFile = async (audioFilePath) => {
    try {
        console.log('Starting transcription...');
        const transcript = await transcribeAudio(audioFilePath);
        
        if (!transcript) {
            console.error('Transcription failed.');
            return null;
        }
        console.log('Transcription successful:', transcript);
        // Step 1: Transcribe the audio file

        console.log('Generating notes from the transcript...');
        const notes = await generateNotes(transcript);
        
        if (!notes) {
            console.error('Note generation failed.');
            return null;
        }
        console.log('Notes generation successful:', notes);
        return notes;
        // Step 2: Generate notes from the transcript

    } catch (error) {
        console.error('Error processing audio file:', error);
        return null;
    }
};
// Function to process an audio file and generate notes


// Export the processAudioFile function
module.exports = {
    processAudioFile,
};
