const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chat request received:', { message, userId: req.userId });

    const systemPrompt = `You are a helpful AI assistant for a data visualization dashboard application. You help users with:
- Understanding the dashboard and its features
- Analytics and data visualization
- Data exploration and filtering
- Reports and exports
- Settings and customization
- General navigation and usage

Provide clear, concise, and helpful responses. Be friendly and professional.`;

    console.log('Calling Groq API...');
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        body: errorText
      });
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`);
    }

    const data = await groqResponse.json();
    console.log('Groq API response received');

    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to process your request at the moment. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/chat/history', async (req, res) => {
  try {
    res.json({
      messages: [],
      hasMore: false
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to retrieve chat history.'
    });
  }
});

module.exports = router;