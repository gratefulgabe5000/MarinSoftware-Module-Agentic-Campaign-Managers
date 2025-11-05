import { ADEModule, ADEContext, ADEEvent, ModuleUIComponents } from '../../types/ade.types';

describe('ADE Types', () => {
  describe('ADEModule interface', () => {
    it('should define required properties', () => {
      const module: Partial<ADEModule> = {
        id: 'test-module',
        name: 'Test Module',
        version: '1.0.0',
        description: 'Test module description',
      };

      expect(module.id).toBe('test-module');
      expect(module.name).toBe('Test Module');
      expect(module.version).toBe('1.0.0');
      expect(module.description).toBe('Test module description');
    });
  });

  describe('ADEContext interface', () => {
    it('should define required services', () => {
      const context: Partial<ADEContext> = {
        eventBus: {
          emit: jest.fn(),
          on: jest.fn(),
          off: jest.fn(),
        },
        storage: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn(),
          clear: jest.fn(),
        },
        analytics: {
          track: jest.fn(),
          page: jest.fn(),
        },
      };

      expect(context.eventBus).toBeDefined();
      expect(context.storage).toBeDefined();
      expect(context.analytics).toBeDefined();
    });
  });

  describe('ADEEvent interface', () => {
    it('should create valid events', () => {
      const event: ADEEvent = {
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: new Date(),
        source: 'test-module',
      };

      expect(event.type).toBe('test:event');
      expect(event.payload).toEqual({ data: 'test' });
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.source).toBe('test-module');
    });
  });

  describe('ModuleUIComponents interface', () => {
    it('should define optional UI components', () => {
      const components: ModuleUIComponents = {
        routes: [
          {
            path: '/test',
            component: () => null,
            exact: true,
            meta: { title: 'Test' },
          },
        ],
        menus: [
          {
            label: 'Test Menu',
            action: 'test-action',
            icon: 'test-icon',
            shortcut: 'Ctrl+T',
          },
        ],
      };

      expect(components.routes).toBeDefined();
      expect(components.menus).toBeDefined();
      expect(components.routes?.length).toBe(1);
      expect(components.menus?.length).toBe(1);
    });
  });
});

