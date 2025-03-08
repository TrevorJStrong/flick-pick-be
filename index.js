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
app.use(express.json()); // to parse JSON request bodies

// API Route
app.post('/api/generate/nfl-players', async (req, res) => {
    try {
        // Get prompt from request body
        const { prompt } = req.body;

        const response = await openai.completions.create({
            body: {
                model: 'gpt-4o-mini',
                prompt: prompt || 'Provide data for 3 current NFL quarterbacks in JSON format, including their name, team, position, recent performance stats, and a short description of their playing style. For each player, include an image URL that is currently accessible and does not result in a 404 error. Prioritize image URLs from official team websites or reputable sports news sources like ESPN or NFL.com. The images should be in JPEG or PNG format and clearly show the players face, suitable for display in a user interface. Please verify that the provided image URLs are currently accessible before including them in the response',
                max_tokens: 200,
            }
        });

        // Validate and process the response data
        const players = validateAndProcessResponse(response.data);

        res.json(players);
    } catch (error) {
        console.error(error);
        // Handle different types of errors with more specific messages
        if (error instanceof SyntaxError) {
            res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
        } else if (error.response && error.response.status === 429) {
            res.status(429).json({ error: 'OpenAI API rate limit exceeded' });
        } else {
            res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    }
});

function validateAndProcessResponse(data) {
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].text) {
        throw new Error('Invalid response structure from OpenAI API');
    }

    try {
        const players = JSON.parse(data.choices[0].text.trim());

        if (!Array.isArray(players)) {
            throw new Error('Expected an array of players from OpenAI API');
        }

        players.forEach((player, index) => {
            // Validate each player object
            if (
                !player.name ||
                !player.team ||
                !player.position ||
                !player.recent_performance_stats ||
                !player.playing_style ||
                !player.image_url
            ) {
                throw new Error(`Player ${index + 1} is missing required fields`);
            }

            // Validate recent_performance_stats
            if (
                !player.recent_performance_stats.games_played ||
                !player.recent_performance_stats.passing_yards ||
                !player.recent_performance_stats.touchdowns ||
                !player.recent_performance_stats.interceptions
            ) {
                throw new Error(`Player ${index + 1} recent_performance_stats are missing required fields`);
            }

            // Validate image_url (basic URL check)
            try {
                new URL(player.image_url);
            } catch (error) {
                throw new Error(`Player ${index + 1} image_url is not a valid URL`);
            }
        });

        return players; // Return the validated players array

    } catch (error) {
        // Re-throw the error for the API route to handle
        throw error;
    }
};

app.get('/api/test', (req, res) => {
    res.send('API test successful!');
  });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});