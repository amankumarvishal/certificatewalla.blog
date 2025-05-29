# Internship Portal Backend

A Node.js Express backend server for the internship portal application.

## Features

- RESTful API endpoints for internships
- Contact form handling
- File-based data storage
- Input validation
- Error handling
- CORS support

## API Endpoints

### Internships

- `GET /api/internships` - Get all internships
- `GET /api/internships/:id` - Get internship by ID
- `POST /api/internships` - Create new internship

### Contact

- `POST /api/contact` - Submit contact form

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Data Storage

Internships are stored in `data/internships.json`. The file is automatically created if it doesn't exist.

## Contact Form Email (Optional)

To enable email notifications for contact form submissions:

1. Set environment variables:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

2. Uncomment the email sending code in `server.js`

Note: For Gmail, you'll need to use an App Password. See [Google's documentation](https://support.google.com/accounts/answer/185833) for details.

## Development

The server uses nodemon for automatic reloading during development. Any changes to the server code will trigger a restart.

## Error Handling

The server includes comprehensive error handling:
- Input validation
- File system errors
- API errors
- Global error handler

All errors are logged to the console and appropriate error responses are sent to the client. 