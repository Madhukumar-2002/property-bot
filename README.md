# Property Bot

AI-powered bot system for property management with WhatsApp integration.

## Features

- AI-powered message handling
- WhatsApp integration for customer communication
- MongoDB for data persistence
- REST API endpoints
- Real-time messaging capabilities

## Tech Stack

- **Backend**: Java Spring Boot (Maven)
- **Server**: Node.js/Express
- **Database**: MongoDB
- **AI Service**: OpenAI integration
- **Messaging**: WhatsApp Business API

## Project Structure

```
├── src/                    # Java Spring Boot source
│   └── main/
│       ├── java/com/example/aibotsystem/
│       │   ├── controller/   # REST controllers
│       │   ├── model/        # Data models
│       │   ├── repository/   # Data repositories
│       │   └── service/     # Business logic
│       └── resources/       # Configuration files
├── models/                # Node.js models
├── server.js              # Main Node.js server
├── package.json           # Node.js dependencies
├── pom.xml               # Maven dependencies
└── TODO.md               # Project tasks
```

## Prerequisites

- Java 17+
- Node.js 18+
- MongoDB
- Maven 3.9+

## Installation\n\n### Java Backend\n```\nbash\ncd apache-maven-3.9.5\nmvn clean install\nmvn spring-boot:run\n```\n\n### Node.js Server (WhatsApp AI Bot)\n```\nbash\nnpm install\nnode server_fixed.js   # Primary - uses /call endpoint\n# or\nnode server.js         # Backup - now also uses /call endpoint\n```\n\n### VAPI Configuration\n- Endpoint: `https://api.vapi.ai/call` (primary)\n- Fallback: `https://api.vapi.ai/v1/calls` (check dashboard)\n- Auth: `process.env.VAPI_API_KEY`\n- Phone: Auto +91 prefix for India

## Configuration

The application supports multiple environments:
- `application-dev.properties` - Development settings
- `application-prod.properties` - Production settings
- `application.properties` - Default configuration

## API Endpoints

- `/api/messages` - Message handling
- `/api/ai` - AI service endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
