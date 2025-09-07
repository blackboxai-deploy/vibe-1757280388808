// OpenAI client configuration and services
let openaiClient: any = null;

function initializeOpenAIClient() {
  if (!openaiClient && typeof window === 'undefined') {
    try {
      const OpenAI = require('openai');
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } catch (error) {
      console.warn('OpenAI not available in this environment');
    }
  }
  return openaiClient;
}

export interface ConversationContext {
  campaignId: string;
  contactName: string;
  contactData: Record<string, any>;
  script?: string;
  personality?: string;
  goals?: string[];
  language: string;
  previousTurns?: ConversationTurn[];
}

export interface ConversationTurn {
  speaker: 'ai' | 'human';
  content: string;
  timestamp: Date;
  confidence?: number;
}

export interface SpeechToTextResult {
  text: string;
  confidence: number;
  duration: number;
  language?: string;
}

export interface TextToSpeechOptions {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  format: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface SentimentAnalysis {
  score: number; // -1 to 1, negative to positive
  magnitude: number; // 0 to 1, how strong the emotion is
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    trust: number;
  };
}

export class OpenAIService {
  private client: any;
  
  constructor() {
    this.client = initializeOpenAIClient();
  }

  /**
   * Convert speech to text using OpenAI Whisper
   */
  async speechToText(audioBuffer: any, options?: { language?: string; prompt?: string }): Promise<SpeechToTextResult> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await this.client.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
        language: options?.language || 'en',
        prompt: options?.prompt,
        response_format: 'verbose_json',
      });

      return {
        text: response.text,
        confidence: response.confidence || 0.95,
        duration: response.duration || 0,
        language: response.language || options?.language || 'en'
      };
    } catch (error) {
      console.error('Error in speech to text:', error);
      throw new Error(`Speech to text failed: ${(error as Error).message}`);
    }
  }

  /**
   * Convert text to speech using OpenAI TTS
   */
  async textToSpeech(text: string, options: TextToSpeechOptions): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await this.client.audio.speech.create({
        model: 'tts-1-hd',
        voice: options.voice,
        input: text,
        response_format: options.format,
        speed: options.speed,
      });

      if (typeof Buffer !== 'undefined') {
        return Buffer.from(await response.arrayBuffer());
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error in text to speech:', error);
      throw new Error(`Text to speech failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate AI conversation response based on context
   */
  async generateResponse(context: ConversationContext, userMessage: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const systemPrompt = this.buildSystemPrompt(context);
      const conversationHistory = this.buildConversationHistory(context, userMessage);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I need to end this call now.';
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error(`AI response generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze the sentiment of the following text and return a JSON response with:
            - score: number between -1 (very negative) and 1 (very positive)
            - magnitude: number between 0 and 1 indicating strength of emotion
            - label: "positive", "neutral", or "negative"
            - confidence: number between 0 and 1
            - emotions: object with joy, anger, fear, sadness, surprise, trust scores (0-1 each)
            
            Respond with only valid JSON, no other text.`
          },
          { role: 'user', content: text }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        score: result.score || 0,
        magnitude: result.magnitude || 0,
        label: result.label || 'neutral',
        confidence: result.confidence || 0.5,
        emotions: {
          joy: result.emotions?.joy || 0,
          anger: result.emotions?.anger || 0,
          fear: result.emotions?.fear || 0,
          sadness: result.emotions?.sadness || 0,
          surprise: result.emotions?.surprise || 0,
          trust: result.emotions?.trust || 0,
        }
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Return neutral sentiment on error
      return {
        score: 0,
        magnitude: 0,
        label: 'neutral',
        confidence: 0,
        emotions: { joy: 0, anger: 0, fear: 0, sadness: 0, surprise: 0, trust: 0 }
      };
    }
  }

  /**
   * Detect conversation intent and extract key information
   */
  async extractIntent(text: string, context: ConversationContext): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    requiresEscalation: boolean;
    suggestedResponse?: string;
  }> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze the user's message for intent and extract key information. Campaign context: ${JSON.stringify(context)}.
            
            Return JSON with:
            - intent: main purpose (question, complaint, interest, opt_out, escalation, etc.)
            - entities: extracted information (dates, names, preferences, etc.)
            - confidence: 0-1 how sure you are
            - requiresEscalation: true if human agent needed
            - suggestedResponse: brief response suggestion if confidence > 0.8
            
            Respond with only valid JSON.`
          },
          { role: 'user', content: text }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        intent: result.intent || 'unknown',
        entities: result.entities || {},
        confidence: result.confidence || 0.5,
        requiresEscalation: result.requiresEscalation || false,
        suggestedResponse: result.suggestedResponse
      };
    } catch (error) {
      console.error('Error extracting intent:', error);
      return {
        intent: 'unknown',
        entities: {},
        confidence: 0,
        requiresEscalation: false
      };
    }
  }

  /**
   * Generate personalized greeting based on contact data
   */
  async generateGreeting(context: ConversationContext): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Generate a natural, personalized phone greeting. 
            Campaign: ${context.script || 'General outreach'}
            Personality: ${context.personality || 'Professional and friendly'}
            Contact: ${context.contactName}
            Contact Data: ${JSON.stringify(context.contactData)}
            Language: ${context.language}
            
            Rules:
            - Keep it under 30 words
            - Sound natural and conversational
            - Use contact's name appropriately
            - Match the personality style
            - Include the main purpose briefly
            - Don't sound robotic or scripted`
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || 
        `Hello ${context.contactName}, this is an automated call regarding ${context.script || 'an important matter'}.`;
    } catch (error) {
      console.error('Error generating greeting:', error);
      return `Hello ${context.contactName}, thank you for taking my call.`;
    }
  }

  /**
   * Check if response requires human escalation
   */
  async shouldEscalate(conversationHistory: ConversationTurn[], context: ConversationContext): Promise<{
    shouldEscalate: boolean;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    try {
      if (!this.client) {
        return { shouldEscalate: false, reason: 'AI not available', urgency: 'low' };
      }

      const conversationText = conversationHistory.map(turn => 
        `${turn.speaker}: ${turn.content}`
      ).join('\n');

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze this conversation to determine if human escalation is needed.
            
            Escalation triggers:
            - Complex complaints or issues
            - Legal or compliance concerns
            - Emotional distress or anger
            - Technical problems beyond AI capability
            - Specific requests for human agent
            - Sensitive personal information needed
            
            Return JSON with:
            - shouldEscalate: boolean
            - reason: specific reason if true
            - urgency: "low", "medium", or "high"`
          },
          { role: 'user', content: conversationText }
        ],
        max_tokens: 150,
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        shouldEscalate: result.shouldEscalate || false,
        reason: result.reason || '',
        urgency: result.urgency || 'low'
      };
    } catch (error) {
      console.error('Error checking escalation:', error);
      return { shouldEscalate: false, reason: 'Error in analysis', urgency: 'low' };
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `You are an AI phone agent making an outbound call. Here's your context:

Contact: ${context.contactName}
Campaign: ${context.script || 'General outreach'}
Personality: ${context.personality || 'Professional and friendly'}
Goals: ${context.goals?.join(', ') || 'Engage and inform'}
Language: ${context.language}

Contact Information: ${JSON.stringify(context.contactData)}

Instructions:
- Keep responses conversational and natural (under 50 words)
- Stay on topic and work toward your goals
- Be respectful of the person's time
- If asked to opt out, immediately acknowledge and end politely
- If complex issues arise, offer to transfer to a human
- Personalize using available contact information
- Match the specified personality and language
- Don't repeat the same phrases
- Sound human, not robotic

Current conversation goal: ${context.goals?.[0] || 'Have a helpful conversation'}`;
  }

  private buildConversationHistory(context: ConversationContext, newMessage: string) {
    const messages: any[] = [];
    
    if (context.previousTurns) {
      context.previousTurns.forEach(turn => {
        messages.push({
          role: turn.speaker === 'ai' ? 'assistant' : 'user',
          content: turn.content
        });
      });
    }
    
    messages.push({ role: 'user', content: newMessage });
    
    return messages;
  }

  /**
   * Get usage statistics for monitoring API limits
   */
  async getUsageStats(): Promise<{
    tokensUsed: number;
    requestsToday: number;
    estimatedCost: number;
  }> {
    // This would typically fetch from OpenAI's usage API or local tracking
    return {
      tokensUsed: 0,
      requestsToday: 0,
      estimatedCost: 0
    };
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();

// Helper functions for common operations
export function calculateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function estimateCost(tokens: number, model: string = 'gpt-4-turbo-preview'): number {
  // Rough cost estimation based on OpenAI pricing
  const costs = {
    'gpt-4-turbo-preview': 0.01 / 1000, // $0.01 per 1k tokens
    'whisper-1': 0.006 / 60, // $0.006 per minute
    'tts-1-hd': 0.03 / 1000 // $0.03 per 1k characters
  };
  
  return tokens * (costs[model] || costs['gpt-4-turbo-preview']);
}