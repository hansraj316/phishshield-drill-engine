# PhishShield Drill Engine

[![Indian Avengers](https://img.shields.io/badge/Managed%20By-Indian%20Avengers-orange?style=flat-square&logo=gitbook)](https://github.com/hansraj316/mission-control-openclaw)

AI-powered phishing simulation and instant coaching MVP for SMB teams.

## MVP Features
- Campaign creation API
- Email simulation send endpoint (mocked)
- Click/open event tracking endpoint
- Drill completion analytics event endpoint
- Instant coaching page per simulated incident
- Weekly summary metrics endpoint
- Daily drill completion summary report (CLI)

## Quickstart
```bash
npm install
npm run dev
```

Run daily drill completion summary:

```bash
npm run summary:daily
```

Optional fail threshold (default: 70):

```bash
FAIL_SCORE_THRESHOLD=75 npm run summary:daily
```

Example output:

```json
{
  "date": "2026-04-22",
  "completionCount": 17,
  "avgScore": 78.24,
  "failRate": 29.41,
  "failScoreThreshold": 70
}
```

Run tests:

```bash
npm test
```

## API
- `POST /api/campaigns`
- `POST /api/events`
- `POST /api/events/drill-complete`
- `GET /api/coaching/:eventId`
- `GET /api/metrics/weekly`

### Drill completion event contract

`POST /api/events/drill-complete`

Request body:

```json
{
  "userId": "user-123",
  "campaignId": "campaign-456",
  "score": 88,
  "completedAt": "2026-04-22T18:00:00.000Z"
}
```

Validation rules:
- `userId` required
- `campaignId` required
- `score` required, number between `0` and `100`
- `completedAt` required, valid datetime string

Success response (`201`):

```json
{
  "id": "6f15f538-3a0f-49ec-bf84-cad8f81a6c16",
  "type": "drill-complete",
  "userId": "user-123",
  "campaignId": "campaign-456",
  "score": 88,
  "completedAt": "2026-04-22T18:00:00.000Z",
  "createdAt": "2026-04-22T18:00:01.101Z"
}
```

Curl examples:

```bash
curl -X POST http://localhost:3000/api/events/drill-complete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "campaignId": "campaign-456",
    "score": 88,
    "completedAt": "2026-04-22T18:00:00.000Z"
  }'
```

```bash
curl -X POST http://localhost:3000/api/events/drill-complete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "campaignId": "campaign-456",
    "score": 105,
    "completedAt": "2026-04-22T18:00:00.000Z"
  }'
```
