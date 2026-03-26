interface GHLContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1?: string;
  customFields?: Array<{ id: string; field_value: string }>;
  tags?: string[];
  source?: string;
}

interface GHLNote {
  contactId: string;
  body: string;
}

export class GHLIntegration {
  private apiKey: string;
  private locationId: string;
  private pipelineId: string;
  private stageId: string;
  private baseUrl = 'https://services.leadconnectorhq.com';

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
      'Version': '2021-07-28',
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

  async createOpportunity(opportunityData: {
    name: string;
    pipelineId: string;
    pipelineStageId: string;
    contactId: string;
    monetaryValue?: number;
    notes?: string;
  }): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/opportunities/`, {
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

  async submitPropertyLead(formData: any): Promise<boolean> {
    try {
      const contactId = await this.createContact({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address1: formData.address,
        tags: ['property-seller', 'web-lead', formData.timeframe?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
        source: 'Property Landing Page',
      });

      if (!contactId) {
        throw new Error('Failed to create contact in GHL');
      }

      // Add property details as a note
      const noteBody = `Property Seller Lead - Form Submission Details:

Address: ${formData.address}
Property Condition: ${formData.propertyCondition}
Timeframe: ${formData.timeframe}
Asking Price: ${formData.price}

First Name: ${formData.firstName}
Last Name: ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

Submitted: ${new Date().toLocaleString()}
Lead ID: ${formData.leadId}
Source: Property Landing Page`;

      await this.addNoteToContact(contactId, noteBody);

      // Create opportunity if pipeline is configured
      if (this.pipelineId && this.stageId) {
        const opportunityName = `${formData.firstName} ${formData.lastName} - ${formData.address}`;
        const opportunityId = await this.createOpportunity({
          name: opportunityName,
          pipelineId: this.pipelineId,
          pipelineStageId: this.stageId,
          contactId: contactId,
          notes: noteBody,
        });

        if (!opportunityId) {
          console.error('Failed to create opportunity, but contact was created');
        }
      }

      return true;
    } catch (error) {
      console.error('Error submitting property lead to GHL:', error);
      return false;
    }
  }

  async submitBusinessLead(formData: any): Promise<boolean> {
    try {
      const contactId = await this.createContact({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        tags: ['business-seller', 'business-acquisition', 'web-lead', formData.reasonForSelling?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
        source: 'Business Acquisition Landing Page',
      });

      if (!contactId) {
        throw new Error('Failed to create contact in GHL');
      }

      // Add business details as a note
      const noteBody = `Business Seller Lead - Form Submission Details:

Business Type: ${formData.businessType}
Annual Revenue: ${formData.annualRevenue}
Reason for Selling: ${formData.reasonForSelling}
Timeline: ${formData.timeline}

First Name: ${formData.firstName}
Last Name: ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

Submitted: ${new Date().toLocaleString()}
Lead ID: ${formData.leadId}
Source: Business Acquisition Landing Page (/sell-your-business)`;

      await this.addNoteToContact(contactId, noteBody);

      // Create opportunity if pipeline is configured
      if (this.pipelineId && this.stageId) {
        const opportunityName = `${formData.firstName} ${formData.lastName} - ${formData.businessType}`;
        const opportunityId = await this.createOpportunity({
          name: opportunityName,
          pipelineId: this.pipelineId,
          pipelineStageId: this.stageId,
          contactId: contactId,
          notes: `${noteBody}\n\nNext Steps: Schedule initial consultation call`,
        });

        if (!opportunityId) {
          console.error('Failed to create opportunity, but contact was created');
        }
      }

      return true;
    } catch (error) {
      console.error('Error submitting business lead to GHL:', error);
      return false;
    }
  }
}

export const ghlIntegration = new GHLIntegration();
