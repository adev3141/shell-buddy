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
    this.genAI = new GoogleGenerativeAI({ apiKey: GOOGLE_GEMINI_API_KEY });
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
        model: 'gemini-1.5-pro',
        tools: [{ codeExecution: {} }],
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
      const result = await this.model.generateContent([{ text: prompt }]);
      return result.text || 'No response generated.';
    } catch (error) {
      console.error('Error interacting with Gemini model:', error);
      return 'There was an error processing your request.';
    }
  }
}

export { GeminiModel };
