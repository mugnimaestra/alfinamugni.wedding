import type { Env } from '../../src/lib/database';

/**
 * Mock D1 Database for testing
 */
export class MockD1Database implements D1Database {
  private data: Map<string, any[]> = new Map();

  prepare(query: string) {
    return {
      bind: (...params: any[]) => ({
        run: async () => ({ success: true, meta: { last_row_id: 1 } }),
        first: async () => this.data.get('photos')?.[0] || null,
        all: async () => ({ results: this.data.get('photos') || [] }),
      }),
      run: async () => ({ success: true, meta: { last_row_id: 1 } }),
      first: async () => this.data.get('photos')?.[0] || null,
      all: async () => ({ results: this.data.get('photos') || [] }),
    };
  }

  batch(statements: any[]) {
    return Promise.resolve(
      statements.map(() => ({ success: true, results: [] }))
    ) as any;
  }

  exec(query: string) {
    return Promise.resolve({ count: 0, duration: 0 }) as any;
  }

  dump() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  // Helper methods for testing
  setData(table: string, data: any[]) {
    this.data.set(table, data);
  }

  getData(table: string) {
    return this.data.get(table) || [];
  }

  clear() {
    this.data.clear();
  }
}

/**
 * Mock R2 Bucket for testing
 */
export class MockR2Bucket implements R2Bucket {
  private objects: Map<string, { data: ArrayBuffer; metadata: R2Object }> = new Map();

  async head(key: string): Promise<R2Object | null> {
    const obj = this.objects.get(key);
    return obj?.metadata || null;
  }

  async get(key: string): Promise<R2ObjectBody | null> {
    const obj = this.objects.get(key);
    if (!obj) return null;

    return {
      ...obj.metadata,
      body: obj.data as any,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(obj.data),
      text: () => Promise.resolve(new TextDecoder().decode(obj.data)),
      json: () => Promise.resolve(JSON.parse(new TextDecoder().decode(obj.data))),
      blob: () => Promise.resolve(new Blob([obj.data])),
    } as R2ObjectBody;
  }

  async put(key: string, value: ArrayBuffer | ReadableStream | string, options?: R2PutOptions): Promise<R2Object> {
    const data = typeof value === 'string' ? new TextEncoder().encode(value) : value instanceof ArrayBuffer ? value : new ArrayBuffer(0);

    const metadata: R2Object = {
      key,
      version: '1',
      size: data instanceof ArrayBuffer ? data.byteLength : 0,
      etag: Math.random().toString(36),
      httpEtag: Math.random().toString(36),
      checksums: {},
      uploaded: new Date(),
      httpMetadata: options?.httpMetadata,
      customMetadata: options?.customMetadata,
      range: undefined,
      storageClass: 'STANDARD',
      writeHttpMetadata: () => undefined as any,
    };

    this.objects.set(key, { data: data as ArrayBuffer, metadata });
    return metadata;
  }

  async delete(keys: string | string[]): Promise<void> {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach(key => this.objects.delete(key));
  }

  async list(options?: R2ListOptions): Promise<R2Objects> {
    const keys = Array.from(this.objects.keys());
    return {
      objects: keys.map(key => this.objects.get(key)!.metadata),
      truncated: false,
      cursor: undefined,
      delimitedPrefixes: [],
    };
  }

  createMultipartUpload(key: string, options?: R2MultipartOptions): Promise<R2MultipartUpload> {
    throw new Error('Multipart upload not implemented in mock');
  }

  resumeMultipartUpload(key: string, uploadId: string): R2MultipartUpload {
    throw new Error('Multipart upload not implemented in mock');
  }

  // Helper methods for testing
  hasObject(key: string): boolean {
    return this.objects.has(key);
  }

  clear() {
    this.objects.clear();
  }
}

/**
 * Mock KV Namespace for testing
 */
export class MockKVNamespace implements KVNamespace<string> {
  private data: Map<string, string> = new Map();

  async get(key: string, options?: Partial<KVNamespaceGetOptions<'text'>>): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async put(key: string, value: string | ReadableStream | ArrayBuffer, options?: KVNamespacePutOptions): Promise<void> {
    const stringValue = typeof value === 'string' ? value : '';
    this.data.set(key, stringValue);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<unknown, string>> {
    return {
      keys: Array.from(this.data.keys()).map(name => ({ name, expiration: undefined, metadata: undefined })),
      list_complete: true,
      cursor: '',
    };
  }

  getWithMetadata: any;

  // Helper for testing
  clear() {
    this.data.clear();
  }
}

/**
 * Create mock Cloudflare environment for testing
 */
export const createMockEnv = (): Env => ({
  DB: new MockD1Database() as any,
  WEDDING_PHOTOS: new MockR2Bucket() as any,
  RATE_LIMITER: new MockKVNamespace() as any,
  RESEND_API_KEY: 'test-resend-key',
  ADMIN_PASSWORD_HASH: 'test-hash',
  ENVIRONMENT: 'test',
});

/**
 * Create mock platform object for Qwik City testing
 */
export const createMockPlatform = () => ({
  env: createMockEnv(),
});
