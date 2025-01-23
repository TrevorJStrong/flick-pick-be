const express = require('express');
const { OpenAI } = require("openai");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPEN_AI_PROJECT_ID,
});

// Middleware
app.use(express.json()); // to parse JSON request bodies

// API Route
app.post('/api/generate', async (req, res) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Provide data for 3 current NFL quarterbacks in JSON format, including their name, team, position, recent performance stats (last 3 games), and a short description of their playing style.`, 
            max_tokens: 500, // Adjust as needed
        });

        // Parse the JSON response from OpenAI
        const players = JSON.parse(response.data.choices[0].text.trim()); 

        res.json(players); 
        } catch (error) {
            console.error(error);
            // Handle cases where JSON parsing fails
        if (error instanceof SyntaxError) { 
            res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
        } else {
            res.status(500).json({ error: 'An error occurred' });
        }
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});