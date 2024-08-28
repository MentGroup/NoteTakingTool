/*require('dotenv').config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,  // Initialize OpenAI with the API key from environment variables
});
//Import OpenAI Library so we can organize notes

const identifyKeyTopics = async (transcript) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are an assistant that identifies key topics from transcripts." },
            { role: "user", content: `List the key topics discussed in the following transcript:\n\n${transcript}` }
            //Asks GPT-3 to list key topics
        ],
        max_tokens: 100,
    });
    const topics = response.choices[0].message.content.trim().split('\n');
    return topics;
    //Returns list of topics as array
};
//This function sends the transcript to GPT-3 and identifies key topics]]]]9j0jujuuyyugyui8]-m56780 b3

const groupNotesByTopic = (notes, topics) => {
    const organizedNotes = {};

    topics.forEach(topic => {
        organizedNotes[topic] = notes.filter(note => note.includes(topic));
    });
    //Iterates over the notes and groups the notes that mention their specefic topic

    return organizedNotes;
};
//This function organizes the generated notes to the key topics

const storeOrganizedNotes = (organizedNotes) => {
    const organizedNotesJSON = JSON.stringify(organizedNotes, null, 2);
    console.log("Organized Notes JSON:", organizedNotesJSON);
    //Save the JSON to a file or database here.
};
//Converts organized notes into a JSON format for easy storage and/or further processing

const organizeNotesByTopic = async (transcript) => {
    const topics = await identifyKeyTopics(transcript);
    const notes = await generateNotes(transcript);
    const organizedNotes = groupNotesByTopic(notes.split('\n'), topics);
    storeOrganizedNotes(organizedNotes);
    return organizedNotes;
};
//This function acts as the workflow by all the other functions

module.exports = { organizeNotesByTopic };*/
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

const groupNotesByTopic = (notes, topics) => {
    const organizedNotes = {};

    topics.forEach(topic => {
        organizedNotes[topic] = notes.filter(note => {
            const normalizedNote = note.toLowerCase();
            const normalizedTopic = topic.toLowerCase().replace(/[^a-zA-Z0-9]/g, ' ').trim(); 
            return normalizedNote.includes(normalizedTopic);
        });
    });
    // Iterates over the notes and groups the notes that mention their specific topic

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
