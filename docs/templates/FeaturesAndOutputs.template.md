# [Module Name] — Features and Outputs Specification

## 1. Features & Business Capabilities
- **Feature 1**: Brief description of what was calculated or processed.
- **Feature 2**: Brief description of the formula or business rule used.

## 2. API Response Payloads (OpenAPI Ready)
### `GET /api/v1/[module-name]/[endpoint]` -> Status `200 OK`
```json
{
  "status": "success",
  "data": {
    "key_metric": 78,
    "status": "Stable",
    "breakdown": {
      "metric_a": 69,
      "metric_b": 75
    }
  },
  "metadata": {
    "computed_at": "2026-10-26T21:00:00Z",
    "dataset_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## 3. Error Codes & Scenarios
- `400 Bad Request`: Malformed parameters or empty request.
- `404 Not Found`: Dataset ID not found.
- `422 Unprocessable Entity`: Dataset missing critical columns required for this calculation.

## 4. Frontend Integration Notes
- **Corresponding Figma Screen**: (e.g. `Risk Detection and Business Health` or `Advisory`)
- **Assigned Frontend Developer**: (e.g. Riona Chettiar or Alciya Anand Dodti)
- **UI Component Mapping**:
  - `data.key_metric` -> Top KPI Card value
  - `data.status` -> Status badge color (`Stable` = yellow/green, `Critical` = red)
  - `data.breakdown` -> Horizontal progress bar values
