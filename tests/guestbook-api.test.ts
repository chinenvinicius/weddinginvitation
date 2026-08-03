import assert from 'node:assert/strict';
import { File as NodeFile } from 'node:buffer';
import test from 'node:test';
import { onRequest } from '../functions/api/[[path]]';

Object.defineProperty(globalThis, 'File', { value: NodeFile });

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
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'This invitation link is not valid.' });
});

test('returns an empty public gallery while the database is not configured', async () => {
  const response = await onRequest({
    request: new Request('https://wedding.example/api/gallery'),
    env: { ...env, TIDB_DATABASE_URL: '' },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { posts: [], photos: [] });
});

test('reports a closed schedule while the database is not configured', async () => {
  const response = await onRequest({
    request: new Request('https://wedding.example/api/schedule'),
    env: { ...env, TIDB_DATABASE_URL: '' },
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
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Publishing consent is required.' });
});
