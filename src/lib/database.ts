import { Campaign, Call, CallEvent, ConversationTurn } from '@/types/campaign';
import { Contact, ContactList } from '@/types/contact';
import { AnalyticsMetrics } from '@/types/analytics';

// In-memory database simulation for hackathon/demo purposes
// In production, this would be replaced with a real database like PostgreSQL, MongoDB, etc.

class InMemoryDatabase {
  private campaigns: Map<string, Campaign> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private contactLists: Map<string, ContactList> = new Map();
  private calls: Map<string, Call> = new Map();
  private callEvents: Map<string, CallEvent[]> = new Map();
  private conversationTurns: Map<string, ConversationTurn[]> = new Map();

  // Campaign Operations
  async createCampaign(campaign: Campaign): Promise<Campaign> {
    this.campaigns.set(campaign.id, { ...campaign, createdAt: new Date(), updatedAt: new Date() });
    return this.campaigns.get(campaign.id)!;
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return this.campaigns.get(id) || null;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return null;
    
    const updated = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Contact Operations
  async createContact(contact: Contact): Promise<Contact> {
    this.contacts.set(contact.id, { ...contact, createdAt: new Date(), updatedAt: new Date() });
    return this.contacts.get(contact.id)!;
  }

  async getContact(id: string): Promise<Contact | null> {
    return this.contacts.get(id) || null;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContactsByPhoneNumbers(phoneNumbers: string[]): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => 
      phoneNumbers.includes(contact.phoneNumber)
    );
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const contact = this.contacts.get(id);
    if (!contact) return null;
    
    const updated = { ...contact, ...updates, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async bulkCreateContacts(contacts: Contact[]): Promise<Contact[]> {
    const created: Contact[] = [];
    for (const contact of contacts) {
      const newContact = await this.createContact(contact);
      created.push(newContact);
    }
    return created;
  }

  // Contact List Operations
  async createContactList(contactList: ContactList): Promise<ContactList> {
    this.contactLists.set(contactList.id, { ...contactList, createdAt: new Date(), updatedAt: new Date() });
    return this.contactLists.get(contactList.id)!;
  }

  async getContactList(id: string): Promise<ContactList | null> {
    return this.contactLists.get(id) || null;
  }

  async getAllContactLists(): Promise<ContactList[]> {
    return Array.from(this.contactLists.values());
  }

  // Call Operations
  async createCall(call: Call): Promise<Call> {
    this.calls.set(call.id, call);
    return call;
  }

  async getCall(id: string): Promise<Call | null> {
    return this.calls.get(id) || null;
  }

  async getCallsByCampaign(campaignId: string): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(call => call.campaignId === campaignId);
  }

  async updateCall(id: string, updates: Partial<Call>): Promise<Call | null> {
    const call = this.calls.get(id);
    if (!call) return null;
    
    const updated = { ...call, ...updates };
    this.calls.set(id, updated);
    return updated;
  }

  async getActiveCalls(): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(call => 
      call.status === 'dialing' || call.status === 'in-progress'
    );
  }

  async getQueuedCalls(): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(call => call.status === 'queued');
  }

  // Call Events
  async addCallEvent(callId: string, event: CallEvent): Promise<void> {
    if (!this.callEvents.has(callId)) {
      this.callEvents.set(callId, []);
    }
    this.callEvents.get(callId)!.push(event);
  }

  async getCallEvents(callId: string): Promise<CallEvent[]> {
    return this.callEvents.get(callId) || [];
  }

  // Conversation Turns
  async addConversationTurn(callId: string, turn: ConversationTurn): Promise<void> {
    if (!this.conversationTurns.has(callId)) {
      this.conversationTurns.set(callId, []);
    }
    this.conversationTurns.get(callId)!.push(turn);
  }

  async getConversationTurns(callId: string): Promise<ConversationTurn[]> {
    return this.conversationTurns.get(callId) || [];
  }

  // Analytics Operations
  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    const campaigns = Array.from(this.campaigns.values());
    const calls = Array.from(this.calls.values());
    const contacts = Array.from(this.contacts.values());

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const completedCalls = calls.filter(c => c.status === 'completed');
    const totalCallMinutes = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / 60;
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const callsToday = calls.filter(c => c.startedAt && c.startedAt >= startOfDay).length;

    const sentimentScores = calls.filter(c => c.sentimentScore !== undefined).map(c => c.sentimentScore!);
    const avgSentiment = sentimentScores.length > 0 ? 
      sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalCalls: calls.length,
      totalContacts: contacts.length,
      overallSuccessRate: calls.length > 0 ? (completedCalls.length / calls.length) * 100 : 0,
      averageCallDuration: completedCalls.length > 0 ? 
        completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / completedCalls.length : 0,
      averageSentimentScore: avgSentiment,
      totalCallMinutes,
      callsToday,
      callsThisWeek: calls.filter(c => {
        if (!c.startedAt) return false;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return c.startedAt >= weekAgo;
      }).length,
      callsThisMonth: calls.filter(c => {
        if (!c.startedAt) return false;
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return c.startedAt >= monthAgo;
      }).length,
      callStatusDistribution: {
        completed: calls.filter(c => c.status === 'completed').length,
        inProgress: calls.filter(c => c.status === 'in-progress').length,
        failed: calls.filter(c => c.status === 'failed').length,
        noAnswer: calls.filter(c => c.status === 'no-answer').length,
        busy: calls.filter(c => c.status === 'busy').length,
        optedOut: calls.filter(c => c.status === 'opted-out').length,
      },
      sentimentDistribution: {
        positive: calls.filter(c => c.sentimentLabel === 'positive').length,
        neutral: calls.filter(c => c.sentimentLabel === 'neutral').length,
        negative: calls.filter(c => c.sentimentLabel === 'negative').length,
      }
    };
  }

  // Utility methods for demo data
  async seedDemoData(): Promise<void> {
    // This will be used to create sample campaigns, contacts, and calls for demo purposes
    console.log('Seeding demo data...');
  }

  // Clear all data (useful for testing)
  async clearAllData(): Promise<void> {
    this.campaigns.clear();
    this.contacts.clear();
    this.contactLists.clear();
    this.calls.clear();
    this.callEvents.clear();
    this.conversationTurns.clear();
  }
}

// Singleton instance
export const db = new InMemoryDatabase();

// Utility functions for common operations
export async function generateId(): Promise<string> {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export async function validatePhoneNumber(phoneNumber: string): Promise<boolean> {
  // Basic phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)\.]/g, ''));
}

export async function formatPhoneNumber(phoneNumber: string): Promise<string> {
  // Basic phone number formatting
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+1${cleaned}`;
  return `+${cleaned}`;
}