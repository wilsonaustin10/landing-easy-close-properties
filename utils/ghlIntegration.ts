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

function getGHLConfig() {
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || '',
    pipelineId: process.env.GHL_PIPELINE_ID || '',
    stageId: process.env.GHL_STAGE_ID || '',
  };
}

export class GHLIntegration {
  private baseUrl = 'https://services.leadconnectorhq.com';

  private getConfig() {
    const config = getGHLConfig();
    if (!config.apiKey || !config.locationId) {
      console.error('GHL integration not properly configured:', {
        hasApiKey: !!config.apiKey,
        hasLocationId: !!config.locationId,
      });
    }
    return config;
  }

  private getHeaders() {
    const { apiKey } = this.getConfig();
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };
  }

  async createContact(contactData: GHLContact): Promise<string | null> {
    const { locationId } = this.getConfig();
    const payload = {
      ...contactData,
      locationId,
    };

    console.log('GHL createContact request:', {
      url: `${this.baseUrl}/contacts/`,
      locationId,
      hasApiKey: !!this.getConfig().apiKey,
      contactEmail: contactData.email,
    });

    try {
      const response = await fetch(`${this.baseUrl}/contacts/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('GHL createContact response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });

      if (!response.ok) {
        console.error('Failed to create GHL contact:', responseText);
        return null;
      }

      const data = JSON.parse(responseText);
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
    const { locationId } = this.getConfig();
    try {
      const response = await fetch(`${this.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...opportunityData,
          locationId,
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
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to add GHL note:', error);
      }

      return response.ok;
    } catch (error) {
      console.error('Error adding note to contact:', error);
      return false;
    }
  }

  async submitPropertyLead(formData: any): Promise<boolean> {
    try {
      console.log('GHL submitPropertyLead called for:', formData.email);

      const contactId = await this.createContact({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address1: formData.address,
        tags: ['Easy-Close-Properties', 'property-seller', 'web-lead', formData.timeframe?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
        source: 'Property Landing Page',
      });

      if (!contactId) {
        throw new Error('Failed to create contact in GHL');
      }

      console.log('GHL contact created:', contactId);

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
      const { pipelineId, stageId } = this.getConfig();
      if (pipelineId && stageId) {
        const opportunityName = `${formData.firstName} ${formData.lastName} - ${formData.address}`;
        const opportunityId = await this.createOpportunity({
          name: opportunityName,
          pipelineId,
          pipelineStageId: stageId,
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
      console.log('GHL submitBusinessLead called for:', formData.email);

      const contactId = await this.createContact({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        tags: ['Easy-Close-Properties', 'business-seller', 'business-acquisition', 'web-lead', formData.reasonForSelling?.toLowerCase().replace(/\s+/g, '-')].filter(Boolean),
        source: 'Business Acquisition Landing Page',
      });

      if (!contactId) {
        throw new Error('Failed to create contact in GHL');
      }

      console.log('GHL contact created:', contactId);

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
      const { pipelineId, stageId } = this.getConfig();
      if (pipelineId && stageId) {
        const opportunityName = `${formData.firstName} ${formData.lastName} - ${formData.businessType}`;
        const opportunityId = await this.createOpportunity({
          name: opportunityName,
          pipelineId,
          pipelineStageId: stageId,
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
