require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY, 
});

// Function to generate structured notes from transcript using OpenAI GPT-3.5 Turbo
const generateStructuredNotes = async (transcript) => {
    const messages = [
        {
            role: 'system',
            content: `You are an expert note-taking assistant. Your job is to analyze the provided transcript and organize it into three sections:
            
            1. **"Main Topics of Discussion"**: Summarize the key themes or areas discussed. Focus on capturing broad categories or important topics mentioned.
            2. **"Key Takeaways"**: Summarize the most important conclusions or insights. Highlight the key points or messages that should be remembered.
            3. **"Next Steps/To Do's"**: Infer actionable tasks or steps based on the discussion. Focus on suggestions for what can be done next.

            Each section should contain concise but insightful points, varying from a few words to two sentences. Ensure that each note is relevant and significant to the overall transcript.

            **Instructions**:
            - Do not include any dashes or unnecessary symbols, as each point should already be in bullet point format.
            - Ensure the points are clear and actionable where possible.
            - If a section doesn't have any content, return "None" for that section.

            Format the response using the following template:

            **Main Topics of Discussion:**
            - [Main topic 1]
            - [Main topic 2]
            ...

            **Key Takeaways:**
            - [Key takeaway 1]
            - [Key takeaway 2]
            ...

            **Next Steps/To Do's:**
            - [Next step 1]
            - [Next step 2]
            ...

            Ensure the response adheres strictly to this format. Keep the notes concise and relevant, and ensure each section has at least one point or "None" if no content is found.`
        },
        {
            role: 'user',
            content: `Here is the transcript: \n\n${transcript}`
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 600,
            temperature: 0.6,
        });

        // Extract the response content (raw string)
        const rawResponse = response.choices[0].message.content.trim();
        console.log("Raw GPT Response:", rawResponse);

        // Now parse the response into structured notes (splitting by section headings)
        const structuredNotes = parseStructuredNotes(rawResponse);

        return structuredNotes;  // Return structured notes as an object with arrays
    } catch (error) {
        console.error('Error generating structured notes:', error);
        throw error;
    }
};

// Helper function to parse the structured notes
const parseStructuredNotes = (rawResponse) => {
    const sections = {
        'Main Topics of Discussion': [],
        'Key Takeaways': [],
        'Next Steps/To Do\'s': []
    };

    // Split the response into lines
    const lines = rawResponse.split('\n');

    let currentSection = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Check for the section headers
        if (trimmedLine.startsWith('**Main Topics of Discussion')) {
            currentSection = 'Main Topics of Discussion';
        } else if (trimmedLine.startsWith('**Key Takeaways')) {
            currentSection = 'Key Takeaways';
        } else if (trimmedLine.startsWith('**Next Steps/To Do\'s')) {
            currentSection = 'Next Steps/To Do\'s';
        } 
        // Add bullet points to the appropriate section, but remove leading '-' if present
        else if (trimmedLine.startsWith('-') && currentSection) {
            const cleanedLine = trimmedLine.replace(/^-+\s*/, ''); // Remove leading '-' and extra spaces
            sections[currentSection].push(cleanedLine); // Push the cleaned bullet point
        }
    });

    return sections;  // Return the structured notes
};


module.exports = { generateStructuredNotes };
