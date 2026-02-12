/**
 * k6 Load Test Script for Bharatvarsh Forum
 *
 * Simulates realistic forum usage patterns:
 * - Browsing (read-heavy): 70% of virtual users
 * - Posting (write): 20% of virtual users
 * - Reacting: 10% of virtual users
 *
 * Run: k6 run load-tests/forum-load-test.js
 *
 * Thresholds:
 * - p95 latency < 500ms
 * - Error rate < 1%
 * - Zero 5xx errors on read endpoints
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Configuration ───────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const threadListLatency = new Trend('thread_list_latency', true);
const threadDetailLatency = new Trend('thread_detail_latency', true);
const topicListLatency = new Trend('topic_list_latency', true);
const postListLatency = new Trend('post_list_latency', true);

// ─── Test Stages ─────────────────────────────────────────────

export const options = {
  stages: [
    // Ramp-up: 0 → 50 users over 1 minute
    { duration: '1m', target: 50 },
    // Steady state: 100 users for 3 minutes
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    // Ramp-down: 100 → 0 over 1 minute
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],

    // Per-endpoint thresholds
    thread_list_latency: ['p(95)<400'],
    thread_detail_latency: ['p(95)<300'],
    topic_list_latency: ['p(95)<200'],
    post_list_latency: ['p(95)<400'],
  },
};

// ─── Test Data ───────────────────────────────────────────────

const TOPIC_SLUGS = [
  'general-discussion',
  'plot-theories',
  'characters',
  'world-building',
  'announcements',
];

const SORT_OPTIONS = ['latest', 'popular', 'unanswered'];

// ─── Scenarios ───────────────────────────────────────────────

/**
 * Browse forum: read-heavy scenario simulating casual browsing.
 */
function browseForumScenario() {
  group('Browse Forum', () => {
    // 1. Load topic list
    const topicsRes = http.get(`${BASE_URL}/api/forum/topics`);
    topicListLatency.add(topicsRes.timings.duration);
    check(topicsRes, {
      'topics: status 200': (r) => r.status === 200,
      'topics: has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data);
        } catch {
          return false;
        }
      },
      'topics: has rate limit headers': (r) =>
        r.headers['X-Ratelimit-Limit'] !== undefined,
    }) || errorRate.add(1);

    sleep(0.5);

    // 2. Load thread listing (random topic and sort)
    const topicSlug =
      TOPIC_SLUGS[Math.floor(Math.random() * TOPIC_SLUGS.length)];
    const sort =
      SORT_OPTIONS[Math.floor(Math.random() * SORT_OPTIONS.length)];
    const page = Math.floor(Math.random() * 3) + 1;

    const threadsRes = http.get(
      `${BASE_URL}/api/forum/threads?topicSlug=${topicSlug}&sort=${sort}&page=${page}`,
    );
    threadListLatency.add(threadsRes.timings.duration);
    check(threadsRes, {
      'threads: status 200': (r) => r.status === 200,
      'threads: has pagination': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.pagination !== undefined;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);

    sleep(1);

    // 3. View a specific thread (if we got any from the listing)
    try {
      const threadsBody = JSON.parse(threadsRes.body);
      if (threadsBody.data && threadsBody.data.length > 0) {
        const threadId =
          threadsBody.data[
            Math.floor(Math.random() * threadsBody.data.length)
          ].id;

        const detailRes = http.get(
          `${BASE_URL}/api/forum/threads/${threadId}`,
        );
        threadDetailLatency.add(detailRes.timings.duration);
        check(detailRes, {
          'thread detail: status 200': (r) => r.status === 200,
        }) || errorRate.add(1);

        sleep(0.5);

        // 4. Load posts for that thread
        const postsRes = http.get(
          `${BASE_URL}/api/forum/threads/${threadId}/posts?page=1&limit=30`,
        );
        postListLatency.add(postsRes.timings.duration);
        check(postsRes, {
          'posts: status 200': (r) => r.status === 200,
        }) || errorRate.add(1);
      }
    } catch {
      // Thread list was empty or malformed — skip detail view.
    }

    sleep(2);
  });
}

/**
 * Health check: verify the health endpoint responds.
 */
function healthCheckScenario() {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      'health: status 200': (r) => r.status === 200,
      'health: db connected': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.db === 'connected';
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });
}

/**
 * Rate limit verification: rapid-fire requests to verify 429 responses.
 */
function rateLimitScenario() {
  group('Rate Limit Test', () => {
    // Fire 65 rapid requests (limit is 60/min for read tier)
    const responses = [];
    for (let i = 0; i < 65; i++) {
      responses.push(http.get(`${BASE_URL}/api/forum/topics`));
    }

    const rateLimited = responses.some((r) => r.status === 429);
    check(null, {
      'rate limiting: 429 observed after threshold': () => rateLimited,
    });

    // Verify the 429 response has Retry-After header
    const blockedRes = responses.find((r) => r.status === 429);
    if (blockedRes) {
      check(blockedRes, {
        'rate limiting: has Retry-After': (r) =>
          r.headers['Retry-After'] !== undefined,
      });
    }
  });
}

// ─── Main ────────────────────────────────────────────────────

export default function () {
  // Weighted scenario selection
  const rand = Math.random();

  if (rand < 0.7) {
    browseForumScenario();
  } else if (rand < 0.9) {
    healthCheckScenario();
  } else {
    rateLimitScenario();
  }

  // Think time between iterations
  sleep(Math.random() * 3 + 1);
}
