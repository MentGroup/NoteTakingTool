require('dotenv').config();  // Load environment variables from .env file

const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,  // Initialize OpenAI with the API key from environment variables
});
// Import OpenAI Library so we can organize notes

const { generateNotes } = require('./openAIService');  // Import the generateNotes function from openAIService.js

const identifyKeyTopics = async (transcript) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are an assistant that identifies key topics from transcripts." },
            { role: "user", content: `List the key topics discussed in the following transcript:\n\n${transcript}` }
            // Asks GPT-3 to list key topics
        ],
        max_tokens: 100,
    });
    const topics = response.choices[0].message.content.trim().split('\n');
    return topics;
    // Returns list of topics as an array
};
// This function sends the transcript to GPT-3 and identifies key topics

const groupNotesByTopic = (notes) => {
    const organizedNotes = {};
    let currentTopic = null;

    notes.forEach(note => { //Loop through each note in the array 
        note = note.trim();

        // Check if the note is a topic header (e.g., "### Topic Name ###")
        if (note.startsWith("###") && note.endsWith("###")) {
            currentTopic = note.slice(3, -3).trim(); // Extract the topic
            organizedNotes[currentTopic] = [];
        } else if (currentTopic) {
            organizedNotes[currentTopic].push(note); // If not a topic, extract and add the note to the current topic
        }
    });

    return organizedNotes;
};
// This function organizes the generated notes into key topics

const storeOrganizedNotes = (organizedNotes) => {
    const organizedNotesJSON = JSON.stringify(organizedNotes, null, 2);
    console.log("Organized Notes JSON:", organizedNotesJSON);
    // Save the JSON to a file or database here.
};
// Converts organized notes into a JSON format for easy storage and/or further processing

const organizeNotesByTopic = async (transcript) => {
    const topics = await identifyKeyTopics(transcript);
    const notes = await generateNotes(transcript);
    const organizedNotes = groupNotesByTopic(notes.split('\n'), topics);
    storeOrganizedNotes(organizedNotes);
    return organizedNotes;
};
// This function acts as the workflow, coordinating all the other functions

module.exports = { organizeNotesByTopic };
// Export the organizeNotesByTopic function for use in other modules
