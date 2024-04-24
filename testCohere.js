const cohere = require('cohere-ai');
const cohereClient = new cohere.CohereClient('s2MaBd1UGDaenmky8PRCLSBebdbgX5fvqquzbIvp');

async function testCohere() {
  try {
    const response = await cohereClient.generate({
      prompt: "hello",
      maxTokens: 50,
    });
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
  }
}

testCohere();
