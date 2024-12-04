'use client';

import { Button } from '@/components/ui/button';
import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

const fallbackSuggestions = [
  "What's your favorite memory from childhood?",
  "If you could travel anywhere in the world, where would you go?",
  "What’s a book or movie that changed your perspective on life?",
];

const PublicProfilePage = () => {
  const { username } = useParams();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    try {
      setIsFetching(true);

      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptOverride: `Generate a completely new set of three engaging, open-ended questions. Separate each question with '||'. Ensure they are different from previous suggestions. Do not give any additional text, just the 3 questions, Do not number them in the beginning as well`,
        }),
      });

      const data = await res.json();
      console.log('API Response:', data);

      const newSuggestions =
        data.suggestions?.split('||').map((item: string) => item.trim()).filter(Boolean) || [];
      console.log('Parsed suggestions:', newSuggestions);

      if (newSuggestions.length === 0) {
        console.warn('No valid suggestions. Using fallback.');
        setSuggestions(fallbackSuggestions);
      } else {
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      alert('Failed to fetch suggestions. Showing fallback ones if available.');
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) {
      alert('Message cannot be empty');
      return;
    }

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, content: message }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse('Message sent successfully!');
        setMessage('');
      } else {
        setResponse(data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('An unexpected error occurred.');
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Public Profile</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Send a message to @{username || 'user'}</h2>
        <div className="flex flex-col items-start">
          <input
            type="text"
            className="w-full p-2 mb-2 border border-black rounded"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={sendMessage} className="mb-2">
            Send It
          </Button>
          <Button onClick={fetchSuggestions} variant="outline" disabled={isFetching}>
            {isFetching ? 'Loading...' : 'Suggest Messages'}
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded-md shadow-md">
          <h3 className="text-xl font-bold mb-4">Suggestions:</h3>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white shadow rounded p-3 cursor-pointer hover:bg-gray-200"
                onClick={() => setMessage(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {response && <p className="mt-4 text-green-600">{response}</p>}
    </div>
  );
};

export default PublicProfilePage;
