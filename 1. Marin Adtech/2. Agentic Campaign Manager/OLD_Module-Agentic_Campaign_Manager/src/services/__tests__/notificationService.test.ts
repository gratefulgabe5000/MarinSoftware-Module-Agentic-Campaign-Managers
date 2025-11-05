import { NotificationPermission } from '../notificationService';
import NotificationService from '../notificationService';

// Mock Notification API - set up before importing service
const mockNotification = {
  close: jest.fn(),
  onclick: null,
  onclose: null,
};

// Setup window.Notification before importing the service
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: jest.fn().mockImplementation((title, options) => {
    return {
      ...mockNotification,
      title,
      ...options,
    };
  }),
  configurable: true,
});

(window.Notification as any).permission = 'granted' as NotificationPermission;
(window.Notification as any).requestPermission = jest.fn().mockResolvedValue('granted');

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset permission to default for each test
    (window.Notification as any).permission = 'default' as NotificationPermission;
    // Create a new service instance for each test to get fresh state
    service = new NotificationService();
  });

  describe('isNotificationsSupported', () => {
    it('should return true if notifications are supported', () => {
      // Service is instantiated with window.Notification available
      expect(service.isNotificationsSupported()).toBe(true);
    });
  });

  describe('getPermission', () => {
    it('should return current permission status', () => {
      (window.Notification as any).permission = 'granted' as NotificationPermission;
      const grantedService = new NotificationService();
      expect(grantedService.getPermission()).toBe('granted');
    });

    it('should return denied if permission is denied', () => {
      (window.Notification as any).permission = 'denied' as NotificationPermission;
      const deniedService = new NotificationService();
      expect(deniedService.getPermission()).toBe('denied');
    });
  });

  describe('isPermissionGranted', () => {
    it('should return true if permission is granted', () => {
      (window.Notification as any).permission = 'granted' as NotificationPermission;
      const grantedService = new NotificationService();
      expect(grantedService.isPermissionGranted()).toBe(true);
    });

    it('should return false if permission is not granted', () => {
      (window.Notification as any).permission = 'denied' as NotificationPermission;
      const deniedService = new NotificationService();
      expect(deniedService.isPermissionGranted()).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('should request notification permission', async () => {
      (window.Notification as any).permission = 'default' as NotificationPermission;
      (window.Notification as any).requestPermission = jest.fn().mockResolvedValue('granted');
      const defaultService = new NotificationService();

      const permission = await defaultService.requestPermission();

      expect(permission).toBe('granted');
      expect((window.Notification as any).requestPermission).toHaveBeenCalled();
    });

    it('should return granted if already granted', async () => {
      (window.Notification as any).permission = 'granted' as NotificationPermission;
      (window.Notification as any).requestPermission = jest.fn();
      const grantedService = new NotificationService();

      const permission = await grantedService.requestPermission();

      expect(permission).toBe('granted');
      expect((window.Notification as any).requestPermission).not.toHaveBeenCalled();
    });

    it('should throw error if permission is denied', async () => {
      (window.Notification as any).permission = 'denied' as NotificationPermission;
      const deniedService = new NotificationService();

      await expect(deniedService.requestPermission()).rejects.toThrow(
        'Notification permission has been denied'
      );
    });
  });

  describe('showNotification', () => {
    it('should show notification if permission is granted', async () => {
      (window.Notification as any).permission = 'granted' as NotificationPermission;
      const grantedService = new NotificationService();
      jest.clearAllMocks();

      const notification = await grantedService.showNotification({
        title: 'Test Notification',
        body: 'Test body',
      });

      expect(notification).toBeDefined();
      expect(window.Notification).toHaveBeenCalledWith('Test Notification', expect.any(Object));
    });

    it('should request permission if not granted', async () => {
      (window.Notification as any).permission = 'default' as NotificationPermission;
      (window.Notification as any).requestPermission = jest.fn().mockResolvedValue('granted');
      const defaultService = new NotificationService();
      jest.clearAllMocks();

      const notification = await defaultService.showNotification({
        title: 'Test Notification',
      });

      expect(notification).toBeDefined();
      expect((window.Notification as any).requestPermission).toHaveBeenCalled();
    });

    it('should return null if permission is denied', async () => {
      (window.Notification as any).permission = 'denied' as NotificationPermission;
      const deniedService = new NotificationService();

      const notification = await deniedService.showNotification({
        title: 'Test Notification',
      });

      expect(notification).toBeNull();
    });
  });

  describe('showCampaignStatusNotification', () => {
    it('should show campaign status notification', async () => {
      (window.Notification as any).permission = 'granted' as NotificationPermission;
      const grantedService = new NotificationService();
      jest.clearAllMocks();

      const notification = await grantedService.showCampaignStatusNotification(
        'campaign-123',
        'Test Campaign',
        'active',
        'Campaign is now active'
      );

      expect(notification).toBeDefined();
      expect(window.Notification).toHaveBeenCalledWith(
        expect.stringContaining('Campaign Status Update'),
        expect.any(Object)
      );
    });

    it('should use appropriate emoji for status', async () => {
      (window.Notification as any).permission = 'granted' as NotificationPermission;
      const grantedService = new NotificationService();
      jest.clearAllMocks();

      await grantedService.showCampaignStatusNotification(
        'campaign-123',
        'Test Campaign',
        'active'
      );

      expect(window.Notification).toHaveBeenCalledWith(
        expect.stringContaining('▶️'),
        expect.any(Object)
      );
    });
  });
});

