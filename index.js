const express = require('express');
const { OpenAI } = require("openai");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPEN_AI_PROJECT_ID,
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json());

// API Route
app.post('/api/generate/nfl-players', async (req, res) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Provide data for 3 current NFL quarterbacks in JSON format, including their name, team, position. For each player, include an image URL that is currently accessible and does not result in a 404 error. Prioritize image URLs from official team websites or reputable sports news sources like ESPN or NFL.com. The images should be in JPEG or PNG format and clearly show the player\'s face, suitable for display in a user interface. Please verify that the provided image URLs are currently accessible before including them in the response. Ensure the response is valid JSON that can be parsed by `JSON.parse()`. Do not include any text outside of the JSON object.' }],
            max_tokens: 250,
        });

        console.log(response);

        let content = response.choices[0].message.content.trim(); // Trim whitespace
        console.log("OpenAI Response:", content); // Log the response

        // Remove Markdown code block markers
        if (content.startsWith('```json')) {
            content = content.substring(7, content.length - 3).trim();
        }

        const players = JSON.parse(content);

        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message }); // Send the error message
    }
});

app.get('/api/test', (req, res) => {
    res.send('API test successful!');
  });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});