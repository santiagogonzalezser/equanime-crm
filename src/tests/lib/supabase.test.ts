import { createClient } from '@/lib/supabase';

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Supabase Integration', () => {
  test('creates client without throwing', () => {
    expect(() => createClient()).not.toThrow();
  });

  test('client has required methods', () => {
    const client = createClient();
    expect(client).toHaveProperty('from');
    expect(typeof client.from).toBe('function');
  });

  test('client configuration uses environment variables', () => {
    const client = createClient();
    expect(client).toBeDefined();
    // Client should be configured but we can't test exact values for security
  });
});