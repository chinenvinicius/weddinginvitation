import assert from 'node:assert/strict';
import { File as NodeFile } from 'node:buffer';
import test from 'node:test';
import { onRequest } from '../functions/api/[[path]]';
import worker from '../worker';
import { decryptApiKeys, encryptApiKeys, translateWithRotation } from '../functions/api/translation';

Object.defineProperty(globalThis, 'File', { value: NodeFile });

const noopWaitUntil = () => {};

const env = {
  TIDB_DATABASE_URL: 'mysql://unused',
  IMGBB_API_KEY: 'unused',
  EVENT_CODE: 'correct-event-code',
  ADMIN_TOKEN: 'admin-token',
};

test('rejects a submission with the wrong event code before external calls', async () => {
  const form = new FormData();
  form.set('eventCode', 'wrong-event-code');
  form.set('guestName', 'Guest');
  form.set('message', 'Congratulations!');

  const response = await onRequest({
    request: new Request('https://wedding.example/api/submissions', {
      method: 'POST',
      body: form,
    }),
    env,
    waitUntil: noopWaitUntil,
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'This invitation link is not valid.' });
});

test('returns an empty public gallery while the database is not configured', async () => {
  const response = await onRequest({
    request: new Request('https://wedding.example/api/gallery'),
    env: { ...env, TIDB_DATABASE_URL: '' },
    waitUntil: noopWaitUntil,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { posts: [], photos: [] });
});

test('reports a closed schedule while the database is not configured', async () => {
  const response = await onRequest({
    request: new Request('https://wedding.example/api/schedule'),
    env: { ...env, TIDB_DATABASE_URL: '' },
    waitUntil: noopWaitUntil,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    submissionsOpen: false,
    acceptanceState: 'closed',
    openAt: null,
    closeAt: null,
    wallVisible: false,
    wallState: 'closed',
    wallOpenAt: null,
    wallCloseAt: null,
  });
});

test('protects automatic-approval settings with the admin token', async () => {
  const response = await onRequest({
    request: new Request('https://wedding.example/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoApprove: true }),
    }),
    env,
    waitUntil: noopWaitUntil,
  });

  assert.equal(response.status, 401);
});

test('requires explicit consent when a submission contains a photo', async () => {
  const form = new FormData();
  form.set('eventCode', env.EVENT_CODE);
  form.set('guestName', 'Guest');
  form.set('message', 'Congratulations!');
  form.set('consentToPublish', 'no');
  form.set('photos', new File(['photo'], 'wedding.jpg', { type: 'image/jpeg' }));

  const response = await onRequest({
    request: new Request('https://wedding.example/api/submissions', {
      method: 'POST',
      body: form,
    }),
    env,
    waitUntil: noopWaitUntil,
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Publishing consent is required.' });
});

test('worker routes API requests to the guestbook backend', async () => {
  const response = await worker.fetch(new Request('https://wedding.example/api/schedule'), {
    ...env,
    TIDB_DATABASE_URL: '',
    ASSETS: { fetch: async () => new Response('asset') },
  }, { waitUntil: noopWaitUntil });

  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.equal((await response.json() as { wallVisible: boolean }).wallVisible, false);
});

test('worker delegates page requests to static assets', async () => {
  const response = await worker.fetch(new Request('https://wedding.example/admin'), {
    ...env,
    ASSETS: { fetch: async () => new Response('wedding invitation') },
  }, { waitUntil: noopWaitUntil });

  assert.equal(await response.text(), 'wedding invitation');
});

test('translation API keys are encrypted at rest and can be recovered', async () => {
  const keys = ['first-key', 'second-key'];
  const encrypted = await encryptApiKeys(keys, env.ADMIN_TOKEN);

  assert.equal(encrypted.includes(keys[0]), false);
  assert.deepEqual(await decryptApiKeys(encrypted, env.ADMIN_TOKEN), keys);
});

test('translation retries with the next API key', async () => {
  const originalFetch = globalThis.fetch;
  const usedKeys: string[] = [];
  globalThis.fetch = async (_input, init) => {
    usedKeys.push(new Headers(init?.headers).get('Authorization') ?? '');
    if (usedKeys.length === 1) return Response.json({ error: { message: 'rate limited' } }, { status: 429 });
    return Response.json({ choices: [{ message: { content: JSON.stringify({
      sourceLanguage: 'en',
      translations: { en: 'Welcome!', ja: 'ようこそ！', ceb: 'Maayong pag-abot!', tl: 'Maligayang pagdating!', pt: 'Bem-vindo!' },
    }) } }] });
  };

  try {
    const result = await translateWithRotation({ provider: 'nvidia', model: 'test', baseUrl: '', apiKeys: ['one', 'two'], startAt: 0, message: 'Welcome!' });
    assert.deepEqual(usedKeys, ['Bearer one', 'Bearer two']);
    assert.equal(result.translations.en, 'Welcome!');
    assert.equal(result.nextKey, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
