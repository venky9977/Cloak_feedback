import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

// Pre-defined fallback suggestions
const fallbackSuggestions = [
  "What's your favorite memory from childhood?",
  "If you could travel anywhere in the world, where would you go?",
  "What’s a book or movie that changed your perspective on life?",
];

// In-memory rate limit tracking (basic example)
const rateLimitMap = new Map();

export async function POST(req: NextRequest) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Basic rate-limiting logic
    const lastRequestTime = rateLimitMap.get(clientIP) || 0;
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < 2000) { // 2-second rate limit
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a few seconds before trying again.' },
        { status: 429 }
      );
    }

    rateLimitMap.set(clientIP, now);

    const { promptOverride } = await req.json();
    const prompt =
      promptOverride ||
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '| | '. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started? | | If you could have dinner with any historical figure, who would it be?| | What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. Do not give any additional text, just the 3 questions. Do not number them in the beginning as well";

    // API Request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a creative assistant generating engaging, open-ended questions.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      stream: false, // Disable streaming for debugging
    });

    console.log('OpenAI API Response:', JSON.stringify(response, null, 2));

    const content = response.choices[0]?.message?.content || '';
    if (!content.trim()) {
      console.warn('Empty response from OpenAI. Using fallback suggestions.');
      return NextResponse.json({
        suggestions: fallbackSuggestions.join(' || '),
      });
    }

    return NextResponse.json({ suggestions: content });
  } catch (error: any) {
    console.error('Error in POST function:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: 'OpenAI API quota exceeded or rate limit reached. Showing fallback suggestions.',
          suggestions: fallbackSuggestions.join(' || '),
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Showing fallback suggestions.',
        suggestions: fallbackSuggestions.join(' || '),
      },
      { status: 500 }
    );
  }
}
