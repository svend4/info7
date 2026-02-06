# @openclaw/sandbox

Secure skill execution sandbox for OpenClaw CLI with VM2 isolation and resource limits.

## Features

- **VM2 Isolation**: Complete code isolation using VM2 virtual machine
- **Resource Limits**: Configurable timeout, memory, and CPU limits
- **API Whitelisting**: Only allow access to safe, approved APIs
- **Domain Whitelisting**: HTTP fetch restricted to approved domains
- **Rate Limiting**: Prevent abuse with API call limits
- **Audit Logging**: Track all skill executions and API calls
- **Metrics Collection**: Detailed execution metrics and resource usage

## Installation

```bash
npm install @openclaw/sandbox
# or
pnpm add @openclaw/sandbox
```

## Quick Start

```typescript
import { SkillSandbox } from '@openclaw/sandbox';

// Create sandbox with configuration
const sandbox = new SkillSandbox({
  timeout: 5000, // 5 second timeout
  maxMemory: 50 * 1024 * 1024, // 50 MB memory limit
  allowedDomains: ['api.github.com', 'api.openai.com'],
  maxHttpRequests: 10,
  maxConsoleLogs: 100
});

// Skill code to execute
const skillCode = `
  console.log('Starting skill execution...');

  const data = await fetch('https://api.github.com/users/octocat');
  const json = await data.json();

  return {
    name: json.name,
    followers: json.followers
  };
`;

// Execute skill
const result = await sandbox.execute(skillCode, {
  sessionId: 'abc123',
  userId: 'user456',
  args: { username: 'octocat' },
  config: {},
  metadata: {
    skillName: 'github-profile',
    skillVersion: '1.0.0',
    author: 'developer'
  }
});

// Check result
if (result.success) {
  console.log('Result:', result.result);
  console.log('Execution time:', result.metrics?.executionTime, 'ms');
  console.log('Memory used:', result.metrics?.memoryUsed, 'bytes');
  console.log('Logs:', result.logs);
} else {
  console.error('Error:', result.error);
  console.error('Details:', result.errorDetails);
}
```

## Configuration

### SandboxConfig

```typescript
interface SandboxConfig {
  /** Maximum execution timeout in milliseconds (default: 5000) */
  timeout?: number;

  /** Maximum memory usage in bytes (default: 50MB) */
  maxMemory?: number;

  /** Maximum CPU time in milliseconds (default: 3000) */
  maxCpuTime?: number;

  /** Allowed domains for HTTP requests */
  allowedDomains?: string[];

  /** Maximum HTTP requests per execution (default: 10) */
  maxHttpRequests?: number;

  /** Maximum console logs per execution (default: 100) */
  maxConsoleLogs?: number;

  /** Enable audit logging (default: true) */
  auditLog?: boolean;

  /** Audit log callback */
  onAuditLog?: (event: AuditLogEvent) => void;
}
```

## Security Features

### Code Validation

The sandbox automatically blocks dangerous code patterns:

```typescript
// ❌ Blocked: eval()
eval('console.log("malicious")');

// ❌ Blocked: Function constructor
new Function('return 42')();

// ❌ Blocked: require()
const fs = require('fs');

// ❌ Blocked: process access
process.env.SECRET_KEY;

// ❌ Blocked: file system access
fs.readFileSync('/etc/passwd');

// ❌ Blocked: child_process
require('child_process').exec('rm -rf /');
```

### Domain Whitelisting

HTTP fetch is restricted to whitelisted domains only:

```typescript
const sandbox = new SkillSandbox({
  allowedDomains: ['api.github.com']
});

// ✅ Allowed
await fetch('https://api.github.com/users/octocat');

// ❌ Blocked: domain not whitelisted
await fetch('https://evil.com/steal');

// ❌ Blocked: non-HTTPS
await fetch('http://api.github.com/users');
```

### Resource Limits

All resource usage is monitored and enforced:

```typescript
const sandbox = new SkillSandbox({
  timeout: 5000, // Max 5 seconds
  maxMemory: 50 * 1024 * 1024, // Max 50MB
  maxCpuTime: 3000, // Max 3 seconds CPU
  maxHttpRequests: 10, // Max 10 HTTP calls
  maxConsoleLogs: 100 // Max 100 logs
});
```

## Available APIs

Skills have access to a limited set of safe APIs:

### Console
```typescript
console.log(...args)   // Log messages
console.warn(...args)  // Warnings
console.error(...args) // Errors
```

### HTTP
```typescript
fetch(url, options)  // HTTP requests (whitelisted domains only)
```

### Timers
```typescript
setTimeout(callback, ms)   // Schedule delayed execution
setInterval(callback, ms)  // Schedule repeated execution
clearTimeout(id)           // Cancel timeout
clearInterval(id)          // Cancel interval
```

### Built-in Objects
```typescript
Promise  // Async operations
JSON     // JSON parsing and stringification
Math     // Math operations
Date     // Date and time
Array    // Array utilities
Object   // Object utilities
String   // String utilities
Number   // Number utilities
Boolean  // Boolean utilities
```

## Execution Result

```typescript
interface SkillResult {
  /** Whether execution succeeded */
  success: boolean;

  /** Result data (if successful) */
  result?: unknown;

  /** Error message (if failed) */
  error?: string;

  /** Error details for debugging */
  errorDetails?: {
    type: string;
    message: string;
    stack?: string;
  };

  /** Resource usage metrics */
  metrics?: ResourceMetrics;

  /** Execution logs */
  logs?: string[];
}
```

## Metrics

Detailed metrics are collected for every execution:

```typescript
interface ResourceMetrics {
  executionTime: number;  // Execution time in ms
  memoryUsed: number;     // Memory used in bytes
  cpuTime: number;        // CPU time in ms
  apiCalls: {
    http: number;         // Number of HTTP calls
    console: number;      // Number of console logs
    total: number;        // Total API calls
  };
  startedAt: Date;        // Start timestamp
  endedAt: Date;          // End timestamp
}
```

## Audit Logging

Track all skill executions with audit logs:

```typescript
const sandbox = new SkillSandbox({
  auditLog: true,
  onAuditLog: (event) => {
    console.log('Audit Event:', {
      type: event.type,
      timestamp: event.timestamp,
      details: event.details
    });
  }
});

sandbox.on('audit', (event) => {
  // Alternative: listen to audit events
  console.log('Audit:', event);
});
```

## Error Handling

The sandbox catches and returns all errors:

```typescript
const result = await sandbox.execute(code, context);

if (!result.success) {
  console.error('Error:', result.error);

  if (result.errorDetails) {
    console.error('Type:', result.errorDetails.type);
    console.error('Message:', result.errorDetails.message);
    console.error('Stack:', result.errorDetails.stack);
  }
}
```

### Error Types

- `SandboxViolationError`: Security violation detected
- `ResourceLimitError`: Resource limit exceeded
- Standard JavaScript errors: `Error`, `TypeError`, `ReferenceError`, etc.

## Advanced Usage

### Dynamic Configuration

```typescript
const sandbox = new SkillSandbox({ timeout: 5000 });

// Update configuration for specific execution
sandbox.updateConfig({
  timeout: 10000,
  allowedDomains: ['api.stripe.com']
});

const result = await sandbox.execute(code, context);
```

### Concurrent Execution

```typescript
const sandbox = new SkillSandbox();

const promises = skillCodes.map(code =>
  sandbox.execute(code, context)
);

const results = await Promise.all(promises);
```

## Best Practices

1. **Use Minimal Permissions**: Only whitelist domains that are absolutely necessary
2. **Set Conservative Limits**: Start with strict limits and relax as needed
3. **Enable Audit Logging**: Track all executions for security monitoring
4. **Handle Errors Gracefully**: Always check `result.success` before using `result.result`
5. **Review Metrics**: Monitor resource usage to detect anomalies
6. **Update Regularly**: Keep the sandbox package updated for latest security fixes

## Security Considerations

- Skills run in isolated VM2 environment (not a true OS-level sandbox)
- Resource limits are enforced but may have minor accuracy variations
- Domain whitelisting prevents most data exfiltration attempts
- Regular security audits recommended for production usage
- Consider additional OS-level sandboxing for maximum security

## License

MIT

## Support

- **Issues**: https://github.com/svend4/info7/issues
- **Security**: security@leonardo-ai.org
- **Documentation**: https://github.com/svend4/info7/tree/main/openclaw-security
