// Build information utility
// This will be replaced during build time with actual values

declare global {
  interface Window {
    __BUILD_INFO__?: {
      version: string;
      commitHash: string;
      buildTime: string;
      commitMessage: string;
    };
  }
}

export const getBuildInfo = () => {
  // During development, return development info
  if (import.meta.env.DEV) {
    return {
      version: 'dev',
      commitHash: 'development',
      buildTime: new Date().toISOString(),
      commitMessage: 'Development build'
    };
  }

  // In production, use injected build info
  const buildInfo = window.__BUILD_INFO__;

  if (buildInfo) {
    return buildInfo;
  }

  // Fallback if build info is not available
  return {
    version: 'unknown',
    commitHash: 'unknown',
    buildTime: 'unknown',
    commitMessage: 'unknown'
  };
};

export const getBuildVersionString = () => {
  const buildInfo = getBuildInfo();

  if (buildInfo.version === 'dev') {
    return 'dev';
  }

  // Return a shortened commit hash for display
  const shortHash = buildInfo.commitHash.slice(0, 7);
  return `v${buildInfo.version}-${shortHash}`;
};
