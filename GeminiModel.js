import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();  // Load environment variables from .env file

/**
 * Class to handle interactions with the Google Generative AI Gemini model.
 */
class GeminiModel {
  /**
   * Constructor initializes the Gemini model with API key.
   * @param {string} GEMINI_API_KEY - The API key for authenticating with the Gemini API.
   */
  constructor(GEMINI_API_KEY) {
    this.apiKey = GEMINI_API_KEY; // Store the API key directly in the class instance
    this.genAI = new GoogleGenerativeAI( process.env.GEMINI_API_KEY );
    this.model = null;
  }

  /**
   * Initializes the Gemini model.
   * Must be called before using `generateContent`.
   * @returns {Promise<void>}
   */
  async initializeModel() {
    try {
      this.model = await this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro'
      });

    } catch (error) {
      console.error('Error initializing Gemini model:', error);
      throw new Error('Failed to initialize the Gemini model.');
    }
  }

  /**
   * Generates content based on a given prompt using the Gemini model.
   * @param {string} prompt - The prompt to send to the model.
   * @returns {Promise<string>} - The generated response from the model.
   */
  async generateContent(prompt) {
    if (!this.model) {
        console.error('Model not initialized. Call initializeModel() first.');
        return 'Model not initialized.';
    }

    try {
        const result = await this.model.generateContent(prompt);
        
        // Call the text() function to get the generated text
        const responseText = await result.response.text();

        return responseText || 'No response generated.';
      } catch (error) {
        console.error('Error interacting with Gemini model:', error);
        return 'There was an error processing your request.';
      }
  }

}

export { GeminiModel };
