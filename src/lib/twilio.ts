// Twilio client configuration (will be initialized when needed)
let twilioClient: any = null;

function initializeTwilioClient() {
  if (!twilioClient && typeof window === 'undefined') {
    try {
      const Twilio = require('twilio');
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      twilioClient = new Twilio(accountSid, authToken);
    } catch (error) {
      console.warn('Twilio not available in this environment');
    }
  }
  return twilioClient;
}

export interface CallOptions {
  to: string;
  from?: string;
  url: string; // TwiML URL for call instructions
  statusCallback?: string;
  statusCallbackEvent?: string[];
  record?: boolean;
  recordingChannels?: 'mono' | 'dual';
  recordingStatusCallback?: string;
  timeout?: number;
  maxCallDuration?: number;
}

export interface CallStatus {
  sid: string;
  status: string;
  direction: string;
  from: string;
  to: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  price?: string;
  priceUnit?: string;
}

export class TwilioService {
  private client: any;
  private fromNumber: string;

  constructor() {
    this.client = initializeTwilioClient();
    this.fromNumber = typeof window === 'undefined' ? (process.env.TWILIO_PHONE_NUMBER || '') : '';
  }

  /**
   * Initiate an outbound call
   */
  async initiateCall(options: CallOptions): Promise<string> {
    try {
      const call = await this.client.calls.create({
        to: options.to,
        from: options.from || this.fromNumber,
        url: options.url,
        statusCallback: options.statusCallback,
        statusCallbackEvent: options.statusCallbackEvent || ['initiated', 'answered', 'completed'],
        record: options.record || false,
        recordingChannels: options.recordingChannels || 'mono',
        recordingStatusCallback: options.recordingStatusCallback,
        timeout: options.timeout || 30,
        ...(options.maxCallDuration && { timeLimit: options.maxCallDuration })
      });

      console.log(`Call initiated: ${call.sid} to ${options.to}`);
      return call.sid;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw new Error(`Failed to initiate call: ${error}`);
    }
  }

  /**
   * Get call status and details
   */
  async getCallStatus(callSid: string): Promise<CallStatus> {
    try {
      const call = await this.client.calls(callSid).fetch();
      
      return {
        sid: call.sid,
        status: call.status,
        direction: call.direction,
        from: call.from,
        to: call.to,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: call.duration ? parseInt(call.duration) : undefined,
        price: call.price,
        priceUnit: call.priceUnit
      };
    } catch (error) {
      console.error('Error fetching call status:', error);
      throw new Error(`Failed to get call status: ${error}`);
    }
  }

  /**
   * Update an in-progress call
   */
  async updateCall(callSid: string, options: { url?: string; method?: string; status?: string }): Promise<void> {
    try {
      await this.client.calls(callSid).update(options);
      console.log(`Call updated: ${callSid}`);
    } catch (error) {
      console.error('Error updating call:', error);
      throw new Error(`Failed to update call: ${error}`);
    }
  }

  /**
   * Hang up a call
   */
  async hangupCall(callSid: string): Promise<void> {
    try {
      await this.client.calls(callSid).update({ status: 'completed' });
      console.log(`Call hung up: ${callSid}`);
    } catch (error) {
      console.error('Error hanging up call:', error);
      throw new Error(`Failed to hang up call: ${error}`);
    }
  }

  /**
   * Get call recording
   */
  async getCallRecording(callSid: string): Promise<string | null> {
    try {
      const recordings = await this.client.recordings.list({ callSid });
      
      if (recordings.length > 0) {
        return recordings[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching call recording:', error);
      return null;
    }
  }

  /**
   * Generate TwiML for different call scenarios
   */
  generateTwiML(type: 'greeting' | 'conversation' | 'recording' | 'goodbye', options?: any): string {
    switch (type) {
      case 'greeting':
        return `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="${options?.voice || 'alice'}" language="${options?.language || 'en-US'}">
            ${options?.message || 'Hello, this is an automated call.'}
          </Say>
          <Pause length="1"/>
          <Redirect>${options?.nextUrl || '/api/twilio/conversation'}</Redirect>
        </Response>`;

      case 'conversation':
        return `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Start>
            <Stream url="${options?.streamUrl}" />
          </Start>
          <Say voice="${options?.voice || 'alice'}" language="${options?.language || 'en-US'}">
            ${options?.message || 'Please speak after the tone.'}
          </Say>
          <Record 
            maxLength="${options?.maxLength || 30}"
            playBeep="true"
            recordingStatusCallback="${options?.recordingCallback}"
            transcribe="true"
            transcribeCallback="${options?.transcribeCallback}"
          />
        </Response>`;

      case 'recording':
        return `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Play>${options?.recordingUrl}</Play>
          <Pause length="1"/>
          <Gather 
            numDigits="1" 
            timeout="10"
            action="${options?.gatherUrl || '/api/twilio/gather'}"
          >
            <Say voice="${options?.voice || 'alice'}" language="${options?.language || 'en-US'}">
              Press 1 to speak with an agent, or 9 to opt out of future calls.
            </Say>
          </Gather>
        </Response>`;

      case 'goodbye':
        return `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="${options?.voice || 'alice'}" language="${options?.language || 'en-US'}">
            ${options?.message || 'Thank you for your time. Goodbye.'}
          </Say>
          <Hangup/>
        </Response>`;

      default:
        return `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Invalid request</Say>
          <Hangup/>
        </Response>`;
    }
  }

  /**
   * Validate phone number format for Twilio
   */
  validatePhoneNumber(phoneNumber: string): { valid: boolean; formatted?: string; error?: string } {
    try {
      // Remove all non-digit characters except +
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      
      // Check if it starts with +
      if (!cleaned.startsWith('+')) {
        // Assume US number if no country code
        const formatted = cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`;
        return { valid: true, formatted };
      }
      
      // Basic validation for international format
      if (cleaned.length >= 8 && cleaned.length <= 17) {
        return { valid: true, formatted: cleaned };
      }
      
      return { valid: false, error: 'Invalid phone number format' };
    } catch (error) {
      return { valid: false, error: 'Phone number validation failed' };
    }
  }

  /**
   * Check Twilio account balance and usage
   */
  async getAccountInfo(): Promise<{ balance: string; usage: any }> {
    try {
      if (!this.client) {
        throw new Error('Twilio client not initialized');
      }

      const accountSid = typeof window === 'undefined' ? process.env.TWILIO_ACCOUNT_SID : '';
      const account = await this.client.api.accounts(accountSid).fetch();
      
      // Get usage for current month
      const usage = await this.client.usage.records.list({
        category: 'calls',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
      });

      return {
        balance: account.balance,
        usage: usage.map((record: any) => ({
          category: record.category,
          count: record.count,
          usage: record.usage,
          price: record.price
        }))
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw new Error(`Failed to fetch account info: ${(error as Error).message}`);
    }
  }

  /**
   * Bulk call management
   */
  async initiateBulkCalls(calls: CallOptions[]): Promise<{ successful: string[]; failed: { options: CallOptions; error: string }[] }> {
    const successful: string[] = [];
    const failed: { options: CallOptions; error: string }[] = [];

    // Process calls in batches to avoid rate limiting
    const batchSize = 10;
    
    for (let i = 0; i < calls.length; i += batchSize) {
      const batch = calls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (callOptions) => {
        try {
          const callSid = await this.initiateCall(callOptions);
          successful.push(callSid);
        } catch (error) {
          failed.push({ options: callOptions, error: error.message });
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < calls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { successful, failed };
  }
}

// Export singleton instance
export const twilioService = new TwilioService();

// Helper functions for TwiML generation
export function createTwiMLResponse(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`;
}

export function createSayTwiML(message: string, voice: string = 'alice', language: string = 'en-US'): string {
  return `<Say voice="${voice}" language="${language}">${message}</Say>`;
}

export function createGatherTwiML(options: {
  numDigits?: number;
  timeout?: number;
  action?: string;
  method?: string;
  finishOnKey?: string;
}): string {
  const attrs = Object.entries(options)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  return `<Gather ${attrs}>`;
}

export function createRecordTwiML(options: {
  maxLength?: number;
  timeout?: number;
  playBeep?: boolean;
  recordingStatusCallback?: string;
  transcribe?: boolean;
  transcribeCallback?: string;
}): string {
  const attrs = Object.entries(options)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  return `<Record ${attrs}/>`;
}