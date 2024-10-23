# Cropilot

**Version**: 1.0.0  
**Description**: Empowering agriculture with AI by connecting NASA’s vast climate data to farmers via messaging platforms.

## Project Overview

Cropilot is an innovative AI-powered solution designed to assist farmers by providing them with actionable insights based on NASA's open climate API data. We aim to simplify complex data and deliver it in a user-friendly way, using established messaging platforms such as Telegram. The reason for choosing a messaging platform is to make this technology accessible to non-tech-savvy individuals, offering them a familiar interface.

## Key Features

- **NASA Climate Data Integration**: Cropilot uses NASA's open climate data, combined with specific user information (location, crop type), to generate detailed and understandable advice.
- **Messaging Platform Integration**: We selected Telegram for its accessibility, but the system is built to be easily extensible to other platforms like WhatsApp, Messenger, etc.
- **Use Case Driven Architecture**: The project follows a use-case based structure, making it easy to extend or modify different parts of the system according to specific business needs.
- **Multi-language Support**: Using i18n (i18next), the application supports multi-language responses to ensure usability across different regions.

## Leveraging Climate Data

**NASA's Climate Data**  
Cropilot uses a variety of climate metrics provided by NASA to deliver precise, actionable insights to farmers:
- Temperature at 2 Meters
- Land Surface Temperature
- Corrected Total Precipitation
- Specific Humidity at 2 Meters
- Wind Speed at 2 Meters
- Surface Soil Moisture
- Root Zone Soil Moisture
- Soil Profile Moisture

**User Data**  
To personalize the climate data for the farmer's needs, Cropilot combines NASA's climate data with:
- Location
- Crops to use
- Time of year

### How It Works
1. **Gather Relevant Data**: Based on user inputs (location, crops, time of year), Cropilot collects the necessary climate data from NASA's API.
2. **Evaluate User's Request with AI**: Using AI, Cropilot processes this data to provide highly tailored recommendations that help farmers optimize their crop management.

The entire interaction happens through a **Telegram** bot, making it simple for users who are not tech-savvy. The system is built to be extensible to other messaging platforms as well.

## Project Structure

The project follows a modular structure, divided by functional components:

- **modules/**
  - **llm/**: Handles the logic around language models.
    - **use-cases/**: Specific use cases for interactions with the language model.
    - **client.ts**: The main client that interacts with the language model.
  - **messaging/**: Integrates with messaging platforms like Telegram.
    - **infra/**: Messaging platform infrastructure.
    - **use-cases/**: Different use cases for messaging workflows.
    - **client.ts**: Main client that communicates with the messaging platform.
  - **nasa/**: Manages NASA's open climate data integration.
    - **infra/**: NASA data infrastructure.
    - **use-cases/**: Use cases that handle data retrieval and processing for specific needs.
    - **utils/**: Utility functions specific to NASA data handling.
- **utils/**: General utility functions shared across the system.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/cropilot.git
   cd cropilot
   ```

Install dependencies:

```bash
pnpm install

```
2. Set up environment variables in a .env file:
```bash
DATABASE_URL="postgresql://cropilot_user:cropilot_local@localhost:5432/cropilot"
TEMPORAL_API_BASE_URL="https://power.larc.nasa.gov/api/"
OPENAI_API_KEY=""
PORT=3000
TELEGRAM_BOT_TOKEN=""
```

Basic Commands
Build the project:


```bash
pnpm run build
```

Start the project:

```bash
pnpm run start
```

Development Mode (with file watching):


```bash
pnpm run dev
```

## Database Migrations:

Generate migrations:
```bash
pnpm run db:generate

```
Apply migrations:

```bash
pnpm run db:migrate
```

##  Profiling:

```bash
pnpm run start:prof
```

## Extensibility
The architecture is designed to be extensible, especially the messaging module. Although Telegram is the platform we've selected for its accessibility to non-tech users, the application can be extended to support any other messaging service with minimal changes.
