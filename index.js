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
app.post('/api/generate/movies', async (req, res) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Provide data for 3 movies in a JSON array format, with just a name property and nothing else inside the object. Ensure the response is valid JSON that can be parsed by JSON.parse(). Do not include any text outside of the JSON object.' }],
            max_tokens: 250,
        });

        let content = response.choices[0].message.content.trim();

        // Remove Markdown code block markers
        if (content.startsWith('```json')) {
            content = content.substring(7, content.length - 3).trim();
        }

        const movies = JSON.parse(content);

        const movieData = await Promise.all(movies.map(async (movie) => {
            try {
                const searchResponse = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${movie.name}`);
                const data = await searchResponse.json();

                if (data) {
                    const movieObj = {
                        title: data.Title,
                        year: data.Year,
                        genre: data.Genre,
                        poster: data.Poster,
                    };
                    return movieObj;
                } else {
                    return { name: movie.Title, error: "Movie not found in OMDB" };
                }
            } catch (error) {
                console.error(error);
                return { name: movie.Title, error: error.message };
            }
        }));

        res.json(movieData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message }); // Send the error message
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});