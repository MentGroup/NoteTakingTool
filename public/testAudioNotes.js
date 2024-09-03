const { exec } = require('child_process');
const { generateNotes } = require('../src/services/openAIService'); 
const { processAudioFile } = require('../src/services/audioToNotesService'); 
const { organizeNotesByTopic } = require('../src/services/noteOrganizer'); 
const { transcribeAudio } = require('../src/services/transcriptionService');
const fs = require('fs');
const path = require('path');

async function runTest(audioFilePath) {
    try {
        const transcript = await transcribeAudio(audioFilePath);
        console.log('Transcript:', transcript); // Check if transcription is successful

        const notes = await generateNotes(transcript);
        console.log('Generated Notes:', notes); // Check if notes are generated

        const organizedNotes = await organizeNotesByTopic(notes);
        console.log('Organized Notes:', organizedNotes); // Check if organizedNotes is populated

        const outputPath = path.join(__dirname, '../public/notes.json');
        fs.writeFileSync(outputPath, JSON.stringify(organizedNotes, null, 2));
        console.log('Notes saved to:', outputPath);

    } catch (error) {
        console.error('Error processing audio file:', error);
    }
}


// Start the React app
const startReactApp = () => {
    const reactAppPath = path.join(__dirname, '..'); 
    exec('npm start', { cwd: reactAppPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting React app: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`React app stderr: ${stderr}`);
            return;
        }
        console.log(`React app output: ${stdout}`);
    });
};

// Run the test and then start the React app
const audioFilePath = '/Users/ayushbhanot/Documents/Coding/TestAudio.wav';
runTest(audioFilePath);
startReactApp();


//Test Terminal Command: node /Users/ayushbhanot/Documents/Coding/Riipen/AITranscriptionApp/aitranscriptionapp/public/testAudioNotes.js /Users/ayushbhanot/Documents/Coding/TestAudio.wav


