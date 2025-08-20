import { google } from 'googleapis';
import { LeadFormData } from '@/types';

interface BusinessFormData {
  businessType: string;
  annualRevenue: string;
  reasonForSelling: string;
  timeline: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadId: string;
  submissionType: string;
  timestamp: string;
}

class GoogleSheetsClient {
  private sheets: any;
  private auth: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      // Parse the service account credentials from environment variable
      const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!credentials) {
        console.warn('Google Service Account credentials not configured');
        return;
      }

      const credentialsJson = JSON.parse(credentials);
      
      this.auth = new google.auth.GoogleAuth({
        credentials: credentialsJson,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      this.initialized = false;
    }
  }

  async appendPropertyLead(data: LeadFormData) {
    if (!this.initialized) {
      console.log('Google Sheets client not initialized, skipping property lead submission');
      return false;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;
    
    if (!spreadsheetId) {
      console.log('Property leads Google Sheet ID not configured');
      return false;
    }

    try {
      const timestamp = new Date().toISOString();
      
      // Prepare row data in the order you want columns to appear
      const values = [[
        timestamp,
        data.leadId,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.address,
        data.propertyCondition,
        data.timeframe,
        data.price,
        data.additionalInfo || '',
        data.source || 'Website',
        data.referrer || '',
        data.utmCampaign || '',
        data.utmSource || '',
        data.utmMedium || '',
        data.utmTerm || '',
        data.utmContent || ''
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:R', // Adjust range based on your columns
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      console.log('Successfully appended property lead to Google Sheet:', response.data);
      return true;
    } catch (error) {
      console.error('Error appending property lead to Google Sheet:', error);
      return false;
    }
  }

  async appendBusinessLead(data: BusinessFormData) {
    if (!this.initialized) {
      console.log('Google Sheets client not initialized, skipping business lead submission');
      return false;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_BUSINESS_ID;
    
    if (!spreadsheetId) {
      console.log('Business leads Google Sheet ID not configured');
      return false;
    }

    try {
      const timestamp = new Date().toISOString();
      
      // Prepare row data in the order you want columns to appear
      const values = [[
        timestamp,
        data.leadId,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.businessType,
        data.annualRevenue,
        data.reasonForSelling,
        data.timeline,
        'Website' // source
      ]];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:K', // Adjust range based on your columns
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      console.log('Successfully appended business lead to Google Sheet:', response.data);
      return true;
    } catch (error) {
      console.error('Error appending business lead to Google Sheet:', error);
      return false;
    }
  }

  async createSheetIfNotExists(spreadsheetId: string, sheetName: string = 'Sheet1') {
    if (!this.initialized) return false;

    try {
      // Check if sheet exists
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const sheetExists = spreadsheet.data.sheets?.some(
        (sheet: any) => sheet.properties?.title === sheetName
      );

      if (!sheetExists) {
        // Create new sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            }],
          },
        });
        console.log(`Created new sheet: ${sheetName}`);
      }

      return true;
    } catch (error) {
      console.error('Error checking/creating sheet:', error);
      return false;
    }
  }

  async addHeadersIfEmpty(spreadsheetId: string, headers: string[], range: string = 'Sheet1!A1') {
    if (!this.initialized) return false;

    try {
      // Check if headers exist
      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range,
      });

      if (!result.data.values || result.data.values.length === 0) {
        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        });
        
        // Format headers (bold)
        const sheetId = 0; // Default to first sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat.textFormat.bold',
              },
            }],
          },
        });
        
        console.log('Added headers to sheet');
      }

      return true;
    } catch (error) {
      console.error('Error adding headers:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleSheetsClient = new GoogleSheetsClient();

// Export helper function to initialize sheets with headers
export async function initializeGoogleSheets() {
  const propertySheetId = process.env.GOOGLE_SHEETS_PROPERTY_ID;
  const businessSheetId = process.env.GOOGLE_SHEETS_BUSINESS_ID;

  if (propertySheetId) {
    const propertyHeaders = [
      'Timestamp',
      'Lead ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Address',
      'Property Condition',
      'Timeframe',
      'Price',
      'Additional Info',
      'Source',
      'Referrer',
      'UTM Campaign',
      'UTM Source',
      'UTM Medium',
      'UTM Term',
      'UTM Content'
    ];
    
    await googleSheetsClient.addHeadersIfEmpty(propertySheetId, propertyHeaders, 'Sheet1!A1:R1');
  }

  if (businessSheetId) {
    const businessHeaders = [
      'Timestamp',
      'Lead ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Business Type',
      'Annual Revenue',
      'Reason for Selling',
      'Timeline',
      'Source'
    ];
    
    await googleSheetsClient.addHeadersIfEmpty(businessSheetId, businessHeaders, 'Sheet1!A1:K1');
  }
}