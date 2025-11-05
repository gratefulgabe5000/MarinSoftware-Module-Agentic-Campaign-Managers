import { ADEModule, RouteConfig, MenuItem } from '../types/ade.types';
import AgenticCampaignManagerModule from '../AgenticCampaignManagerModule';
import CampaignDashboard from '../components/CampaignDashboard';
import CampaignCreation from '../components/CampaignCreation';
import CampaignDetail from '../components/CampaignDetail';

/**
 * Module Routes Configuration
 */
export const moduleRoutes: RouteConfig[] = [
  {
    path: '/',
    component: CampaignDashboard,
    exact: true,
    meta: {
      title: 'Campaign Dashboard',
      description: 'View and manage all campaigns',
    },
  },
  {
    path: '/create',
    component: CampaignCreation,
    exact: true,
    meta: {
      title: 'Create Campaign',
      description: 'Create a new campaign using natural language',
    },
  },
  {
    path: '/campaign/:id',
    component: CampaignDetail,
    meta: {
      title: 'Campaign Details',
      description: 'View campaign details and performance',
    },
  },
];

/**
 * Module Menu Items Configuration
 */
export const moduleMenuItems: MenuItem[] = [
  {
    label: 'New Campaign',
    action: 'create-campaign',
    icon: 'plus',
    shortcut: 'Ctrl+N',
  },
  {
    label: 'Campaign Manager',
    action: 'open-manager',
    icon: 'dashboard',
    shortcut: 'Ctrl+M',
  },
];

/**
 * Module Configuration Object
 * This will be used to register the module with the ADE framework
 */
export const moduleConfig: Partial<ADEModule> = {
  id: 'agentic-campaign-manager',
  name: 'Agentic Campaign Manager',
  version: '1.0.0',
  description: 'AI-powered campaign creation and management for performance marketers',
  icon: '/assets/campaign-manager-icon.svg',
  category: 'campaign-management',
  
  getUIComponents: () => ({
    mainPanel: AgenticCampaignManagerModule,
    routes: moduleRoutes,
    menus: moduleMenuItems,
  }),
};

export default moduleConfig;

