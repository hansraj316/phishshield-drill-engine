# PhishShield Drill Engine

AI-powered phishing simulation and instant coaching MVP for SMB teams.

## MVP Features
- Campaign creation API
- Email simulation send endpoint (mocked)
- Click/open event tracking endpoint
- Instant coaching page per simulated incident
- Weekly summary metrics endpoint

## Quickstart
```bash
npm install
npm run dev
```

## API
- `POST /api/campaigns`
- `POST /api/events`
- `GET /api/coaching/:eventId`
- `GET /api/metrics/weekly`
