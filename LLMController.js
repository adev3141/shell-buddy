require('dotenv').config();
const axios = require('axios');

async function queryOpenAI(query) {
    console.log(`queryOpenAI called with query: "${query}"`);
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: query,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error querying OpenAI:', error);
        return null;
    }
}

function processAIResponse(response) {
    if (!response) {
        console.log("Sorry, I couldn't get a response. Please try again.");
        return;
    }

    // Example of making the response more user-friendly
    console.log(`AI Response: \n${response}\n`);
    console.log("Remember, AI responses are suggestions and should be used with caution.");
}


module.exports = {
    queryOpenAI, processAIResponse
};
