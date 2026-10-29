# Official report delivery

The server persists official results in `logs/official-report-outbox` before
attempting delivery. Keep that directory on the same persistent volume as battle
logs. Restarting the process resumes queued deliveries. Leaf deduplicates accepted
reports by the stable battle room ID, including retries after lost acknowledgements.

Operator-provisioned settings (no values are stored in Git):

- `OFFICIAL_LOGS_URL`: HTTPS receiver endpoint. Default remains the existing Leaf
  `/officialLogs` endpoint.
- `OFFICIAL_LOGS_SECRET`: shared server/Leaf HMAC secret. If set, all requests are
  signed, including while the receiver is in its transitional legacy mode.
- `OFFICIAL_LOGS_MODE`: `legacy` (existing default) or `authenticated`. Authenticated
  mode refuses to send when the signing secret is absent.

After separate approval to change deployment settings, provision the same strong
secret at both services, deploy sender and receiver support, verify signed delivery,
then set Leaf and the server to `authenticated`. No bearer-only shortcut is used.
Signatures use HMAC-SHA256 over timestamp-in-seconds + `.` + the exact UTF-8 JSON
body. Headers are `x-leaf-timestamp` and `x-leaf-signature`. Leaf requires a timestamp
within five minutes, so the hosts must have working clock synchronization. Each retry
gets a new timestamp/signature; the room ID and result body stay unchanged.

Only a successful HTTP status with JSON `ok: true` removes a report from the queue.
Timeouts (10 seconds), network failures, invalid acknowledgements, 408, 429 and 5xx
retain the report with exponential retry capped at one hour. Redirects are rejected
to avoid forwarding credentials. Other 4xx responses retain a `blocked` record and
emit an actionable warning instead of retrying a permanent rejection forever.

For blocked reports, investigate the HTTP status and correct the configuration or
linked participant data first. During a separately approved maintenance window,
stop the delivery process and remove only `blocked` and reset `nextAttempt` to zero
in the affected queue JSON; keep `body`, the room ID and audit history intact. Then
resume delivery. Never fabricate a new room ID to bypass receiver deduplication.
If enqueue persistence itself failed (for example a full disk), the original battle
JSON remains under the normal log folder for operator recovery; resolve the storage
failure before importing that original report through the same queue.

These source changes do not provision credentials, flip the live receiver mode,
restart hosted services or claim that a deployment is ready.
