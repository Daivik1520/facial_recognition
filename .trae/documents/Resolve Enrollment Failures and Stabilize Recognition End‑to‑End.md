## Diagnosis
- Enrollment fails with a generic frontend error, likely due to backend returning 400 when no faces are detected or image decoding issues.
- Recognition previously returned 404s from path mismatches; those were addressed, but enrollment still fails under real webcam images.
- Backend uses OpenCV `imdecode` which ignores EXIF orientation; mobile/webcam JPEGs can carry orientation, causing face detection to miss.
- InsightFace model loading depends on default cache; if models aren’t found or downloaded, detection silently yields no faces.

## Backend Fixes
### 1) Reliable Model Loading
- Set `INSIGHTFACE_HOME` to `backend/data/models/models` before creating `FaceAnalysis` so InsightFace uses the local Buffalo_L models.
- Add a verification step that checks the ONNX files exist; log a clear error if missing.

### 2) Robust Image Decoding
- Replace raw OpenCV decoding with PIL-based decoding that respects EXIF orientation, then convert to BGR for InsightFace:
  - Read bytes via PIL `Image.open(BytesIO(...))`
  - Apply orientation fixes
  - Convert to RGB then `cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)`
  - Fallback to OpenCV if PIL fails

### 3) Detection Tuning and Diagnostics
- Lower `det_thresh` from 0.6 to 0.45 (config-driven) to detect smaller/less clear faces.
- Use settings for `min_face_size`, `similarity_threshold` to make it modular.
- Log per-image diagnostics: decoded size, number of faces, and why enrollment failed; include counts in error responses.
- On enrollment failure, return `422` with detail: `{"error":"No faces detected","images_processed":N}` instead of a generic 400.

## Frontend Fixes
### 4) Precise Error Reporting
- In Quick and Guided Enrollment, display backend `error` or `detail` from the response instead of the generic message.
- Keep recognition and enrollment FormData field names exactly as backend expects (`file` for recognize, repeated `files` for enroll).

### 5) Configuration
- Add `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` to pin the host; document switch to `localhost` if needed.

## Modularity
- Centralize detection thresholds and sizes in `src/core/config.py` and read them in `FaceRecognitionSystem` (no hardcoding).
- Keep `src/lib/api.ts` as the single integration layer; any endpoint changes are isolated there.

## Files to Update
- `backend/src/face_system.py`: set `INSIGHTFACE_HOME`, use settings, lower `det_thresh`, add diagnostics.
- `backend/src/app/utils.py`: PIL+EXIF-aware decoding with BGR output, fallback to OpenCV.
- `backend/src/app/routes/enrollment.py`: return 422 with descriptive `detail` when no faces are detected; include processed counts.
- `frontend/src/components/enrollment/quick-enrollment.tsx`: show server error detail from response.
- `frontend/src/components/enrollment/guided-enrollment.tsx`: same improved error display.
- `frontend/.env.local`: set `NEXT_PUBLIC_API_URL`.

## Validation
- Restart backend and confirm models are recognized on startup.
- cURL tests:
  - `POST /api/recognize` with a demo image → returns `faces` list or `count=0` without errors.
  - `POST /api/enrollment/enroll` with 1–2 face images → returns success JSON; failure returns `422` with counts.
- Live page:
  - Quick Enrollment → success and UI confirmation.
  - Start Recognition → overlays and attendance logging.

## Rollback/Safety
- Changes are localized and configurable; thresholds editable via env.
- Diagnostics do not leak sensitive data; logs are app-local.

If you approve, I will implement these backend and frontend updates and verify the full flow with real webcam captures and sample images.