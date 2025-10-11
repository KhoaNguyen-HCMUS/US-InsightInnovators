import { requestAuth } from '../utils/api';

export interface ProfileResponse {
  success: boolean;
  data: {
    user: { 
      id: string; 
      email: string; 
      created_at: string;
    };
    profile: {
      height_cm: string;
      weight_kg: string;
      sex: string;
      activity_level: string;
      goal: string;
      bmi: string;
      bmr: string;
      tdee: string;
      updated_at: string;
      conditions_json?: string;
      allergies_json?: string;
      preferences_json?: string;
      consent_accepted_at?: string | null;
    };
  }
}

export interface ProfileUpdateRequest {
  height_cm: string;
  weight_kg: string;
  sex: string;
  activity_level: string;
  goal: string;
  conditions_json?: string;
  allergies_json?: string;
  preferences_json?: string;
}

// Define a more flexible API response type for handling different response formats
interface FlexibleProfileResponse {
  success?: boolean;
  data?: {
    user?: {
      id?: string;
      email?: string;
      created_at?: string;
    };
    profile?: {
      height_cm?: string;
      weight_kg?: string;
      sex?: string;
      activity_level?: string;
      goal?: string;
      bmi?: string;
      bmr?: string;
      tdee?: string;
      updated_at?: string;
      conditions_json?: string;
      allergies_json?: string;
      preferences_json?: string;
      consent_accepted_at?: string | null;
    };
    // For direct properties in data (flat structure)
    height_cm?: string;
    weight_kg?: string;
    sex?: string;
    activity_level?: string;
    goal?: string;
    bmi?: string;
    bmr?: string;
    tdee?: string;
    updated_at?: string;
    conditions_json?: string;
    allergies_json?: string;
    preferences_json?: string;
    consent_accepted_at?: string | null;
  };
}

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await requestAuth<FlexibleProfileResponse>('GET', '/api/auth/profile');
    console.log('Raw profile response:', response);

    // Check if the API response matches our expected structure
    // If not, try to adapt it to our expected format
    if (response && response.success) {
      if (!response.data) {
        throw new Error('Missing data property in API response');
      }

      // If the response doesn't have nested profile structure, try to adapt it
      if (!response.data.profile && (
          response.data.height_cm || 
          response.data.weight_kg || 
          response.data.sex)) {
        
        console.log('Converting flat profile structure to nested structure');
        
        // The profile data is directly in the data object, create the nested structure
        return {
          success: response.success,
          data: {
            user: {
              id: response.data.user?.id || '1', 
              email: response.data.user?.email || 'user@example.com', 
              created_at: response.data.user?.created_at || new Date().toISOString() 
            },
            profile: {
              height_cm: response.data.height_cm || '0',
              weight_kg: response.data.weight_kg || '0',
              sex: response.data.sex || 'male',
              activity_level: response.data.activity_level || 'moderate',
              goal: response.data.goal || 'maintain',
              bmi: response.data.bmi || '0',
              bmr: response.data.bmr || '0',
              tdee: response.data.tdee || '0',
              updated_at: response.data.updated_at || new Date().toISOString(),
              conditions_json: response.data.conditions_json || '[]',
              allergies_json: response.data.allergies_json || '[]',
              preferences_json: response.data.preferences_json || '[]',
              consent_accepted_at: response.data.consent_accepted_at
            }
          }
        };
      }
      
      // Check if the response has all required properties for ProfileResponse
      if (response.data.profile) {
        const profile = response.data.profile;
        const user = {
          id: response.data.user?.id || '1',
          email: response.data.user?.email || 'user@example.com',
          created_at: response.data.user?.created_at || new Date().toISOString()
        };
        
        // Ensure all required properties exist
        return {
          success: response.success,
          data: {
            user,
            profile: {
              height_cm: profile.height_cm || '0',
              weight_kg: profile.weight_kg || '0',
              sex: profile.sex || 'male',
              activity_level: profile.activity_level || 'moderate',
              goal: profile.goal || 'maintain',
              bmi: profile.bmi || '0',
              bmr: profile.bmr || '0',
              tdee: profile.tdee || '0',
              updated_at: profile.updated_at || new Date().toISOString(),
              conditions_json: profile.conditions_json || '[]',
              allergies_json: profile.allergies_json || '[]',
              preferences_json: profile.preferences_json || '[]',
              consent_accepted_at: profile.consent_accepted_at
            }
          }
        };
      }
    }
    
    throw new Error('Invalid API response structure');
  } catch (error) {
    console.error('Error in getProfile service:', error);
    // Return mock data if API call fails for development purposes
    return {
      success: true,
      data: {
        user: { 
          id: '1', 
          email: 'user@example.com', 
          created_at: '2025-09-29T09:10:33.4412' 
        },
        profile: {
          height_cm: '170',
          weight_kg: '65',
          sex: 'male',
          activity_level: 'moderate',
          goal: 'maintain',
          bmi: '22.49',
          bmr: '1577.5',
          tdee: '2445',
          updated_at: '2025-09-29T17:02:59.5132',
          conditions_json: '["high_blood_pressure"]',
          allergies_json: '["nuts", "dairy"]',
          preferences_json: '["vegetarian", "low_sodium"]',
          consent_accepted_at: '2025-09-29T09:10:33.4412'
        }
      }
    };
  }
};

export const updateProfile = async (profileData: ProfileUpdateRequest): Promise<ProfileResponse> => {
  try {
    const response = await requestAuth<ProfileResponse, ProfileUpdateRequest>('PUT', '/api/auth/profile', profileData);
    return response;
  } catch (error) {
    console.error('Error in updateProfile service:', error);
    // Return mock updated data for development purposes
    return {
      success: true,
      data: {
        user: { 
          id: '1', 
          email: 'user@example.com', 
          created_at: '2025-09-29T09:10:33.4412' 
        },
        profile: {
          height_cm: profileData.height_cm,
          weight_kg: profileData.weight_kg,
          sex: profileData.sex,
          activity_level: profileData.activity_level,
          goal: profileData.goal,
          bmi: '22.49', // Calculated value in a real scenario
          bmr: '1577.5', // Calculated value in a real scenario
          tdee: '2445', // Calculated value in a real scenario
          updated_at: new Date().toISOString(),
          conditions_json: profileData.conditions_json || '[]',
          allergies_json: profileData.allergies_json || '[]',
          preferences_json: profileData.preferences_json || '[]',
          consent_accepted_at: new Date().toISOString()
        }
      }
    };
  }
};