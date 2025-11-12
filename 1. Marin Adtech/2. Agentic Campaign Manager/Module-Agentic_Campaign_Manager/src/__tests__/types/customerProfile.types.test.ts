/**
 * Customer Profile Types Test
 * Tests type compatibility between frontend and backend Customer Profile types
 */

import * as FrontendTypes from '../../types/customerProfile.types';
import * as BackendTypes from '../../../backend/src/types/customerProfile.types';

/**
 * This test file verifies that frontend types are compatible with backend types.
 * If this file compiles without errors, the types are compatible.
 */

describe('Customer Profile Type Compatibility', () => {
  describe('AgeRange', () => {
    it('should be compatible with backend type', () => {
      const frontendAge: FrontendTypes.AgeRange = { min: 18, max: 65 };
      const backendAge: BackendTypes.AgeRange = frontendAge;
      const frontendFromBackend: FrontendTypes.AgeRange = backendAge;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('IncomeRange', () => {
    it('should be compatible with backend type', () => {
      const frontendIncome: FrontendTypes.IncomeRange = { min: 50000, max: 100000 };
      const backendIncome: BackendTypes.IncomeRange = frontendIncome;
      const frontendFromBackend: FrontendTypes.IncomeRange = backendIncome;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('HouseholdSizeRange', () => {
    it('should be compatible with backend type', () => {
      const frontendSize: FrontendTypes.HouseholdSizeRange = { min: 1, max: 5 };
      const backendSize: BackendTypes.HouseholdSizeRange = frontendSize;
      const frontendFromBackend: FrontendTypes.HouseholdSizeRange = backendSize;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('RadiusTargeting', () => {
    it('should be compatible with backend type', () => {
      const frontendRadius: FrontendTypes.RadiusTargeting = {
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 10,
        unit: 'miles',
      };
      const backendRadius: BackendTypes.RadiusTargeting = frontendRadius;
      const frontendFromBackend: FrontendTypes.RadiusTargeting = backendRadius;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('LocationTargeting', () => {
    it('should be compatible with backend type', () => {
      const frontendLocation: FrontendTypes.LocationTargeting = {
        countries: ['US'],
        states: ['California'],
        cities: ['San Francisco'],
      };
      const backendLocation: BackendTypes.LocationTargeting = frontendLocation;
      const frontendFromBackend: FrontendTypes.LocationTargeting = backendLocation;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('Gender', () => {
    it('should be compatible with backend type', () => {
      const frontendGender: FrontendTypes.Gender = 'male';
      const backendGender: BackendTypes.Gender = frontendGender;
      const frontendFromBackend: FrontendTypes.Gender = backendGender;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('ParentalStatus', () => {
    it('should be compatible with backend type', () => {
      const frontendParental: FrontendTypes.ParentalStatus = 'parent';
      const backendParental: BackendTypes.ParentalStatus = frontendParental;
      const frontendFromBackend: FrontendTypes.ParentalStatus = backendParental;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('MaritalStatus', () => {
    it('should be compatible with backend type', () => {
      const frontendMarital: FrontendTypes.MaritalStatus = 'married';
      const backendMarital: BackendTypes.MaritalStatus = frontendMarital;
      const frontendFromBackend: FrontendTypes.MaritalStatus = backendMarital;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('EducationLevel', () => {
    it('should be compatible with backend type', () => {
      const frontendEducation: FrontendTypes.EducationLevel = 'bachelors';
      const backendEducation: BackendTypes.EducationLevel = frontendEducation;
      const frontendFromBackend: FrontendTypes.EducationLevel = backendEducation;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('EmploymentStatus', () => {
    it('should be compatible with backend type', () => {
      const frontendEmployment: FrontendTypes.EmploymentStatus = 'employed';
      const backendEmployment: BackendTypes.EmploymentStatus = frontendEmployment;
      const frontendFromBackend: FrontendTypes.EmploymentStatus = backendEmployment;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('HomeOwnershipStatus', () => {
    it('should be compatible with backend type', () => {
      const frontendOwnership: FrontendTypes.HomeOwnershipStatus = 'homeowner';
      const backendOwnership: BackendTypes.HomeOwnershipStatus = frontendOwnership;
      const frontendFromBackend: FrontendTypes.HomeOwnershipStatus = backendOwnership;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('Demographics', () => {
    it('should be compatible with backend type', () => {
      const frontendDemo: FrontendTypes.Demographics = {
        ageRange: { min: 18, max: 65 },
        gender: 'all',
        incomeRange: { min: 50000, max: 100000 },
      };
      const backendDemo: BackendTypes.Demographics = frontendDemo;
      const frontendFromBackend: FrontendTypes.Demographics = backendDemo;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('DeviceType', () => {
    it('should be compatible with backend type', () => {
      const frontendDevice: FrontendTypes.DeviceType = 'mobile';
      const backendDevice: BackendTypes.DeviceType = frontendDevice;
      const frontendFromBackend: FrontendTypes.DeviceType = backendDevice;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('OperatingSystem', () => {
    it('should be compatible with backend type', () => {
      const frontendOS: FrontendTypes.OperatingSystem = 'ios';
      const backendOS: BackendTypes.OperatingSystem = frontendOS;
      const frontendFromBackend: FrontendTypes.OperatingSystem = backendOS;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('BrowserType', () => {
    it('should be compatible with backend type', () => {
      const frontendBrowser: FrontendTypes.BrowserType = 'chrome';
      const backendBrowser: BackendTypes.BrowserType = frontendBrowser;
      const frontendFromBackend: FrontendTypes.BrowserType = backendBrowser;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('PurchaseBehavior', () => {
    it('should be compatible with backend type', () => {
      const frontendPurchase: FrontendTypes.PurchaseBehavior = 'frequent_buyer';
      const backendPurchase: BackendTypes.PurchaseBehavior = frontendPurchase;
      const frontendFromBackend: FrontendTypes.PurchaseBehavior = backendPurchase;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('OnlineActivityLevel', () => {
    it('should be compatible with backend type', () => {
      const frontendActivity: FrontendTypes.OnlineActivityLevel = 'active';
      const backendActivity: BackendTypes.OnlineActivityLevel = frontendActivity;
      const frontendFromBackend: FrontendTypes.OnlineActivityLevel = backendActivity;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('Behavior', () => {
    it('should be compatible with backend type', () => {
      const frontendBehavior: FrontendTypes.Behavior = {
        devicePreferences: ['mobile'],
        purchaseBehavior: ['frequent_buyer'],
        onlineActivityLevel: 'active',
      };
      const backendBehavior: BackendTypes.Behavior = frontendBehavior;
      const frontendFromBackend: FrontendTypes.Behavior = backendBehavior;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('Persona', () => {
    it('should be compatible with backend type', () => {
      const frontendPersona: FrontendTypes.Persona = {
        name: 'Tech-Savvy Professional',
        description: 'A professional who values technology and efficiency',
        motivations: ['save time', 'find quality products'],
      };
      const backendPersona: BackendTypes.Persona = frontendPersona;
      const frontendFromBackend: FrontendTypes.Persona = backendPersona;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('TargetCustomerProfile', () => {
    it('should be compatible with backend type', () => {
      const frontendProfile: FrontendTypes.TargetCustomerProfile = {
        id: 'profile-123',
        name: 'Test Profile',
        accountId: 'account-456',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const backendProfile: BackendTypes.TargetCustomerProfile = frontendProfile;
      const frontendFromBackend: FrontendTypes.TargetCustomerProfile = backendProfile;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('CustomerProfileCreationRequest', () => {
    it('should be compatible with backend type', () => {
      const frontendRequest: FrontendTypes.CustomerProfileCreationRequest = {
        name: 'New Profile',
        accountId: 'account-123',
      };
      const backendRequest: BackendTypes.CustomerProfileCreationRequest = frontendRequest;
      const frontendFromBackend: FrontendTypes.CustomerProfileCreationRequest = backendRequest;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('CustomerProfileUpdateRequest', () => {
    it('should be compatible with backend type', () => {
      const frontendUpdate: FrontendTypes.CustomerProfileUpdateRequest = {
        name: 'Updated Profile',
        isActive: true,
      };
      const backendUpdate: BackendTypes.CustomerProfileUpdateRequest = frontendUpdate;
      const frontendFromBackend: FrontendTypes.CustomerProfileUpdateRequest = backendUpdate;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('CustomerProfileValidationError', () => {
    it('should be compatible with backend type', () => {
      const frontendError: FrontendTypes.CustomerProfileValidationError = {
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED_FIELD',
      };
      const backendError: BackendTypes.CustomerProfileValidationError = frontendError;
      const frontendFromBackend: FrontendTypes.CustomerProfileValidationError = backendError;

      expect(frontendFromBackend).toBeDefined();
    });
  });

  describe('CustomerProfileValidationResult', () => {
    it('should be compatible with backend type', () => {
      const frontendResult: FrontendTypes.CustomerProfileValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      const backendResult: BackendTypes.CustomerProfileValidationResult = frontendResult;
      const frontendFromBackend: FrontendTypes.CustomerProfileValidationResult = backendResult;

      expect(frontendFromBackend).toBeDefined();
    });
  });
});
