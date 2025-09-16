import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import api from '../lib/api';

interface ChatMessage {
  message_id: number;
  user_id: number;
  is_user: number;
  content: string;
  created_at: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history from API
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.chat.getChatHistory();
      
      // Filter out messages with API key errors
      const validMessages = data.filter(message => 
        !(message.content.includes("API key not configured") ||
          message.content.includes("Error processing message") ||
          message.content.includes("AI service unavailable"))
      );
      
      setMessages(validMessages);
      
      // If we have messages with errors, show a message
      if (data.length > 0 && data.some(message => 
          message.content.includes("API key not configured") ||
          message.content.includes("Error processing message") ||
          message.content.includes("AI service unavailable")
        )) {
        setError('AI chatbot unavailable: The API key may be invalid or missing. Please contact support.');
      }
    } catch (err: any) {
      console.error('Error fetching chat history:', err);
      if (err.message && err.message.includes("API key")) {
        setError('AI chatbot unavailable: API key configuration issue. Please contact support.');
      } else {
        setError('Failed to load chat history. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Optimistically add user message to UI
      const tempUserMessage: ChatMessage = {
        message_id: Date.now(), // Temporary ID
        user_id: 0, // Will be replaced by actual user_id
        is_user: 1,
        content: newMessage,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      setNewMessage('');
      
      // Send message to API and get AI response
      const response = await api.chat.sendMessage(newMessage);
      
      // Check if the response contains an error message about API key
      if (response.content && (
          response.content.includes("API key not configured") ||
          response.content.includes("Error processing message") ||
          response.content.includes("AI service unavailable")
        )) {
        setError("AI chatbot unavailable: The API key may be invalid or missing. Please contact support.");
        // Remove the error message from the chat
        setMessages(prev => prev.filter(msg => msg.message_id !== response.message_id));
        return;
      }
      
      // Update messages with the AI response
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (err.message && err.message.includes("API key")) {
        setError('AI chatbot unavailable: API key configuration issue. Please contact support.');
      } else {
        setError('Failed to send message. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Budget Assistant</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`p-3 max-w-[80%] ${message.is_user ? 'bg-blue-500 text-white' : 'bg-white'}`}
                  >
                    <div className="mb-1">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="my-1">{line}</p>
                      ))}
                    </div>
                    <div className={`text-xs ${message.is_user ? 'text-blue-100' : 'text-gray-500'} text-right`}>
                      {formatDate(message.created_at)}
                    </div>
                  </Card>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about your budget..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !newMessage.trim()}>
              {loading ? 'Sending...' : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;