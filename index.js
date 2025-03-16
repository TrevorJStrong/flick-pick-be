const express = require('express');
const { OpenAI } = require("openai");
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPEN_AI_PROJECT_ID,
    apiKey: process.env.OPENAI_API_KEY
});

// mongoose connection
mongoose.Promise = global.Promise;
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDB connection established successfully"))
    .catch(err => console.log(err));

// Middleware
app.use(express.json());

// API Route
app.post('/api/generate/nfl-players', async (req, res) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Provide data for 3 current NFL quarterbacks in a JSON array format, with just a name property and nothing else inside the object. Ensure the response is valid JSON that can be parsed by JSON.parse(). Do not include any text outside of the JSON object.' }],
            max_tokens: 250,
        });

        let content = response.choices[0].message.content.trim();

        // Remove Markdown code block markers
        if (content.startsWith('```json')) {
            content = content.substring(7, content.length - 3).trim();
        }

        const players = JSON.parse(content);

        const playerData = await Promise.all(players.map(async (player) => {
            try {
                const searchResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${player.name}`);
                const data = await searchResponse.json();

                if (data.player && data.player[0]) {
                    const playerObj = {
                        name: player.name,
                        team: data.player[0].strTeam,
                        position: data.player[0].strPosition,
                        image_url: data.player[0].strCutout,
                    };
                    return playerObj;
                } else {
                    return { name: player.name, error: "Player not found in sports DB" };
                }
            } catch (error) {
                console.error(error);
                return { name: player.name, error: error.message };
            }
        }));

        res.json(playerData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message }); // Send the error message
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});