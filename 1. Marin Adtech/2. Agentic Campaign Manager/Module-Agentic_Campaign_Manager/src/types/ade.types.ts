import React from 'react';

/**
 * ADE Module Interface
 * Defines the contract for modules integrated into the Ad Development Environment
 */
export interface ADEModule {
  // Module metadata
  id: string;
  name: string;
  version: string;
  description: string;
  icon?: string;
  category?: string;
  
  // Lifecycle hooks
  initialize: (context: ADEContext) => Promise<void>;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  destroy: () => Promise<void>;
  
  // UI integration
  getUIComponents: () => ModuleUIComponents;
  
  // Event handling
  onEvent: (event: ADEEvent) => void;
  emitEvent: (event: ADEEvent) => void;
  
  // Shared services (optional - module can provide or use ADE services)
  getServices?: () => {
    storage?: StorageService;
    analytics?: AnalyticsService;
    auth?: AuthService;
  };
  
  // Module configuration
  getConfig?: () => ModuleConfig;
}

/**
 * ADE Context Interface
 * Provides access to ADE framework services and shared state
 */
export interface ADEContext {
  // ADE framework services
  eventBus: EventBus;
  storage: StorageService;
  analytics: AnalyticsService;
  auth: AuthService;
  router: Router;
  theme: ThemeService;
  
  // Module registry
  modules: ModuleRegistry;
  
  // Shared state
  globalState: GlobalState;
}

/**
 * Module UI Components Interface
 * Defines UI components that the module provides to ADE
 */
export interface ModuleUIComponents {
  toolbar?: React.ComponentType<any>;
  sidebar?: React.ComponentType<any>;
  mainPanel?: React.ComponentType<any>;
  routes?: RouteConfig[];
  menus?: MenuItem[];
  statusBar?: React.ComponentType<any>;
}

/**
 * Route Configuration Interface
 */
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  meta?: Record<string, any>;
}

/**
 * Menu Item Interface
 */
export interface MenuItem {
  label: string;
  action: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
}

/**
 * ADE Event Interface
 */
export interface ADEEvent {
  type: string;
  payload?: any;
  timestamp?: Date;
  source?: string;
}

/**
 * Module Configuration Interface
 */
export interface ModuleConfig {
  [key: string]: any;
}

// Placeholder interfaces for ADE services (will be defined when ADE framework is available)
export interface EventBus {
  emit: (event: ADEEvent) => void;
  on: (eventType: string, handler: (event: ADEEvent) => void) => void;
  off: (eventType: string, handler: (event: ADEEvent) => void) => void;
}

export interface StorageService {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface AnalyticsService {
  track: (event: string, properties?: Record<string, any>) => void;
  page: (name: string, properties?: Record<string, any>) => void;
}

export interface AuthService {
  getUser: () => Promise<any>;
  isAuthenticated: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface Router {
  navigate: (path: string) => void;
  currentPath: () => string;
  goBack: () => void;
  goForward: () => void;
}

export interface ThemeService {
  getTheme: () => string;
  setTheme: (theme: string) => void;
  onThemeChange: (callback: (theme: string) => void) => void;
}

export interface ModuleRegistry {
  getModule: (id: string) => ADEModule | undefined;
  getAllModules: () => ADEModule[];
  registerModule: (module: ADEModule) => void;
  unregisterModule: (id: string) => void;
}

export interface GlobalState {
  [key: string]: any;
}

