import { connect } from '@tidbcloud/serverless';

interface Env {
  TIDB_DATABASE_URL: string;
  IMGBB_API_KEY: string;
  EVENT_CODE: string;
  ADMIN_TOKEN: string;
}

interface FunctionContext {
  request: Request;
  env: Env;
}

interface StoredPhoto {
  url: string;
  deleteUrl: string;
}

interface SubmissionRow {
  id: string;
  guestName: string;
  message: string;
  photosJson: string;
  status: string;
  createdAt: string;
}

interface ScheduleRow {
  acceptanceState: 'upcoming' | 'open' | 'closed';
  wallState: 'upcoming' | 'open' | 'closed';
  openAt: string | null;
  closeAt: string | null;
  wallOpenAt: string | null;
  wallCloseAt: string | null;
  autoApprove: number | string;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

const cleanText = (value: FormDataEntryValue | null, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const isAdmin = (request: Request, env: Env) => {
  const authorization = request.headers.get('Authorization');
  return Boolean(env.ADMIN_TOKEN) && authorization === `Bearer ${env.ADMIN_TOKEN}`;
};

const parsePhotos = (value: string): StoredPhoto[] => {
  try {
    const photos = JSON.parse(value);
    return Array.isArray(photos) ? photos : [];
  } catch {
    return [];
  }
};

async function getSchedule(env: Env) {
  if (!env.TIDB_DATABASE_URL) {
    return { submissionsOpen: false, acceptanceState: 'closed', openAt: null, closeAt: null, wallVisible: false, wallState: 'closed', wallOpenAt: null, wallCloseAt: null, autoApprove: false };
  }

  const database = connect({ url: env.TIDB_DATABASE_URL });
  const rows = (await database.execute(
    `SELECT CASE
       WHEN submissions_open_at IS NOT NULL AND CURRENT_TIMESTAMP < submissions_open_at THEN 'upcoming'
       WHEN submissions_close_at IS NOT NULL AND CURRENT_TIMESTAMP >= submissions_close_at THEN 'closed'
       ELSE 'open'
     END AS acceptanceState,
       CASE
         WHEN wall_open_at IS NOT NULL AND CURRENT_TIMESTAMP < wall_open_at THEN 'upcoming'
         WHEN wall_close_at IS NOT NULL AND CURRENT_TIMESTAMP >= wall_close_at THEN 'closed'
         ELSE 'open'
       END AS wallState,
       submissions_open_at AS openAt,
       submissions_close_at AS closeAt,
       wall_open_at AS wallOpenAt,
       wall_close_at AS wallCloseAt,
       auto_approve AS autoApprove
     FROM guestbook_settings
     WHERE id = 1`,
  )) as ScheduleRow[];
  const row = rows[0];

  return row ? {
    submissionsOpen: row.acceptanceState === 'open',
    acceptanceState: row.acceptanceState,
    openAt: row.openAt,
    closeAt: row.closeAt,
    wallVisible: row.wallState === 'open',
    wallState: row.wallState,
    wallOpenAt: row.wallOpenAt,
    wallCloseAt: row.wallCloseAt,
    autoApprove: Boolean(Number(row.autoApprove)),
  } : { submissionsOpen: false, acceptanceState: 'closed', openAt: null, closeAt: null, wallVisible: false, wallState: 'closed', wallOpenAt: null, wallCloseAt: null, autoApprove: false };
}

async function uploadToImgBB(file: File, apiKey: string): Promise<StoredPhoto> {
  const upload = new FormData();
  upload.set('name', crypto.randomUUID());
  upload.set('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: upload,
  });
  const result = (await response.json()) as {
    success?: boolean;
    data?: { display_url?: string; url?: string; delete_url?: string };
  };

  const url = result.data?.display_url ?? result.data?.url;
  if (!response.ok || !result.success || !url || !result.data?.delete_url) {
    throw new Error('ImgBB rejected the upload.');
  }

  return { url, deleteUrl: result.data.delete_url };
}

async function createSubmission(request: Request, env: Env) {
  if (!env.TIDB_DATABASE_URL || !env.IMGBB_API_KEY || !env.EVENT_CODE) {
    return json({ error: 'The guestbook is not configured yet.' }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'The submitted form could not be read.' }, 400);
  }

  if (cleanText(form.get('eventCode'), 200) !== env.EVENT_CODE) {
    return json({ error: 'This invitation link is not valid.' }, 403);
  }

  const guestName = cleanText(form.get('guestName'), 100);
  const message = cleanText(form.get('message'), 2000);
  const languageCode = cleanText(form.get('languageCode'), 5) || 'en';
  const consentToPublish = form.get('consentToPublish') === 'yes';
  const files = form.getAll('photos').filter((value): value is File => value instanceof File && value.size > 0);

  if (guestName.length < 2 || message.length < 2) {
    return json({ error: 'Please include your name and a message.' }, 400);
  }
  if (files.length > 3) {
    return json({ error: 'Please choose no more than three photos.' }, 400);
  }
  if (!consentToPublish) {
    return json({ error: 'Publishing consent is required.' }, 400);
  }
  if (files.some((file) => file.size > 5_000_000 || !/^image\/(jpeg|png|webp)$/.test(file.type))) {
    return json({ error: 'Photos must be JPEG, PNG, or WebP files under 5 MB.' }, 400);
  }

  let autoApprove = false;
  try {
    const schedule = await getSchedule(env);
    if (!schedule.submissionsOpen) {
      return json({ error: schedule.acceptanceState === 'upcoming' && schedule.openAt ? `Messages open at ${schedule.openAt} UTC.` : 'The guestbook is now closed.' }, 403);
    }
    autoApprove = schedule.autoApprove;
  } catch (error) {
    console.error('Guestbook schedule query failed', error);
    return json({ error: 'The guestbook schedule is temporarily unavailable.' }, 502);
  }

  try {
    const photos: StoredPhoto[] = [];
    for (const file of files) photos.push(await uploadToImgBB(file, env.IMGBB_API_KEY));

    // ponytail: ImgBB has no documented delete API, so a failed DB write can orphan an upload.
    const database = connect({ url: env.TIDB_DATABASE_URL });
    await database.execute(
      `INSERT INTO submissions
         (id, guest_name, message, photos_json, language_code, consent_to_publish,
          status, reviewed_at, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?,
         CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END,
         CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END)`,
      [crypto.randomUUID(), guestName, message, JSON.stringify(photos), languageCode, consentToPublish,
        autoApprove ? 'approved' : 'pending', autoApprove, autoApprove],
    );

    return json({ ok: true }, 201);
  } catch (error) {
    console.error('Guestbook submission failed', error);
    return json({ error: 'The message could not be saved. Please try again.' }, 502);
  }
}

async function getGallery(env: Env) {
  if (!env.TIDB_DATABASE_URL) return json({ posts: [], photos: [] });

  try {
    const schedule = await getSchedule(env);
    if (!schedule.wallVisible) return json({ posts: [], wallState: schedule.wallState, wallOpenAt: schedule.wallOpenAt });
    const database = connect({ url: env.TIDB_DATABASE_URL });
    const rows = (await database.execute(
      `SELECT id, guest_name AS guestName, message, photos_json AS photosJson, created_at AS createdAt
       FROM submissions
       WHERE status IN ('approved', 'featured') AND consent_to_publish = TRUE
       ORDER BY CASE WHEN status = 'featured' THEN 0 ELSE 1 END, created_at DESC
       LIMIT 100`,
    )) as Array<Pick<SubmissionRow, 'id' | 'guestName' | 'message' | 'photosJson' | 'createdAt'>>;

    return json({ posts: rows.map((row) => ({ ...row, photos: parsePhotos(row.photosJson).map(({ url }) => ({ url })), photosJson: undefined })) });
  } catch (error) {
    console.error('Gallery query failed', error);
    return json({ error: 'The wedding wall is temporarily unavailable.' }, 502);
  }
}

async function getPublicSchedule(env: Env) {
  try {
    const { autoApprove: _, ...schedule } = await getSchedule(env);
    return json(schedule);
  } catch (error) {
    console.error('Guestbook schedule query failed', error);
    return json({ error: 'The guestbook schedule is temporarily unavailable.' }, 502);
  }
}

async function getAdminSubmissions(request: Request, env: Env) {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized.' }, 401);

  try {
    const database = connect({ url: env.TIDB_DATABASE_URL });
    const rows = (await database.execute(
      `SELECT id, guest_name AS guestName, message, photos_json AS photosJson,
              status, created_at AS createdAt
       FROM submissions
       ORDER BY created_at DESC
       LIMIT 100`,
    )) as SubmissionRow[];
    const settings = (await database.execute(
      `SELECT auto_approve AS autoApprove,
              submissions_open_at AS submissionsOpenAt,
              submissions_close_at AS submissionsCloseAt,
              wall_open_at AS wallOpenAt,
              wall_close_at AS wallCloseAt
       FROM guestbook_settings WHERE id = 1`,
    )) as Array<{ autoApprove: number | string; submissionsOpenAt: string | null; submissionsCloseAt: string | null; wallOpenAt: string | null; wallCloseAt: string | null }>;
    const setting = settings[0];

    return json({
      settings: setting ? { ...setting, autoApprove: Boolean(Number(setting.autoApprove)) } : null,
      submissions: rows.map(({ photosJson, ...row }) => ({
        ...row,
        photos: parsePhotos(photosJson).map(({ url }) => ({ url })),
      })),
    });
  } catch (error) {
    console.error('Admin query failed', error);
    return json({ error: 'Submissions could not be loaded.' }, 502);
  }
}

async function updateAdminSettings(request: Request, env: Env) {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized.' }, 401);

  let body: { autoApprove?: unknown; submissionsOpenAt?: unknown; submissionsCloseAt?: unknown; wallOpenAt?: unknown; wallCloseAt?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: 'Invalid settings.' }, 400);
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  if (typeof body.autoApprove === 'boolean') {
    updates.push('auto_approve = ?');
    values.push(body.autoApprove);
  }
  for (const [field, column] of [
    ['submissionsOpenAt', 'submissions_open_at'],
    ['submissionsCloseAt', 'submissions_close_at'],
    ['wallOpenAt', 'wall_open_at'],
    ['wallCloseAt', 'wall_close_at'],
  ] as const) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value !== null && typeof value !== 'string') return json({ error: 'Invalid settings.' }, 400);
    if (typeof value === 'string' && Number.isNaN(Date.parse(value))) return json({ error: 'Invalid date.' }, 400);
    updates.push(`${column} = ?`);
    values.push(value === null || value === '' ? null : new Date(value as string).toISOString().slice(0, 19).replace('T', ' '));
  }
  if (!updates.length) return json({ error: 'Invalid settings.' }, 400);

  try {
    const database = connect({ url: env.TIDB_DATABASE_URL });
    await database.execute(`UPDATE guestbook_settings SET ${updates.join(', ')} WHERE id = 1`, values);
    return json({ ok: true });
  } catch (error) {
    console.error('Admin settings update failed', error);
    return json({ error: 'Settings could not be updated.' }, 502);
  }
}

async function updateSubmission(request: Request, env: Env, id: string) {
  if (!isAdmin(request, env)) return json({ error: 'Unauthorized.' }, 401);

  let status = '';
  try {
    status = String(((await request.json()) as { status?: string }).status ?? '');
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (!['approved', 'featured', 'rejected', 'pending'].includes(status)) {
    return json({ error: 'Invalid moderation status.' }, 400);
  }

  try {
    const database = connect({ url: env.TIDB_DATABASE_URL, fullResult: true });
    const result = await database.execute(
      `UPDATE submissions
       SET status = ?,
           reviewed_at = CURRENT_TIMESTAMP,
           approved_at = CASE WHEN ? IN ('approved', 'featured') THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = ?`,
      [status, status, id],
    );
    return result.rowsAffected ? json({ ok: true }) : json({ error: 'Submission not found.' }, 404);
  } catch (error) {
    console.error('Moderation update failed', error);
    return json({ error: 'The submission could not be updated.' }, 502);
  }
}

export const onRequest = async ({ request, env }: FunctionContext): Promise<Response> => {
  const parts = new URL(request.url).pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (request.method === 'POST' && parts.join('/') === 'submissions') return createSubmission(request, env);
  if (request.method === 'GET' && parts.join('/') === 'schedule') return getPublicSchedule(env);
  if (request.method === 'GET' && parts.join('/') === 'gallery') return getGallery(env);
  if (request.method === 'GET' && parts.join('/') === 'admin/submissions') return getAdminSubmissions(request, env);
  if (request.method === 'PATCH' && parts.join('/') === 'admin/settings') return updateAdminSettings(request, env);
  if (request.method === 'PATCH' && parts[0] === 'admin' && parts[1] === 'submissions' && parts[2]) {
    return updateSubmission(request, env, parts[2]);
  }

  return json({ error: 'Not found.' }, 404);
};
