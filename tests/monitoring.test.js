/* eslint-env node, jest */
/* global process, require, module, describe, test, expect */
const { getHealthStatus } = require('../monitoring/health');
const { runEvaluation } = require('../scripts/eval_harness');

describe('les-ambassadeurs-web Observability & QA', () => {
  test('health status returns UP', () => {
    const health = getHealthStatus();
    expect(health.status).toBe('UP');
    expect(health.service).toBe('les-ambassadeurs-web');
  });

  test('evaluation harness produces passing report', () => {
    const results = runEvaluation();
    expect(results.status).toBe('PASSED');
    expect(results.metrics.qualityIndex).toBeGreaterThan(0.5);
  });
});
