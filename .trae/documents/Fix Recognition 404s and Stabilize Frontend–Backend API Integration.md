## Diagnosis
- Verify backend route mappings: recognition lives at `POST /api/recognize` (prefix `/api` + router prefix `/recognize`) and enrollment at `POST /api/enrollment/enroll`, `DELETE /api/enrollment/delete/{name}`, `DELETE /api/enrollment/clear`.
- Inspect frontend API client usage in `src/lib/api.ts` and calling code in `src/components/recognition/live-feed.tsx` for path/method mismatches and host differences (`localhost` vs `127.0.0.1`).
- Confirm backend receives requests and respond codes by cURL for the exact paths used by the frontend, and review backend logs for 404s during webcam recognition loops.

## Implementation
- Update `src/lib/api.ts` to:
  - Use env `NEXT_PUBLIC_API_URL` and provide resilient host fallback between `127.0.0.1` and `localhost`.
  - Keep path fallbacks for legacy routes, but make `/api/recognize` the primary.
  - Stop manually setting `Content-Type` for FormData (let axios set boundaries) to avoid server rejection.
  - Add a lightweight `ping`/status call helper used by the Live page before starting recognition to fail fast with a clear message if the backend is offline.
- Adjust `LiveFeed`:
  - On Start Recognition, run the status check first; if 404/ERR, surface a clear error and do not start the loop.
  - Ensure the form field name is exactly `file` and the request is `POST`.
- Add `.env.local` in `frontend/` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` (or `localhost`), and document that users can change hosts/ports without code edits.

## Validation
- Restart backend and frontend separately; confirm `GET /api/status` hits via the frontend API client.
- In the Live page, start camera and start recognition; observe successful `200` responses and overlays drawn.
- Enroll one test face via Quick Enrollment, then run recognition to see green-labeled matches and attendance written to `backend/data/processed/attendance.csv`.
- Confirm CORS works with both `localhost:3000` and `127.0.0.1:3000`.

## Modularity & Maintainability
- Centralize all backend interaction in `src/lib/api.ts` so hosts/paths can be swapped by environment only.
- Keep small, replaceable helpers (`utils.ts`) for UI formatting.

## Deliverables
- Updated `src/lib/api.ts` (robust base URL, path/method fixes, FormData handling, status helper)
- Updated `LiveFeed` to preflight-check status and improve error handling
- Frontend `.env.local` with `NEXT_PUBLIC_API_URL`
- Verified working end-to-end recognition and attendance logging