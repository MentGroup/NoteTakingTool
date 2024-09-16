require('dotenv').config();  // Load environment variables from .env file
const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,  // Initialize OpenAI with the API key from environment variables
});

// Function to generate notes from transcript using OpenAI GPT-3.5 Turbo
const generateNotes = async (transcript) => {
    const messages = [
        {
            role: 'system',
            content: 'You are an expert note-taking assistant. Your job is to summarize and organize transcripts into clear, concise notes categorized by topics. Format each topic clearly as "### Topic Name ###" and list the notes below each topic with proper indentation.'
        },
        {
            role: 'user',
            content: `Analyze the following transcript and generate well-organized notes. Ensure each topic is labeled as "### Topic Name ###" and each note is relevant, concise, and indented under the appropriate topic. Keep each note specific and between one to two sentences:\n\n${transcript}`
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500,  // Adjust token limit if necessary
            temperature: 0.6,  // Balance between creativity and accuracy
        });

        console.log("GPT generated response:", response.choices[0].message.content);
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating notes:', error);
        throw error;  // Re-throw for handling in calling function
    }
};


// Function to organize notes by topic
const groupNotesByTopic = (notes) => {
    const organizedNotes = {};
    let currentTopic = null;

    // Split notes by lines and process each line
    notes.split('\n').forEach((note) => {
        note = note.trim();
        if (!note) return; // Skip empty lines

        // Check if the line represents a topic header (### Topic Name ###)
        if (note.startsWith('###') && note.endsWith('###')) {
            currentTopic = note.slice(3, -3).trim(); // Extract topic name
            organizedNotes[currentTopic] = [];
        } 
        // Otherwise, add the note to the current topic
        else if (currentTopic) {
            organizedNotes[currentTopic].push(note);
        }
    });

    return organizedNotes;
};

// Main function to handle the entire transcript-to-notes process
const organizeNotesByTopic = async (transcript) => {
    try {
        // Generate raw notes from the transcript
        const rawNotes = await generateNotes(transcript);
        
        // Organize the generated notes by topics
        const organizedNotes = groupNotesByTopic(rawNotes);
        
        return organizedNotes;  // Return the final organized notes
    } catch (error) {
        console.error('Error organizing notes:', error);
        throw error;
    }
};

// Export the main function
module.exports = { organizeNotesByTopic };
