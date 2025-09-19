import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { calculateHealthIndices, validateHealthProfile } from '../utils/healthCalculations';
import { getUserName, getUserEmail } from '../utils/authStorage';

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
    consent: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [healthIndices, setHealthIndices] = useState<HealthIndices | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

const userName = getUserName() || '';
  const userEmail = getUserEmail() || '';

  useEffect(() => {
    if (profile.consent && profile.personalInfo && profile.goals && profile.activityLevel) {
      try {
        const indices = calculateHealthIndices(profile as HealthProfile);
        setHealthIndices(indices);
      } catch (error) {
        console.error('Error calculating health indices:', error);
        setHealthIndices(null);
      }
    } else {
      setHealthIndices(null);
    }
  }, [profile]);

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

    if (!profile.consent) {
      toast.error('Please grant consent to save your profile');
      return;
    }

    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedProfile = {
        ...profile,
        id: profile.id || `profile_${Date.now()}`,
        userId: 'user_123', 
        updatedAt: new Date(),
        version: (profile.version || 0) + 1
      } as HealthProfile;

      setProfile(savedProfile);
      setLastSaved(new Date());
      setHasChanges(false);
      setIsEditing(false);
      setValidationErrors([]);
      
      toast.success('Profile saved successfully!');
      
      console.log('Triggering meal plan update...');
      
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

  const handleConsentToggle = () => {
    setProfile(prev => ({
      ...prev,
      consent: !prev.consent
    }));
    setHasChanges(true);
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

        <div className="mb-6 bg-bg-card rounded-lg shadow-md p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-linear-(--gradient-primary) rounded-lg mr-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-header">
                  Data Processing Consent
                </h3>
                <p className="text-sm text-text-body mt-1">
                  Grant consent to enable health calculations and personalized meal planning
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.consent || false}
                onChange={handleConsentToggle}
                disabled={isSaving}
                className="sr-only peer"
                aria-label='Toggle data processing consent'
              />
              <div className="w-14 h-7 bg-bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bg after:border-border-light after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-linear-(--gradient-primary)"></div>
            </label>
          </div>
        </div>

        <ProfileHeader
          userName={userName}
          userEmail={userEmail}
          isEditing={isEditing}
          consentGranted={profile.consent || false}
          onEditToggle={handleEditToggle}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        <HealthForm
          profile={profile}
          isEditing={isEditing}
          consentGranted={profile.consent || false}
          onChange={handleProfileChange}
        />

        <HealthIndicesCard
          indices={healthIndices}
          activityLevel={profile.activityLevel || 'moderate'}
          goal={profile.goals?.primary || 'maintain'}
          consentGranted={profile.consent || false}
        />

        <ProfileFooter
          isEditing={isEditing}
          hasChanges={hasChanges}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
          lastSaved={lastSaved || undefined}
        />
      </div>
    </div>
  );
}
