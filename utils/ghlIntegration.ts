interface GHLContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customField?: Record<string, any>;
  tags?: string[];
  notes?: string;
}

interface GHLOpportunity {
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  monetaryValue?: number;
  customFields?: Record<string, any>;
  notes?: string;
}

export class GHLIntegration {
  private apiKey: string;
  private locationId: string;
  private pipelineId: string;
  private stageId: string;
  private baseUrl = 'https://rest.gohighlevel.com/v1';

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.locationId = process.env.GHL_LOCATION_ID || '';
    this.pipelineId = process.env.GHL_PIPELINE_ID || '';
    this.stageId = process.env.GHL_STAGE_ID || '';

    if (!this.apiKey || !this.locationId) {
      console.warn('GHL integration not properly configured');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createContact(contactData: GHLContact): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...contactData,
          locationId: this.locationId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to create GHL contact:', error);
        return null;
      }

      const data = await response.json();
      return data.contact?.id || null;
    } catch (error) {
      console.error('Error creating GHL contact:', error);
      return null;
    }
  }

  async createOpportunity(opportunityData: GHLOpportunity): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/pipelines/opportunities/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...opportunityData,
          locationId: this.locationId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to create GHL opportunity:', error);
        return null;
      }

      const data = await response.json();
      return data.opportunity?.id || null;
    } catch (error) {
      console.error('Error creating GHL opportunity:', error);
      return null;
    }
  }

  async addNoteToContact(contactId: string, note: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          body: note,
          userId: this.locationId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding note to contact:', error);
      return false;
    }
  }

  async submitBusinessLead(formData: any): Promise<boolean> {
    try {
      // Create formatted notes with all form data
      const formNotes = `Business Seller Lead - Form Submission Details:
      
Business Type: ${formData.businessType}
Annual Revenue: ${formData.annualRevenue}
Reason for Selling: ${formData.reasonForSelling}
Timeline: ${formData.timeline}
      
Submitted: ${new Date().toLocaleString()}
Lead ID: ${formData.leadId}
Source: Business Acquisition Landing Page (/sell-your-business)`;

      // Create contact first
      const contactId = await this.createContact({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        customField: {
          businessType: formData.businessType,
          annualRevenue: formData.annualRevenue,
          reasonForSelling: formData.reasonForSelling,
          timeline: formData.timeline,
          leadId: formData.leadId,
        },
        tags: ['business-sellers', 'business-acquisition', 'web-lead', formData.reasonForSelling.toLowerCase().replace(/\s+/g, '-')],
        notes: formNotes,
      });

      if (!contactId) {
        throw new Error('Failed to create contact in GHL');
      }

      // Create opportunity
      const opportunityName = `${formData.firstName} ${formData.lastName} - ${formData.businessType}`;
      const opportunityId = await this.createOpportunity({
        name: opportunityName,
        pipelineId: this.pipelineId,
        pipelineStageId: this.stageId,
        contactId: contactId,
        customFields: {
          businessType: formData.businessType,
          annualRevenue: formData.annualRevenue,
          reasonForSelling: formData.reasonForSelling,
          timeline: formData.timeline,
          submittedAt: new Date().toISOString(),
        },
        notes: `Business Details:\n${formNotes}\n\nNext Steps: Schedule initial consultation call`,
      });

      if (!opportunityId) {
        console.error('Failed to create opportunity, but contact was created');
      }

      return true;
    } catch (error) {
      console.error('Error submitting to GHL:', error);
      return false;
    }
  }
}

export const ghlIntegration = new GHLIntegration();