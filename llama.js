async function interactWithLlama3(prompt) {
    console.log(`Sending prompt to Llama model: ${prompt}`);
    try {
      const response = await ollama.chat({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
      });
      console.log('Response received:', response);
      if (response.message) {
        console.log(response.message.content);
      } else {
        console.log('No message found in the response.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }