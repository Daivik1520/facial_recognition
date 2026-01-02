## Overview
Enhance enrollment to capture class and roll number for each person and make attendance searchable/filterable by class or roll number. Keep changes modular so data storage and UI can be swapped easily.

## Backend Changes
### Data Model & Storage
- Create a lightweight person registry maintained by `FaceRecognitionSystem`:
  - Map: `name -> { class_name, roll_no }`
  - Persist to `data/processed/person_registry.json` (separate from embeddings for modularity)
- Extend attendance CSV headers to include `Class` and `RollNo`; preserve backward compatibility when reading older files.

### API & Schemas
- Update `schemas.py` with:
  - `EnrollmentRequest` (form fields): `name`, `class_name`, `roll_no`, plus existing options
  - `AttendanceRecord` including `class_name` and `roll_no`
  - `AttendanceRecordsResponse` for records endpoint
- Update `POST /api/enroll` to accept `class_name` and `roll_no`:
  - Validate presence; register metadata before/after successful enrollment
- Update attendance logging to include `class_name` and `roll_no` via `FaceRecognitionSystem.log_attendance`
- Add filtering to records endpoint:
  - `GET /api/attendance/records?class_name=&roll_no=` (both optional)
  - Filter records server-side and return matching list

### Implementation Points
- `FaceRecognitionSystem`:
  - Add `person_registry_file` and `person_info` dict
  - Methods: `set_person_info(name, class_name, roll_no)`, `get_person_info(name)`
  - Ensure writes on enrollment and reads when logging attendance
- `routes/enrollment.py`:
  - Accept new form fields and call `set_person_info`
- `routes/status.py`:
  - Update `get_attendance_records` to support query params and include new columns

## Frontend Changes
### Enrollment UI
- Quick Enrollment: add inputs for `Class` and `Roll No`, append to `FormData` (`class_name`, `roll_no`)
- Guided Enrollment: same inputs and form submission adjustments

### Attendance UI
- Add a simple filter bar at top:
  - Text inputs/selects for `Class` and `Roll No`
  - Call records endpoint with query params; display filtered results

### API Client
- Extend `endpoints.attendanceRecords({ class_name?, roll_no? })` to build query string
- Extend enrollment request builder to include `class_name` and `roll_no`

## Validation
- Enroll a user with class and roll no (Quick and Guided)
- Verify attendance logs include Class and RollNo
- Use attendance page search to filter by class or roll no

## Modularity
- Person registry separated from embeddings; storage paths configurable
- Filters implemented server-side; UI components remain replaceable

## Deliverables
- Backend: updated `schemas.py`, `face_system.py`, `routes/enrollment.py`, `routes/status.py`
- Frontend: updated Quick/Guided Enrollment components, Attendance table and filter UI, `src/lib/api.ts`
- Tests/verification: cURL + manual UI checks

If you approve, I will implement these backend and frontend updates and then verify end-to-end enrollment and filtered attendance.