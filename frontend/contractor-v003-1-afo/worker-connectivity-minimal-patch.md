# Minimal Worker patch instructions

This note preserves the current full v003 visual Worker. Do not replace the public or admin HTML/CSS with a simplified shell.

Apply only these source edits to `apps/contractor-v003-1-afo/src/worker.js`:

## Helper functions to add before `export default`

```js
async function countIndexedRows(env, table) {
  try {
    const row = await dbFirst(env, `SELECT COUNT(*) as c FROM ${table} WHERE vector_status='indexed