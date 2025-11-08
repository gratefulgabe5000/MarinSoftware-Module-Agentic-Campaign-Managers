import React, { useEffect, useState } from 'react';
import { authService, ConnectionStatus } from '../services/authService';

/**
 * PlatformConnection Component Props
 */
interface PlatformConnectionProps {
  platform: 'google' | 'meta' | 'microsoft';
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * PlatformConnection Component
 * Manages platform OAuth connection
 */
const PlatformConnection: React.FC<PlatformConnectionProps> = ({
  platform,
  onConnectionChange,
}) => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load connection status
   */
  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const connectionStatus = await authService.getConnectionStatus(platform);
        setStatus(connectionStatus);

        if (onConnectionChange) {
          onConnectionChange(connectionStatus);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connection status');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [platform, onConnectionChange]);

  /**
   * Handle connect button click
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await authService.initiateOAuthFlow(platform);
      // The browser will redirect to OAuth provider
      // Component will reload after redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate connection');
      setIsConnecting(false);
    }
  };

  /**
   * Get platform display name
   */
  const getPlatformName = (): string => {
    switch (platform) {
      case 'google':
        return 'Google Ads';
      case 'meta':
        return 'Meta Ads';
      case 'microsoft':
        return 'Microsoft Ads';
      default:
        return platform;
    }
  };

  /**
   * Get platform icon
   */
  const getPlatformIcon = (): string => {
    switch (platform) {
      case 'google':
        return '🔵';
      case 'meta':
        return '🔷';
      case 'microsoft':
        return '🔴';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="platform-connection loading">
        <div className="loading-spinner">Loading connection status...</div>
      </div>
    );
  }

  return (
    <div className="platform-connection">
      <div className="platform-connection-header">
        <span className="platform-icon">{getPlatformIcon()}</span>
        <h3>{getPlatformName()}</h3>
      </div>

      {error && (
        <div className="connection-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {status && (
        <div className={`connection-status ${status.connected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator">
            {status.connected ? '✅' : '❌'}
          </span>
          <span className="status-text">
            {status.connected ? 'Connected' : 'Not Connected'}
          </span>
          {status.tokenExpired && (
            <span className="token-expired">(Token Expired)</span>
          )}
        </div>
      )}

      {status && !status.connected && (
        <button
          className="connect-btn"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : `Connect ${getPlatformName()}`}
        </button>
      )}

      {status && status.connected && (
        <div className="connection-success">
          <span>✅ Successfully connected to {getPlatformName()}</span>
        </div>
      )}
    </div>
  );
};

export default PlatformConnection;

