export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  
  // Additional Information
  company?: string;
  title?: string;
  timezone?: string;
  preferredLanguage?: string;
  
  // Custom Fields for Personalization
  customFields?: Record<string, any>;
  
  // Call History
  totalCalls: number;
  lastCalled?: Date;
  lastCallStatus?: string;
  optedOut: boolean;
  optOutDate?: Date;
  
  // Metadata
  source: 'upload' | 'manual' | 'api' | 'google-sheets';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  
  // Analysis
  averageSentiment?: number;
  callSuccess?: boolean;
  notes?: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  source: 'csv' | 'excel' | 'google-sheets' | 'manual';
  
  // Google Sheets Integration
  googleSheetsId?: string;
  googleSheetsRange?: string;
  syncEnabled?: boolean;
  lastSyncAt?: Date;
  
  // Statistics
  totalContacts: number;
  validContacts: number;
  invalidContacts: number;
  duplicateContacts: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  uploadedBy?: string;
  
  // Processing Status
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  processingError?: string;
}

export interface ContactImportResult {
  success: boolean;
  totalRows: number;
  validContacts: number;
  invalidContacts: number;
  duplicateContacts: number;
  errors: ContactImportError[];
  contacts: Contact[];
}

export interface ContactImportError {
  row: number;
  field: string;
  value: string;
  error: string;
  type: 'validation' | 'duplicate' | 'format' | 'required';
}

export interface ContactValidation {
  phoneNumber: {
    valid: boolean;
    formatted?: string;
    country?: string;
    type?: 'mobile' | 'landline' | 'voip';
  };
  email: {
    valid: boolean;
    deliverable?: boolean;
  };
  name: {
    valid: boolean;
    formatted?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ContactFilter {
  search?: string;
  tags?: string[];
  source?: string[];
  optedOut?: boolean;
  lastCallStatus?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  customFields?: Record<string, any>;
}

export interface ContactBulkOperation {
  type: 'delete' | 'tag' | 'untag' | 'opt-out' | 'opt-in' | 'update';
  contactIds: string[];
  data?: any;
}

// CSV/Excel column mapping
export interface ColumnMapping {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  title?: string;
  timezone?: string;
  customFields?: Record<string, string>;
}