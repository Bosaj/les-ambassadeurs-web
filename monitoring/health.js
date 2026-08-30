/* eslint-env node */
/**
 * Health check controller for les-ambassadeurs-web
 */
export function getHealthStatus() {
  return {
    service: 'les-ambassadeurs-web',
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}

export function checkLiveness() {
  return true;
}

export function checkReadiness() {
  return true;
}
