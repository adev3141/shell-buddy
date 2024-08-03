import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Class to handle interactions with the Google Generative AI Gemini model.
 */
class GeminiModel {
  /**
   * Constructor initializes the Gemini model with API key.
   * @param {string} GOOGLE_GEMINI_API_KEY - The API key for authenticating with the Gemini API.
   */
  constructor(GOOGLE_GEMINI_API_KEY) {
    this.genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
  }

  /**
   * Initializes the Gemini model.
   * @returns {void}
   */
  async initializeModel() {
    this.model = await this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: [{ codeExecution: {} }],
    });
  }

  /**
   * Generates content based on a given prompt using the Gemini model.
   * @param {string} prompt - The prompt to send to the model.
   * @returns {Promise<string>} - The generated response from the model.
   */
  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent({ prompt });
      return result.text; // Assuming result.text contains the text response
    } catch (error) {
      console.error('Error interacting with Gemini model:', error);
      return 'There was an error processing your request.';
    }
  }
}

export { GeminiModel };
