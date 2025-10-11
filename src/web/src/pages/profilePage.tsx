import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { validateHealthProfile } from '../utils/healthCalculations';
import { getUserEmail } from '../utils/authStorage';
import { getProfile, updateProfile, type ProfileUpdateRequest } from '../services/profile';

import type { HealthProfile, HealthIndices } from '../types/health';
import ProfileHeader from '../components/profile/profileHeader';
import HealthForm from '../components/profile/healthForm';
import HealthIndicesCard from '../components/profile/healthIndicesCard';
import ProfileFooter from '../components/profile/profileFooter';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<HealthProfile>>({
    personalInfo: {
      age: 0,
      gender: 'male',
      height: 0,
      weight: 0,
      location: ''
    },
    goals: {
      primary: 'maintain'
    },
    activityLevel: 'moderate',
    medicalInfo: {
      conditions: '',
      allergies: '',
      medications: ''
    },
    units: {
      weight: 'kg',
      height: 'cm',
      temperature: 'celsius'
    },
    consent: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [healthIndices, setHealthIndices] = useState<HealthIndices | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userName = getUserEmail() || '';
  const userEmail = getUserEmail() || '';
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getProfile();
        
        if (!response || !response.success) {
          throw new Error('Invalid API response');
        }
        
        if (!response.data) {
          throw new Error('No data in API response');
        }
        
        const user = response.data.user || { id: 'default_user', email: 'user@example.com', created_at: new Date().toISOString() };
        
        const apiProfile = response.data.profile;
        if (!apiProfile) {
          throw new Error('No profile data in API response');
        }
        
        // Parse JSON arrays from API or use empty arrays if not available
        let conditionsArray: string[] = [];
        let allergiesArray: string[] = [];
        let preferencesArray: string[] = [];
        
        try {
          if (apiProfile.conditions_json) {
            conditionsArray = JSON.parse(apiProfile.conditions_json);
          }
        } catch (e) {
          console.error('Error parsing conditions_json:', e);
        }
        
        try {
          if (apiProfile.allergies_json) {
            allergiesArray = JSON.parse(apiProfile.allergies_json);
          }
        } catch (e) {
          console.error('Error parsing allergies_json:', e);
        }
        
        try {
          if (apiProfile.preferences_json) {
            preferencesArray = JSON.parse(apiProfile.preferences_json);
          }
        } catch (e) {
          console.error('Error parsing preferences_json:', e);
        }
        
        const newProfile: Partial<HealthProfile> = {
          personalInfo: {
            age: 0,
            gender: (apiProfile.sex || 'male') as 'male' | 'female',
            height: parseFloat(apiProfile.height_cm || '0') || 0,
            weight: parseFloat(apiProfile.weight_kg || '0') || 0,
            location: ''
          },
          goals: {
            primary: (apiProfile.goal || 'maintain') as 'lose' | 'maintain' | 'gain'
          },
          activityLevel: (apiProfile.activity_level || 'moderate') as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
          medicalInfo: {
            conditions: conditionsArray.join(', '),
            allergies: allergiesArray.join(', '),
            medications: '',
            preferences: preferencesArray.join(', ')
          },
          units: {
            weight: 'kg',
            height: 'cm',
            temperature: 'celsius'
          },
          consent: apiProfile.consent_accepted_at !== null,
          userId: user.id,
          updatedAt: apiProfile.updated_at ? new Date(apiProfile.updated_at) : new Date()
        };

        const bmiValue = parseFloat(apiProfile.bmi || '0') || 0;
        const newIndices: HealthIndices = {
          bmi: {
            value: bmiValue,
            category: getBmiCategory(bmiValue)
          },
          bmr: parseFloat(apiProfile.bmr || '0') || 0,
          tdee: parseFloat(apiProfile.tdee || '0') || 0,
          recommendedCalories: parseFloat(apiProfile.tdee || '0') || 0
        };

        setProfile(newProfile);
        setHealthIndices(newIndices);
        setLastSaved(apiProfile.updated_at ? new Date(apiProfile.updated_at) : new Date());
        
        toast.success('Profile loaded successfully!');
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Using default profile data');
        
        console.log('Using default profile:', profile);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getBmiCategory = (bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' => {
    if (isNaN(bmi) || bmi === 0) return 'normal'; // Default if invalid
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  };


  useEffect(() => {
    if (isEditing) {
      const validation = validateHealthProfile(profile);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [profile, isEditing]);

  const handleProfileChange = useCallback((newProfile: Partial<HealthProfile>) => {
    setProfile(newProfile);
    setHasChanges(true);
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
      setHasChanges(false);
    }
  };

  const handleSave = async () => {
    const validation = validateHealthProfile(profile);
    
    if (!validation.isValid) {
      toast.error('Please fix validation errors before saving');
      setValidationErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    
    try {
      // Prepare medical information for API
      const conditions = profile.medicalInfo?.conditions?.split(',').map(item => item.trim()) || [];
      const allergies = profile.medicalInfo?.allergies?.split(',').map(item => item.trim()) || [];
      const preferences = profile.medicalInfo?.preferences?.split(',').map(item => item.trim()) || [];

      // Format the data for API (to match the API response format)
      const apiProfileData: ProfileUpdateRequest = {
        height_cm: String(profile.personalInfo?.height || 0),
        weight_kg: String(profile.personalInfo?.weight || 0),
        sex: profile.personalInfo?.gender || 'male',
        activity_level: profile.activityLevel || 'moderate',
        goal: profile.goals?.primary || 'maintain',
        conditions_json: JSON.stringify(conditions),
        allergies_json: JSON.stringify(allergies),
        preferences_json: JSON.stringify(preferences)
      };
      
      // Make the API call to update the profile
      const response = await updateProfile(apiProfileData);
      console.log('Save profile response:', response);
      
      if (!response || !response.success || !response.data || !response.data.profile) {
        throw new Error('Failed to update profile: Invalid response format');
      }
      
      const user = response.data.user || { id: 'default_user', email: '', created_at: new Date().toISOString() };
      const apiProfile = response.data.profile;
      
      // Parse medical information from API response
      let conditionsArray: string[] = [];
      let allergiesArray: string[] = [];
      let preferencesArray: string[] = [];
      
      try {
        if (apiProfile.conditions_json) {
          conditionsArray = JSON.parse(apiProfile.conditions_json);
        }
      } catch (e) {
        console.error('Error parsing conditions_json:', e);
      }
      
      try {
        if (apiProfile.allergies_json) {
          allergiesArray = JSON.parse(apiProfile.allergies_json);
        }
      } catch (e) {
        console.error('Error parsing allergies_json:', e);
      }
      
      try {
        if (apiProfile.preferences_json) {
          preferencesArray = JSON.parse(apiProfile.preferences_json);
        }
      } catch (e) {
        console.error('Error parsing preferences_json:', e);
      }

      // Convert the response back to our frontend format with safe access and type conversion
      const savedProfile = {
        ...profile,
        personalInfo: {
          ...profile.personalInfo,
          height: parseFloat(apiProfile.height_cm) || profile.personalInfo?.height || 0,
          weight: parseFloat(apiProfile.weight_kg) || profile.personalInfo?.weight || 0,
          gender: (apiProfile.sex || profile.personalInfo?.gender || 'male') as 'male' | 'female'
        },
        goals: {
          ...profile.goals,
          primary: (apiProfile.goal || profile.goals?.primary || 'maintain') as 'lose' | 'maintain' | 'gain'
        },
        activityLevel: (apiProfile.activity_level || profile.activityLevel || 'moderate') as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        medicalInfo: {
          ...profile.medicalInfo,
          conditions: conditionsArray.join(', '),
          allergies: allergiesArray.join(', '),
          preferences: preferencesArray.join(', ')
        },
        userId: user.id || 'default_user',
        updatedAt: apiProfile.updated_at ? new Date(apiProfile.updated_at) : new Date(),
        consent: apiProfile.consent_accepted_at !== null
      } as HealthProfile;

      // Get health indices directly from API response, not calculating them
      const bmiValue = parseFloat(apiProfile.bmi) || 0;
      const newIndices: HealthIndices = {
        bmi: {
          value: bmiValue,
          category: getBmiCategory(bmiValue)
        },
        bmr: parseFloat(apiProfile.bmr) || 0,
        tdee: parseFloat(apiProfile.tdee) || 0,
        recommendedCalories: parseFloat(apiProfile.tdee) || 0 // Using TDEE from API as recommended calories
      };
      
      setProfile(savedProfile);
      setHealthIndices(newIndices);
      setLastSaved(new Date(apiProfile.updated_at));
      setHasChanges(false);
      setIsEditing(false);
      setValidationErrors([]);
      
      toast.success('Profile saved successfully!');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setHasChanges(false);
    setIsEditing(false);
    setValidationErrors([]);
    toast.info('Changes cancelled');
  };

  return (
    <div className="min-h-screen bg-linear-(--gradient-primary) py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-header">
            Health Profile
          </h1>
          <p className="mt-2 text-text-body">
            Manage your health information and track your nutritional goals
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {validationErrors.length > 0 && isEditing && (
              <div className="mb-6 bg-error-bg border border-error-border rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-foreground">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-error-foreground">
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ProfileHeader
              userName={userName}
              userEmail={userEmail}
              isEditing={isEditing}
              consentGranted={true}
              onEditToggle={handleEditToggle}
              onSave={handleSave}
              onCancel={handleCancel}
            />

            <HealthForm
              profile={profile}
              isEditing={isEditing}
              consentGranted={true}
              onChange={handleProfileChange}
            />

            <HealthIndicesCard
              indices={healthIndices}
              activityLevel={profile.activityLevel || 'moderate'}
              goal={profile.goals?.primary || 'maintain'}
              consentGranted={true}
            />

            <ProfileFooter
              isEditing={isEditing}
              hasChanges={hasChanges}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={isSaving}
              lastSaved={lastSaved || undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}
