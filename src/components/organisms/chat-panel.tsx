'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you with your CRM today?',
    role: 'assistant',
    timestamp: new Date(),
  },
];

export default function ChatPanel({ isOpen, onOpenChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you mentioned "${inputValue}". How can I assist you further with your CRM needs?`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </SheetTitle>
          <SheetDescription>
            Get help with your CRM tasks and questions
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-120px)] mt-6">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="icon"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}