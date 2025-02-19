const express = require('express');
// const { OpenAI } = require("openai");
const { Anthropic } = require("@anthropic-ai/sdk");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// const openai = new OpenAI({
//     organization: process.env.OPENAI_ORG_ID,
//     project: process.env.OPEN_AI_PROJECT_ID,
// });

// Middleware
app.use(express.json()); // to parse JSON request bodies

// API Route
// app.post('/api/generate', async (req, res) => {
//     try {
//         const response = await openai.createCompletion({
//             model: "text-davinci-003",
//             prompt: `Provide data for 3 current NFL quarterbacks in JSON format, including their name, team, position, recent performance stats (last 3 games), and a short description of their playing style.`, 
//             max_tokens: 500, // Adjust as needed
//         });

//         // Parse the JSON response from OpenAI
//         const players = JSON.parse(response.data.choices[0].text.trim()); 

//         res.json(players); 
//         } catch (error) {
//             console.error(error);
//             // Handle cases where JSON parsing fails
//         if (error instanceof SyntaxError) { 
//             res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
//         } else {
//             res.status(500).json({ error: 'An error occurred' });
//         }
//     }
// });

app.get('/', (req, res) => {
    res.send('Hello from the NFL app!'); // Or any other response you want
});

app.post('/api/generate/nfl-players', async (req, res) => {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-", // Or another Claude model
            max_tokens: 1024, // Adjust as needed (likely higher for JSON)
            temperature: 0,      // Set to 0 for more deterministic/JSON-like output
            messages: [
                {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": `Provide data for 3 current NFL quarterbacks in JSON format, including their name, team, position, recent performance stats (last 3 games), and a short description of their playing style.  Please ensure the JSON is valid and parsable.  Here's an example of the structure I'd like:
                    \`\`\`json
                    [
                        {
                        "name": "Patrick Mahomes",
                        "team": "Kansas City Chiefs",
                        "position": "QB",
                        "stats": {
                            "passingYards": 1200, 
                            "touchdowns": 10, 
                            "interceptions": 2 
                        },
                        "description": "A highly mobile quarterback with a strong arm..." 
                        },
                        // ... two more players
                    ]
                    \`\`\`` // Using backticks for clear JSON example in prompt
                    }
                ]}
            ]
        });

        // Attempt to parse the JSON response
        try {
            const players = JSON.parse(response.content[0].text);
            res.json(players); 
        } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            console.error("Raw response from Claude:", response.content[0].text); // Log the raw response for debugging
            return null; // Or throw the error if you want to handle it further up
        }

    } catch (error) {
        console.error("Error calling Anthropic API:", error);
        return null; // Or throw the error
    }
});
  

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});