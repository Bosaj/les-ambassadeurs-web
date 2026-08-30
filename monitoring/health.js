/**
 * Health check controller for les-ambassadeurs-web
 */
function getHealthStatus() {
  return {
    service: 'les-ambassadeurs-web',
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}

module.exports = { getHealthStatus };
