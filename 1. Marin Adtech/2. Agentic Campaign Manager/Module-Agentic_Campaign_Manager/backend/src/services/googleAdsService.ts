import { GoogleAdsApi, Customer } from 'google-ads-api';
import { BasePlatformAPI, IPlatformAPI } from './platformApiService';
import { CampaignPlan } from '../types/ai.types';
import { PlatformAPIResponse } from '../types/campaign.types';
import config from '../config/env';
import {
  mockCampaignQueryResults,
  mockAdGroupQueryResults,
  mockKeywordQueryResults,
  mockRSAQueryResults,
  simulateApiDelay,
} from '../mocks/googleAdsApiMocks';

/**
 * Google Ads API Service
 * Implements Google Ads API integration using google-ads-api library
 */
export class GoogleAdsService extends BasePlatformAPI implements IPlatformAPI {
  private client?: GoogleAdsApi;
  private customer?: Customer;
  private customerId?: string;

  constructor(accessToken?: string, customerId?: string) {
    super('Google Ads', accessToken);
    this.customerId = customerId || config.googleAdsCustomerId;
    
    // Initialize Google Ads API client if credentials are available
    if (config.googleAdsClientId && config.googleAdsClientSecret && config.googleAdsDeveloperToken) {
      try {
        this.client = new GoogleAdsApi({
          client_id: config.googleAdsClientId,
          client_secret: config.googleAdsClientSecret,
          developer_token: config.googleAdsDeveloperToken,
        });

        // Initialize customer if refresh token is available
        if (config.googleAdsRefreshToken && this.customerId) {
          this.customer = this.client.Customer({
            customer_id: this.customerId,
            refresh_token: config.googleAdsRefreshToken,
          });
        }
      } catch (error) {
        console.error('[GoogleAdsService] Error initializing Google Ads API client:', error);
        // Continue with mock mode if initialization fails
      }
    }
  }

  /**
   * Create a budget resource in Google Ads
   * @param amount - Budget amount in dollars
   * @param deliveryMethod - Budget delivery method (STANDARD or ACCELERATED)
   * @returns PlatformAPIResponse with budgetId (resource_name)
   */
  async createBudget(
    amount: number,
    deliveryMethod: 'STANDARD' | 'ACCELERATED' = 'STANDARD'
  ): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for createBudget');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          budgetId: `customers/${this.customerId}/campaignBudgets/${Date.now()}`,
          details: {
            amount_micros: amount * 1_000_000,
            delivery_method: deliveryMethod,
          },
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Create budget using Google Ads API mutateResources
      // The google-ads-api library uses mutateResources with { entity, operation, resource } structure
      const budgetOperation = {
        entity: 'campaign_budget',
        operation: 'create',
        resource: {
          name: `Budget ${Date.now()}`,
          amount_micros: amount * 1_000_000, // Convert dollars to micros
          delivery_method: deliveryMethod,
        }
      };

      const budgetResult = await this.customer.mutateResources([budgetOperation]);

      // Extract the created budget from the mutate response
      // The response structure: { mutate_operation_responses: [{ campaign_budget_result: { resource_name: "..." } }] }
      let resourceName = null;
      
      if (budgetResult.mutate_operation_responses && budgetResult.mutate_operation_responses[0]) {
        const response = budgetResult.mutate_operation_responses[0];
        if (response.campaign_budget_result && response.campaign_budget_result.resource_name) {
          resourceName = response.campaign_budget_result.resource_name;
        }
      }
      
      if (!resourceName) {
        console.error('[Google Ads] Budget response structure:', JSON.stringify(budgetResult, null, 2));
        throw new Error(`Budget creation succeeded but did not return a valid resource name. Response: ${JSON.stringify(budgetResult)}`);
      }

      return {
        success: true,
        budgetId: resourceName,
        details: { resource_name: resourceName },
      };
    } catch (error) {
      return this.handleError(error, 'createBudget');
    }
  }

  /**
   * Create a campaign on Google Ads
   * @param campaignPlan - Campaign plan with budget and objective information
   * @param name - Campaign name
   * @param status - Optional campaign status (ENABLED, PAUSED, REMOVED) - defaults to ENABLED
   */
  async createCampaign(
    campaignPlan: CampaignPlan,
    name: string,
    status: 'ENABLED' | 'PAUSED' | 'REMOVED' = 'ENABLED'
  ): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for createCampaign');
        if (!this.accessToken) {
          return {
            success: false,
            error: 'Google Ads access token not found. Please ensure GOOGLE_ADS_ACCESS_TOKEN is set in your environment variables.',
          };
        }

        // Mock API call for MVP
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate mock campaign ID
        const mockCampaignId = `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Get campaign type for Google Ads
        const campaignType = campaignPlan.campaignType?.googleAds || 'SEARCH';

        return {
          success: true,
          campaignId: mockCampaignId,
          details: {
            name,
            objective: campaignPlan.objective,
            campaignType,
            budget: campaignPlan.budget,
            status,
          },
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Step 1: Create budget first
      const budgetAmount = campaignPlan.budget.total || campaignPlan.budget.daily || 0;
      if (budgetAmount <= 0) {
        return {
          success: false,
          error: 'Budget amount must be greater than 0',
        };
      }

      const budgetResponse = await this.createBudget(budgetAmount);
      
      if (!budgetResponse.success || !budgetResponse.budgetId) {
        return {
          success: false,
          error: budgetResponse.error || 'Failed to create budget',
          details: budgetResponse.details,
        };
      }

      // Step 2: Create campaign with budget reference using mutateResources
      const advertisingChannelType = campaignPlan.campaignType?.googleAds || 'SEARCH';
      
      // Helper function to format dates to yyyy-mm-dd
      const formatDate = (dateString: string | undefined): string | undefined => {
        if (!dateString) return undefined;
        // If it's already in yyyy-mm-dd format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // If it's an ISO string, extract just the date part
        if (dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        // Try to parse and format
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch {
          return undefined;
        }
      };
      
      // Build campaign resource with all required fields
      const campaignResource: any = {
        name,
        advertising_channel_type: advertisingChannelType,
        status: status,
        campaign_budget: budgetResponse.budgetId,
        // Add required bidding strategy - use manual_cpc as default
        manual_cpc: {
          enhanced_cpc_enabled: false,
        },
        // Add required field for EU political advertising (must be enum value, not boolean)
        // Options: "CONTAINS_EU_POLITICAL_ADVERTISING", "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING", "UNSPECIFIED"
        contains_eu_political_advertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
        // Add network settings for SEARCH campaigns (required per README example)
        ...(advertisingChannelType === 'SEARCH' && {
          network_settings: {
            target_google_search: true,
            target_search_network: true,
          },
        }),
      };

      // Add optional date fields with proper formatting
      if (campaignPlan.timeline?.startDate) {
        const formattedStartDate = formatDate(campaignPlan.timeline.startDate);
        if (formattedStartDate) {
          campaignResource.start_date = formattedStartDate;
        }
      }
      
      if (campaignPlan.timeline?.endDate) {
        const formattedEndDate = formatDate(campaignPlan.timeline.endDate);
        if (formattedEndDate) {
          campaignResource.end_date = formattedEndDate;
        }
      }

      const campaignOperation = {
        entity: 'campaign',
        operation: 'create',
        resource: campaignResource,
      };
      
      // Log the operation for debugging
      console.log('[Google Ads] Campaign operation:', JSON.stringify(campaignOperation, null, 2));

      const campaignMutateResult = await this.customer.mutateResources([campaignOperation]);

      // Extract the created campaign from the mutate response
      // The response structure: { mutate_operation_responses: [{ campaign_result: { resource_name: "..." } }] }
      let campaignResourceName = null;
      
      if (campaignMutateResult.mutate_operation_responses && campaignMutateResult.mutate_operation_responses[0]) {
        const response = campaignMutateResult.mutate_operation_responses[0];
        if (response.campaign_result && response.campaign_result.resource_name) {
          campaignResourceName = response.campaign_result.resource_name;
        }
      }
      
      if (!campaignResourceName) {
        console.error('[Google Ads] Campaign response structure:', JSON.stringify(campaignMutateResult, null, 2));
        throw new Error('Campaign creation succeeded but did not return a valid resource name');
      }
      
      const campaign = { resource_name: campaignResourceName };

      // Step 3: Create ad groups and keywords if provided in campaignPlan
      const createdAdGroups: string[] = [];
      const createdKeywords: string[] = [];
      
      if (campaignPlan.adGroups && campaignPlan.adGroups.length > 0) {
        for (const adGroupPlan of campaignPlan.adGroups) {
          try {
            // Create ad group using mutateResources
            const adGroupOperation = {
              entity: 'ad_group',
              operation: 'create',
              resource: {
                name: adGroupPlan.name,
                campaign: campaign.resource_name,
                status: 'ENABLED',
                // Set default CPC bid if provided (in micros)
                ...(adGroupPlan.budget && {
                  cpc_bid_micros: Math.round(adGroupPlan.budget * 1_000_000), // Convert to micros
                }),
              }
            };

            console.log(`[Google Ads] Creating ad group "${adGroupPlan.name}" for campaign ${campaign.resource_name}`);
            const adGroupMutateResult = await this.customer.mutateResources([adGroupOperation]);

            // Extract the created ad group from the mutate response
            // The response structure: { mutate_operation_responses: [{ ad_group_result: { resource_name: "..." } }] }
            let adGroupResourceName = null;
            
            if (adGroupMutateResult.mutate_operation_responses && adGroupMutateResult.mutate_operation_responses[0]) {
              const response = adGroupMutateResult.mutate_operation_responses[0];
              if (response.ad_group_result && response.ad_group_result.resource_name) {
                adGroupResourceName = response.ad_group_result.resource_name;
              }
            }
            
            if (!adGroupResourceName) {
              console.error(`[Google Ads] Ad group response structure for "${adGroupPlan.name}":`, JSON.stringify(adGroupMutateResult, null, 2));
              throw new Error(`Ad group creation succeeded but did not return a valid resource name for "${adGroupPlan.name}"`);
            }
            
            const adGroup = { resource_name: adGroupResourceName };
            
            createdAdGroups.push(adGroup.resource_name);
            console.log(`[Google Ads] Successfully created ad group: ${adGroup.resource_name}`);
            
            // Create keywords for this ad group if provided
            const keywords = adGroupPlan.targeting?.keywords || [];
            if (keywords.length > 0) {
              console.log(`[Google Ads] Creating ${keywords.length} keywords for ad group ${adGroup.resource_name}`);
              // Use the createKeywords helper method
              const keywordsResponse = await this.createKeywords(adGroup.resource_name, keywords);
              if (keywordsResponse.success && keywordsResponse.keywords) {
                createdKeywords.push(...keywordsResponse.keywords);
                console.log(`[Google Ads] Successfully created ${keywordsResponse.keywords.length} keywords for ad group ${adGroup.resource_name}`);
              } else {
                console.warn(`[Google Ads] Keyword creation failed for ad group ${adGroup.resource_name}:`, keywordsResponse.error);
              }
            }
          } catch (adGroupError) {
            console.warn(`[GoogleAdsService] Failed to create ad group "${adGroupPlan.name}":`, adGroupError);
            // Continue with other ad groups
          }
        }
      }

      return {
        success: true,
        campaignId: campaign.resource_name,
        adGroupId: createdAdGroups[0], // Return first ad group ID for compatibility
        details: {
          campaign,
          adGroups: createdAdGroups,
          keywords: createdKeywords,
        },
      };
    } catch (error) {
      return this.handleError(error, 'createCampaign');
    }
  }

  /**
   * Create an ad group in Google Ads
   * @param campaignResourceName - Campaign resource name (e.g., "customers/123/campaigns/456")
   * @param name - Ad group name
   * @param cpcBidMicros - Optional CPC bid in micros
   * @returns PlatformAPIResponse with adGroupId
   */
  async createAdGroup(
    campaignResourceName: string,
    name: string,
    cpcBidMicros?: number
  ): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for createAdGroup');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          adGroupId: `${campaignResourceName}/adGroups/${Date.now()}`,
          details: {
            name,
            campaign: campaignResourceName,
            cpc_bid_micros: cpcBidMicros,
          },
          isMock: true,
        };
      }

      const adGroupOperation = {
        entity: 'ad_group',
        operation: 'create',
        resource: {
          name,
          campaign: campaignResourceName,
          status: 'ENABLED',
          ...(cpcBidMicros && {
            cpc_bid_micros: cpcBidMicros,
          }),
        }
      };

      const adGroupMutateResult = await this.customer.mutateResources([adGroupOperation]);

      // Extract the created ad group from the mutate response
      // The response structure: { mutate_operation_responses: [{ ad_group_result: { resource_name: "..." } }] }
      let adGroupResourceName = null;
      
      if (adGroupMutateResult.mutate_operation_responses && adGroupMutateResult.mutate_operation_responses[0]) {
        const response = adGroupMutateResult.mutate_operation_responses[0];
        if (response.ad_group_result && response.ad_group_result.resource_name) {
          adGroupResourceName = response.ad_group_result.resource_name;
        }
      }
      
      if (!adGroupResourceName) {
        console.error('[Google Ads] Ad group response structure:', JSON.stringify(adGroupMutateResult, null, 2));
        throw new Error('Ad group creation succeeded but did not return a valid resource name');
      }
      
      const adGroup = { resource_name: adGroupResourceName };

      return {
        success: true,
        adGroupId: adGroup.resource_name,
        details: adGroup,
      };
    } catch (error) {
      return this.handleError(error, 'createAdGroup');
    }
  }

  /**
   * Create keywords in an ad group
   * @param adGroupResourceName - Ad group resource name
   * @param keywords - Array of keywords (string or {text, matchType})
   * @returns PlatformAPIResponse with keywordIds array
   */
  async createKeywords(
    adGroupResourceName: string,
    keywords: Array<string | { text: string; matchType?: string }>
  ): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for createKeywords');
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockKeywordIds = keywords.map((_, index) => 
          `${adGroupResourceName}/keywords/${Date.now()}-${index}`
        );
        return {
          success: true,
          keywords: mockKeywordIds,
          details: {
            adGroup: adGroupResourceName,
            keywords: keywords.map(k => typeof k === 'string' ? k : k.text),
          },
          isMock: true,
        };
      }

      const createdKeywordIds: string[] = [];
      
      for (const keyword of keywords) {
        try {
          const keywordText = typeof keyword === 'string' ? keyword : keyword.text;
          const matchType = typeof keyword === 'string' ? 'BROAD' : (keyword.matchType?.toUpperCase() || 'BROAD');
          
          // Map match type to Google Ads format
          const googleMatchType = matchType === 'EXACT' ? 'EXACT' :
                                matchType === 'PHRASE' ? 'PHRASE' :
                                'BROAD';
          
          const keywordOperation = {
            entity: 'ad_group_criterion',
            operation: 'create',
            resource: {
              ad_group: adGroupResourceName,
              keyword: {
                text: keywordText,
                match_type: googleMatchType,
              },
              status: 'ENABLED',
            }
          };

          const keywordMutateResult = await this.customer.mutateResources([keywordOperation]);

          // Extract the created keyword from the mutate response
          // The response structure: { mutate_operation_responses: [{ ad_group_criterion_result: { resource_name: "..." } }] }
          let keywordResourceName = null;
          
          if (keywordMutateResult.mutate_operation_responses && keywordMutateResult.mutate_operation_responses[0]) {
            const response = keywordMutateResult.mutate_operation_responses[0];
            if (response.ad_group_criterion_result && response.ad_group_criterion_result.resource_name) {
              keywordResourceName = response.ad_group_criterion_result.resource_name;
            }
          }
          
          if (!keywordResourceName) {
            console.error(`[Google Ads] Keyword response structure for "${keywordText}":`, JSON.stringify(keywordMutateResult, null, 2));
            throw new Error(`Keyword creation succeeded but did not return a valid resource name for "${keywordText}"`);
          }
          
          createdKeywordIds.push(keywordResourceName);
        } catch (keywordError) {
          console.warn(`[GoogleAdsService] Failed to create keyword "${typeof keyword === 'string' ? keyword : keyword.text}":`, keywordError);
          // Continue with other keywords
        }
      }

      return {
        success: true,
        keywords: createdKeywordIds,
        details: {
          adGroup: adGroupResourceName,
          created: createdKeywordIds.length,
          total: keywords.length,
        },
      };
    } catch (error) {
      return this.handleError(error, 'createKeywords');
    }
  }

  /**
   * Update a campaign on Google Ads
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<CampaignPlan>
  ): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for updateCampaign');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          campaignId,
          details: updates,
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Build update object
      const updateData: any = {};
      
      if (updates.name) {
        updateData.name = updates.name;
      }
      
      if (updates.budget) {
        // If budget is being updated, we need to update the campaign budget resource
        // For now, we'll just update the campaign name and other fields
        // Budget updates would require updating the budget resource separately
      }

      // Update campaign using mutateResources
      const campaignOperation = {
        entity: 'campaign',
        operation: 'update',
        resource: {
          resource_name: campaignId,
          ...updateData,
        }
      };

      const campaignMutateResult = await this.customer.mutateResources([campaignOperation]);

      // Extract the updated campaign from the mutate response
      let campaignResourceName = null;
      
      if (campaignMutateResult.mutate_operation_responses && campaignMutateResult.mutate_operation_responses[0]) {
        const response = campaignMutateResult.mutate_operation_responses[0];
        if (response.campaign_result && response.campaign_result.resource_name) {
          campaignResourceName = response.campaign_result.resource_name;
        }
      }
      
      if (!campaignResourceName) {
        // If no resource_name in response, use the original campaignId
        campaignResourceName = campaignId;
      }

      return {
        success: true,
        campaignId: campaignResourceName,
        details: { resource_name: campaignResourceName, ...updateData },
      };
    } catch (error) {
      return this.handleError(error, 'updateCampaign');
    }
  }

  /**
   * Pause a campaign on Google Ads
   */
  async pauseCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for pauseCampaign');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          campaignId,
          details: { status: 'PAUSED' },
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Update campaign status to PAUSED using mutateResources
      console.log(`[Google Ads] Pausing campaign with resource name: ${campaignId}`);
      
      // Ensure campaignId is a string, not an object
      const resourceName = typeof campaignId === 'string' ? campaignId : String(campaignId);
      
      const campaignOperation = {
        entity: 'campaign',
        operation: 'update',
        resource: {
          resource_name: resourceName,
          status: 'PAUSED',
        }
      };

      console.log(`[Google Ads] Pause operation:`, JSON.stringify(campaignOperation, null, 2));
      const campaignMutateResult = await this.customer.mutateResources([campaignOperation]);

      // Extract the updated campaign from the mutate response
      let campaignResourceName = null;
      
      if (campaignMutateResult.mutate_operation_responses && campaignMutateResult.mutate_operation_responses[0]) {
        const response = campaignMutateResult.mutate_operation_responses[0];
        if (response.campaign_result && response.campaign_result.resource_name) {
          campaignResourceName = response.campaign_result.resource_name;
        }
      }
      
      if (!campaignResourceName) {
        campaignResourceName = campaignId;
      }

      return {
        success: true,
        campaignId: campaignResourceName,
        details: { status: 'PAUSED', resource_name: campaignResourceName },
      };
    } catch (error) {
      return this.handleError(error, 'pauseCampaign');
    }
  }

  /**
   * Resume a campaign on Google Ads
   */
  async resumeCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for resumeCampaign');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          campaignId,
          details: { status: 'ENABLED' },
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Update campaign status to ENABLED using mutateResources
      console.log(`[Google Ads] Resuming campaign with resource name: ${campaignId}`);
      
      // Ensure campaignId is a string, not an object
      const resourceName = typeof campaignId === 'string' ? campaignId : String(campaignId);
      
      const campaignOperation = {
        entity: 'campaign',
        operation: 'update',
        resource: {
          resource_name: resourceName,
          status: 'ENABLED',
        }
      };

      console.log(`[Google Ads] Resume operation:`, JSON.stringify(campaignOperation, null, 2));
      const campaignMutateResult = await this.customer.mutateResources([campaignOperation]);

      // Extract the updated campaign from the mutate response
      let campaignResourceName = null;
      
      if (campaignMutateResult.mutate_operation_responses && campaignMutateResult.mutate_operation_responses[0]) {
        const response = campaignMutateResult.mutate_operation_responses[0];
        if (response.campaign_result && response.campaign_result.resource_name) {
          campaignResourceName = response.campaign_result.resource_name;
        }
      }
      
      if (!campaignResourceName) {
        campaignResourceName = campaignId;
      }

      return {
        success: true,
        campaignId: campaignResourceName,
        details: { status: 'ENABLED', resource_name: campaignResourceName },
      };
    } catch (error) {
      return this.handleError(error, 'resumeCampaign');
    }
  }

  /**
   * Delete a campaign on Google Ads
   */
  async deleteCampaign(campaignId: string): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for deleteCampaign');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          campaignId,
          details: { status: 'REMOVED' },
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Delete campaign using 'remove' operation
      // The library expects 'remove' to contain the resource_name string directly
      console.log(`[Google Ads] Deleting campaign with resource name: ${campaignId}`);
      
      // Ensure campaignId is a string, not an object
      const resourceName = typeof campaignId === 'string' ? campaignId : String(campaignId);
      
      // For remove operations, the resource_name should be passed directly to 'remove'
      // Based on error path: mutate_operations[0].campaign_operation.remove expects a string
      const campaignOperation: any = {
        entity: 'campaign',
        operation: 'remove',
        resource: resourceName,  // Just the string, not an object
      };

      console.log(`[Google Ads] Delete operation:`, JSON.stringify(campaignOperation, null, 2));
      const campaignMutateResult = await this.customer.mutateResources([campaignOperation]);

      // Extract the updated campaign from the mutate response
      let campaignResourceName = null;
      
      if (campaignMutateResult.mutate_operation_responses && campaignMutateResult.mutate_operation_responses[0]) {
        const response = campaignMutateResult.mutate_operation_responses[0];
        if (response.campaign_result && response.campaign_result.resource_name) {
          campaignResourceName = response.campaign_result.resource_name;
        }
      }
      
      if (!campaignResourceName) {
        campaignResourceName = campaignId;
      }

      return {
        success: true,
        campaignId: campaignResourceName,
        details: { status: 'REMOVED', resource_name: campaignResourceName },
      };
    } catch (error) {
      return this.handleError(error, 'deleteCampaign');
    }
  }

  /**
   * Get campaign status from Google Ads
   */
  async getCampaignStatus(campaignId: string): Promise<PlatformAPIResponse> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for getCampaignStatus');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          campaignId,
          details: { status: 'ENABLED' },
          isMock: true, // Flag indicating this is mock data
        };
      }

      // Query campaign to get status
      const [campaign] = await this.customer.query(`
        SELECT campaign.id, campaign.name, campaign.status
        FROM campaign
        WHERE campaign.resource_name = '${campaignId}'
      `);

      if (!campaign || !campaign.campaign) {
        return {
          success: false,
          error: 'Campaign not found',
        };
      }

      return {
        success: true,
        campaignId,
        details: {
          status: campaign.campaign.status,
          name: campaign.campaign.name,
        },
      };
    } catch (error) {
      return this.handleError(error, 'getCampaignStatus');
    }
  }

  /**
   * Get detailed campaign information including budget, ad groups, keywords
   */
  async getCampaignDetails(campaignResourceName: string): Promise<any> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for getCampaignDetails');
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          success: true,
          campaign: {
            id: campaignResourceName.split('/').pop(),
            resourceName: campaignResourceName,
            name: 'Mock Campaign',
            status: 'ENABLED',
            advertisingChannelType: 'SEARCH',
            budget: {
              resourceName: 'customers/123/campaignBudgets/456',
              amountMicros: 100000000, // $100
              deliveryMethod: 'STANDARD',
            },
            biddingStrategy: {
              type: 'MANUAL_CPC',
              manualCpc: {
                enhancedCpcEnabled: false,
              },
            },
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: true,
              targetContentNetwork: false,
            },
            adGroups: [],
            keywords: [],
          },
          isMock: true,
        };
      }

      // Query campaign with all available fields
      const campaignQuery = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.resource_name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.campaign_budget,
          campaign.start_date,
          campaign.end_date,
          campaign.network_settings.target_google_search,
          campaign.network_settings.target_search_network,
          campaign.network_settings.target_content_network,
          campaign.manual_cpc.enhanced_cpc_enabled,
          campaign_budget.amount_micros,
          campaign_budget.delivery_method
        FROM campaign
        WHERE campaign.resource_name = '${campaignResourceName}'
      `;

      const [campaignRow] = await this.customer.query(campaignQuery);

      if (!campaignRow || !campaignRow.campaign) {
        return {
          success: false,
          error: 'Campaign not found',
        };
      }

      const campaign = campaignRow.campaign;
      const budget = campaignRow.campaign_budget;

      // Query ad groups for this campaign
      const adGroupsQuery = `
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.resource_name,
          ad_group.status,
          ad_group.cpc_bid_micros,
          ad_group.effective_cpc_bid_micros
        FROM ad_group
        WHERE ad_group.campaign = '${campaignResourceName}'
      `;

      const adGroups = await this.customer.query(adGroupsQuery);

      // Query keywords for all ad groups
      const adGroupResourceNames = adGroups.map((ag: any) => ag.ad_group.resource_name);
      let keywords: any[] = [];

      if (adGroupResourceNames.length > 0) {
        const keywordsQuery = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.resource_name,
            ad_group_criterion.status,
            ad_group_criterion.cpc_bid_micros,
            ad_group_criterion.quality_info.quality_score,
            ad_group_criterion.ad_group
          FROM ad_group_criterion
          WHERE ad_group_criterion.type = 'KEYWORD'
            AND ad_group_criterion.ad_group IN (${adGroupResourceNames.map((name: string) => `'${name}'`).join(', ')})
        `;

        keywords = await this.customer.query(keywordsQuery);
      }

      return {
        success: true,
        campaign: {
          id: campaign.id.toString(),
          resourceName: campaign.resource_name,
          name: campaign.name,
          status: campaign.status,
          advertisingChannelType: campaign.advertising_channel_type,
          budget: {
            resourceName: campaign.campaign_budget,
            amountMicros: budget?.amount_micros || 0,
            amount: budget?.amount_micros ? budget.amount_micros / 1000000 : 0,
            deliveryMethod: budget?.delivery_method || 'STANDARD',
          },
          biddingStrategy: {
            type: campaign.manual_cpc ? 'MANUAL_CPC' : 'UNKNOWN',
            manualCpc: campaign.manual_cpc ? {
              enhancedCpcEnabled: campaign.manual_cpc.enhanced_cpc_enabled || false,
            } : undefined,
          },
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          networkSettings: {
            targetGoogleSearch: campaign.network_settings?.target_google_search || false,
            targetSearchNetwork: campaign.network_settings?.target_search_network || false,
            targetContentNetwork: campaign.network_settings?.target_content_network || false,
          },
          adGroups: adGroups.map((ag: any) => ({
            id: ag.ad_group.id.toString(),
            resourceName: ag.ad_group.resource_name,
            name: ag.ad_group.name,
            status: ag.ad_group.status,
            cpcBidMicros: ag.ad_group.cpc_bid_micros,
            cpcBid: ag.ad_group.cpc_bid_micros ? ag.ad_group.cpc_bid_micros / 1000000 : undefined,
            effectiveCpcBidMicros: ag.ad_group.effective_cpc_bid_micros,
          })),
          keywords: keywords.map((kw: any) => ({
            resourceName: kw.ad_group_criterion.resource_name,
            text: kw.ad_group_criterion.keyword?.text || '',
            matchType: kw.ad_group_criterion.keyword?.match_type || 'BROAD',
            status: kw.ad_group_criterion.status,
            cpcBidMicros: kw.ad_group_criterion.cpc_bid_micros,
            cpcBid: kw.ad_group_criterion.cpc_bid_micros ? kw.ad_group_criterion.cpc_bid_micros / 1000000 : undefined,
            qualityScore: kw.ad_group_criterion.quality_info?.quality_score || undefined,
            adGroupResourceName: kw.ad_group_criterion.ad_group,
          })),
        },
        isMock: false,
      };
    } catch (error) {
      console.error('[GoogleAdsService] Error getting campaign details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    // Check if client and customer are initialized
    if (this.client && this.customer) {
      try {
        // Try a simple query to verify authentication
        await this.customer.query('SELECT customer.id FROM customer LIMIT 1');
        return true;
      } catch (error) {
        console.error('[GoogleAdsService] Authentication check failed:', error);
        return false;
      }
    }
    
    // Fall back to checking if access token exists
    return !!this.accessToken;
  }

  /**
   * Query all campaigns for an account
   */
  async queryCampaigns(
    accountId: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any[]> {
    try {
      // If customer/client not initialized, fall back to mock
      if (!this.customer || !this.client) {
        console.warn('[GoogleAdsService] Client not initialized, using mock response for queryCampaigns');

        // For MVP, return comprehensive mock data
        await simulateApiDelay();

        // Return mock campaign data with full metrics
        return mockCampaignQueryResults.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          resourceName: campaign.resourceName,
          status: campaign.status,
          advertisingChannelType: campaign.advertisingChannelType,
          budget: Math.floor(campaign.metrics.costMicros / 1000000), // Convert micros to dollars
          budgetMicros: campaign.targetSpend?.targetSpendMicros,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          biddingStrategyType: campaign.biddingStrategyType,
          // Include metrics for pattern extraction
          impressions: campaign.metrics.impressions,
          clicks: campaign.metrics.clicks,
          conversions: campaign.metrics.conversions,
          cost: campaign.metrics.costMicros / 1000000, // Convert to dollars
          costMicros: campaign.metrics.costMicros,
          ctr: campaign.metrics.ctr,
          averageCpc: campaign.metrics.averageCpc,
          conversionsValue: campaign.metrics.conversionsValue,
          isMock: true, // Flag indicating this is mock data
        }));
      }

      // Build query - GAQL syntax (no AS aliases, proper field access)
      // For basic campaign list without metrics, we don't need segments.date
      let query = `SELECT 
        campaign.id,
        campaign.name,
        campaign.resource_name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date,
        campaign.campaign_budget
      FROM campaign
      WHERE campaign.status != 'REMOVED'`;

      // If date range is provided, we need to add segments.date and metrics
      if (dateRange) {
        query = `SELECT 
          campaign.id,
          campaign.name,
          campaign.resource_name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          campaign.campaign_budget,
          segments.date,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions_value
        FROM campaign
        WHERE campaign.status != 'REMOVED'
          AND segments.date >= '${dateRange.startDate}'
          AND segments.date <= '${dateRange.endDate}'`;
      }

      // Execute query
      const results = await this.customer.query(query);

      // Map results to expected format
      // Note: campaign.campaign_budget is a resource name (string), not an object
      // To get budget amount, we'd need to query campaign_budget resource separately
      return results.map((row: any) => ({
        id: row.campaign.id.toString(),
        name: row.campaign.name,
        resourceName: row.campaign.resource_name,
        status: row.campaign.status,
        advertisingChannelType: row.campaign.advertising_channel_type,
        budget: 0, // Budget amount not available in this query - would need separate budget query
        budgetMicros: undefined, // Budget amount not available in this query
        budgetResourceName: row.campaign.campaign_budget, // Store budget resource name for future queries
        startDate: row.campaign.start_date,
        endDate: row.campaign.end_date,
        // Include metrics if available
        ...(dateRange && {
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          conversions: row.metrics?.conversions || 0,
          cost: row.metrics?.cost_micros ? row.metrics.cost_micros / 1000000 : 0,
          costMicros: row.metrics?.cost_micros || 0,
          ctr: row.metrics?.ctr || 0,
          averageCpc: row.metrics?.average_cpc || 0,
          conversionsValue: row.metrics?.conversions_value || 0,
        }),
      }));
    } catch (error) {
      console.error('Error querying campaigns:', error);
      throw error;
    }
  }

  /**
   * Query ad groups for campaigns
   */
  async queryAdGroups(
    accountId: string,
    campaignIds?: string[]
  ): Promise<any[]> {
    try {
      if (!this.accessToken) {
        throw new Error('Google Ads access token not found');
      }

      // For MVP, return comprehensive mock data
      await simulateApiDelay();

      // Return mock ad group data with full metrics
      let adGroups = mockAdGroupQueryResults.map((adGroup) => ({
        id: adGroup.id,
        resourceName: adGroup.resourceName,
        name: adGroup.name,
        campaignId: adGroup.campaign.split('/').pop(), // Extract campaign ID from resource name
        campaign: adGroup.campaign,
        status: adGroup.status,
        type: adGroup.type,
        cpcBid: adGroup.cpcBidMicros ? adGroup.cpcBidMicros / 1000000 : undefined,
        cpcBidMicros: adGroup.cpcBidMicros,
        effectiveCpcBidMicros: adGroup.effectiveCpcBidMicros,
        // Include metrics for pattern extraction
        impressions: adGroup.metrics.impressions,
        clicks: adGroup.metrics.clicks,
        conversions: adGroup.metrics.conversions,
        cost: adGroup.metrics.costMicros / 1000000,
        costMicros: adGroup.metrics.costMicros,
        ctr: adGroup.metrics.ctr,
        averageCpc: adGroup.metrics.averageCpc,
        conversionsValue: adGroup.metrics.conversionsValue,
      }));

      // Filter by campaign IDs if provided
      if (campaignIds && campaignIds.length > 0) {
        adGroups = adGroups.filter((ag) =>
          ag.campaignId && campaignIds.includes(ag.campaignId)
        );
      }

      return adGroups;
    } catch (error) {
      console.error('Error querying ad groups:', error);
      throw error;
    }
  }

  /**
   * Query keywords with performance metrics
   */
  async queryKeywords(
    accountId: string,
    campaignIds?: string[],
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any[]> {
    try {
      if (!this.accessToken) {
        throw new Error('Google Ads access token not found');
      }

      // For MVP, return comprehensive mock data with performance metrics
      await simulateApiDelay();

      // Return mock keyword data with full metrics
      return mockKeywordQueryResults.map((keyword) => ({
        id: keyword.criterionId,
        criterionId: keyword.criterionId,
        resourceName: keyword.resourceName,
        adGroupId: keyword.resourceName.split('/').pop()?.split('~')[0], // Extract ad group ID
        text: keyword.keyword?.text || '',
        matchType: keyword.keyword?.matchType || 'BROAD',
        status: keyword.status,
        cpcBid: keyword.cpcBidMicros ? keyword.cpcBidMicros / 1000000 : undefined,
        cpcBidMicros: keyword.cpcBidMicros,
        // Include detailed performance metrics
        impressions: keyword.metrics.impressions,
        clicks: keyword.metrics.clicks,
        conversions: keyword.metrics.conversions,
        cost: keyword.metrics.costMicros / 1000000,
        costMicros: keyword.metrics.costMicros,
        ctr: keyword.metrics.ctr,
        averageCpc: keyword.metrics.averageCpc,
        conversionsValue: keyword.metrics.conversionsValue,
        conversionsFromInteractionsRate: keyword.metrics.conversionsFromInteractionsRate,
        costPerConversion: keyword.metrics.costPerConversion,
        qualityScore: keyword.metrics.qualityScore,
      }));
    } catch (error) {
      console.error('Error querying keywords:', error);
      throw error;
    }
  }

  /**
   * Query responsive search ads (RSAs)
   */
  async queryAds(
    accountId: string,
    campaignIds?: string[],
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any[]> {
    try {
      if (!this.accessToken) {
        throw new Error('Google Ads access token not found');
      }

      // For MVP, return comprehensive mock data
      await simulateApiDelay();

      // Return mock RSA data with complete ad assets
      return mockRSAQueryResults.map((adGroupAd) => ({
        id: adGroupAd.ad.id,
        resourceName: adGroupAd.resourceName,
        adGroupId: adGroupAd.adGroup.split('/').pop(), // Extract ad group ID
        adGroup: adGroupAd.adGroup,
        type: adGroupAd.ad.type,
        status: adGroupAd.status,
        finalUrls: adGroupAd.ad.finalUrls,
        // Extract headlines as array of strings for pattern extraction
        headlines: adGroupAd.ad.responsiveSearchAd?.headlines.map((h) => h.text) || [],
        // Extract descriptions as array of strings for pattern extraction
        descriptions: adGroupAd.ad.responsiveSearchAd?.descriptions.map((d) => d.text) || [],
        // Include complete RSA info for detailed analysis
        responsiveSearchAd: adGroupAd.ad.responsiveSearchAd,
        path1: adGroupAd.ad.responsiveSearchAd?.path1,
        path2: adGroupAd.ad.responsiveSearchAd?.path2,
      }));
    } catch (error) {
      console.error('Error querying ads:', error);
      throw error;
    }
  }
}

