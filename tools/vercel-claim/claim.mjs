#!/usr/bin/env node
/**
 * vercel-claim — initiate a Vercel project transfer request and print a "claim" URL.
 *
 * The printed URL lets an external party take ownership of the project into THEIR own
 * Vercel account: they open it in a browser to complete the transfer. This tool only
 * CREATES the transfer request; it does not perform the accept step (Vercel handles the
 * accept, plus any domain / env-var / integration migration, during the claim).
 *
 * Auth (required):
 *   VERCEL_TOKEN   A Vercel access token, sent as `Authorization: Bearer <token>`.
 *                  Read ONLY from the environment — never hardcoded, printed, logged, or
 *                  written to disk. `--dry-run` shows `Bearer <redacted>`, never the value.
 *
 * Usage:
 *   node claim.mjs --project <idOrName> [--team <teamIdOrSlug>] [--return-url <url>] [--dry-run]
 *
 * Flags:
 *   --project <idOrName>    (required) the project to transfer (id or name).
 *   --team <teamIdOrSlug>   the team that owns the project; omit for personal-scope
 *                           projects. Values starting with "team_" are sent as ?teamId=,
 *                           anything else as ?slug=.
 *   --return-url <url>      where Vercel returns the recipient after they claim
 *                           (URL-encoded into the claim link).
 *   --dry-run               print the request that WOULD be made (endpoint, query params,
 *                           and that an auth header is present) and make zero network calls.
 *   --help, -h              show usage.
 *
 * Advanced:
 *   VERCEL_API_VERSION      override the API version segment (default "v9").
 *
 * Run a REAL transfer (always dry-run first):
 *   export VERCEL_TOKEN=xxxxxxxxxxxxxxxx
 *   node tools/vercel-claim/claim.mjs --project my-project --team team_abc --return-url https://example.com/done --dry-run
 *   node tools/vercel-claim/claim.mjs --project my-project --team team_abc --return-url https://example.com/done
 *
 * The returned code is valid for 24 hours.
 *
 * Endpoint verified against the official Vercel SDK generated docs
 * (vercel/sdk -> docs/sdks/projects/README.md, checked 2026-06-05):
 *   POST /v9/projects/{idOrName}/transfer-request  ->  { "code": "<uuid>" }
 */

import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export const API_VERSION = 'v9';
const API_BASE = 'https://api.vercel.com';
const CLAIM_BASE = 'https://vercel.com/claim-deployment';
const ERROR_BODY_MAX = 500;

// Distinct, stable exit codes (kept < 126 to avoid shell-reserved codes).
export const EXIT = Object.freeze({
  SUCCESS: 0,
  USAGE: 1,
  NO_TOKEN: 2,
  UNAUTHORIZED: 3,
  FORBIDDEN: 4,
  NOT_FOUND: 5,
  HTTP_OTHER: 6,
  NETWORK: 7,
  BAD_SUCCESS: 8,
});

const USAGE = `vercel-claim — create a Vercel project transfer request and print a claim URL

Usage:
  node claim.mjs --project <idOrName> [--team <teamIdOrSlug>] [--return-url <url>] [--dry-run]

Flags:
  --project <idOrName>    (required) project to transfer (id or name)
  --team <teamIdOrSlug>   team that owns the project; omit for personal-scope projects
  --return-url <url>      where Vercel returns the recipient after they claim
  --dry-run               print the request that would be made; make no network call
  --help, -h              show this help

Environment:
  VERCEL_TOKEN            (required) Vercel access token, sent as a Bearer header. Never printed.
  VERCEL_API_VERSION      optional API version segment (default ${API_VERSION})

The returned code is valid for 24 hours.`;

/**
 * Parse argv without ever throwing: a bad/unknown flag becomes { error } so the
 * caller can emit a usage error instead of crashing past run().
 */
export function parseCliArgs(argv) {
  try {
    const { values } = parseArgs({
      args: argv,
      strict: true,
      allowPositionals: false,
      options: {
        project: { type: 'string' },
        team: { type: 'string' },
        'return-url': { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
    return { values };
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
}

/** Build the transfer-request endpoint { url, method }. Team is optional. */
export function buildEndpoint({ project, team, apiVersion = API_VERSION, base = API_BASE }) {
  const url = new URL(`${base}/${apiVersion}/projects/${encodeURIComponent(project)}/transfer-request`);
  const t = typeof team === 'string' ? team.trim() : '';
  if (t) {
    // Vercel team IDs are prefixed "team_"; slugs never are.
    if (t.startsWith('team_')) url.searchParams.set('teamId', t);
    else url.searchParams.set('slug', t);
  }
  return { url: url.toString(), method: 'POST' };
}

/** Build the browser claim URL the recipient opens. returnUrl is optional. */
export function buildClaimUrl(code, returnUrl) {
  const url = new URL(CLAIM_BASE);
  url.searchParams.set('code', code);
  const r = typeof returnUrl === 'string' ? returnUrl.trim() : '';
  if (r) url.searchParams.set('returnUrl', r);
  return url.toString();
}

/** Human-readable preview for --dry-run. Never includes the token value. */
export function describeRequest({ method, url }) {
  return [
    'DRY RUN — no request will be sent.',
    `  ${method} ${url}`,
    '  Headers:',
    '    Authorization: Bearer <redacted>',
    '    Accept: application/json',
  ].join('\n');
}

function emit(stderr, code, message) {
  stderr.write(message + '\n');
  return code;
}

/**
 * Orchestrate one invocation. Returns an exit code; never calls process.exit and
 * never throws (network/parse failures are mapped to codes). fetchImpl is injected
 * so tests can run with zero live network calls.
 */
export async function run(
  argv,
  { env = {}, fetchImpl = globalThis.fetch, stdout = process.stdout, stderr = process.stderr } = {},
) {
  const { values, error } = parseCliArgs(argv);
  if (error) {
    return emit(stderr, EXIT.USAGE, `Error: ${error}\n\n${USAGE}`);
  }
  if (values.help) {
    stdout.write(USAGE + '\n');
    return EXIT.SUCCESS;
  }

  const project = typeof values.project === 'string' ? values.project.trim() : '';
  if (!project) {
    return emit(stderr, EXIT.USAGE, `Error: --project <idOrName> is required.\n\n${USAGE}`);
  }

  // Read the token ONLY from the environment; treat blank as missing.
  const token = typeof env.VERCEL_TOKEN === 'string' ? env.VERCEL_TOKEN.trim() : '';
  if (!token) {
    return emit(
      stderr,
      EXIT.NO_TOKEN,
      'Error: VERCEL_TOKEN is not set. Export a Vercel access token and try again.',
    );
  }

  const apiVersion =
    (typeof env.VERCEL_API_VERSION === 'string' && env.VERCEL_API_VERSION.trim()) || API_VERSION;
  const { url, method } = buildEndpoint({ project, team: values.team, apiVersion });

  if (values['dry-run']) {
    stdout.write(describeRequest({ method, url }) + '\n');
    return EXIT.SUCCESS;
  }

  let res;
  try {
    res = await fetchImpl(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    // Only the message — never the request/headers object (which carries the token).
    return emit(stderr, EXIT.NETWORK, `Error: network request failed: ${err?.message ?? err}`);
  }

  const status = res.status;

  if (status >= 200 && status < 300) {
    let data;
    try {
      data = await res.json();
    } catch {
      return emit(
        stderr,
        EXIT.BAD_SUCCESS,
        `Error: transfer request returned ${status} but the response body was not valid JSON.`,
      );
    }
    const code = data && typeof data.code === 'string' ? data.code.trim() : '';
    if (!code) {
      return emit(
        stderr,
        EXIT.BAD_SUCCESS,
        `Error: transfer request succeeded (${status}) but no "code" was returned.`,
      );
    }
    stdout.write(buildClaimUrl(code, values['return-url']) + '\n');
    stdout.write(
      'This code expires in 24 hours. Share the URL above with the recipient to complete the transfer.\n',
    );
    return EXIT.SUCCESS;
  }

  if (status === 401) {
    return emit(stderr, EXIT.UNAUTHORIZED, 'Error: 401 Unauthorized — VERCEL_TOKEN is invalid or expired.');
  }
  if (status === 403) {
    return emit(
      stderr,
      EXIT.FORBIDDEN,
      "Error: 403 Forbidden — you must be an owner of the project's team to transfer it.",
    );
  }
  if (status === 404) {
    return emit(
      stderr,
      EXIT.NOT_FOUND,
      'Error: 404 Not Found — project not found. If it belongs to a team, pass --team <teamIdOrSlug>.',
    );
  }

  // Any other non-2xx: surface status + the server's error message (or raw body).
  let detail = '';
  try {
    detail = await res.text();
  } catch {
    detail = '';
  }
  let message = '';
  if (detail) {
    try {
      message = JSON.parse(detail)?.error?.message ?? '';
    } catch {
      message = detail;
    }
  }
  message = message || '<empty body>';
  if (message.length > ERROR_BODY_MAX) message = message.slice(0, ERROR_BODY_MAX) + '…';
  return emit(stderr, EXIT.HTTP_OTHER, `Error: transfer request failed with HTTP ${status}: ${message}`);
}

// Run only when executed directly (not when imported by tests). `import.meta.main`
// is used when available; the pathToFileURL comparison is the portable fallback.
const isMain =
  import.meta.main ?? (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href);

if (isMain) {
  run(process.argv.slice(2), {
    env: process.env,
    fetchImpl: globalThis.fetch,
    stdout: process.stdout,
    stderr: process.stderr,
  })
    .then((code) => {
      // Set exitCode (don't call process.exit) so buffered stdout — the claim URL — flushes.
      process.exitCode = code;
    })
    .catch((err) => {
      process.stderr.write(`Error: ${err?.message ?? err}\n`);
      process.exitCode = EXIT.USAGE;
    });
}
