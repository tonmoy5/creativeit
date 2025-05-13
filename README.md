# HubSpot Contact Deduplication

This project implements an Express.js app that handles HubSpot contact deduplication via a webhook. It listens for phone number updates, searches for duplicate contacts in HubSpot, and merges the duplicate contacts, keeping the oldest one as the primary contact.

## Features

- **Phone number normalization**: Normalizes incoming phone numbers to ensure consistent formatting.
- **Search for duplicates**: Searches for contacts in HubSpot using multiple phone fields (`phone`, `hs_whatsapp_phone_number`, `mobilephone`, `secondary_phone_number`).
- **Merging duplicates**: If duplicate contacts are found, they are merged into the oldest (primary) contact based on the `createdate` field.
- **Logging**: Logs all operations (success and failure) with timestamps to a log file for easy tracking and debugging.

## Prerequisites

Before running this project, you need to have the following installed:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **npm**: Node.js comes with npm (Node Package Manager) installed.
- **HubSpot API Key**: You will need a HubSpot API key. Follow [HubSpot's OAuth documentation](https://developers.hubspot.com/docs/methods/auth/oauth-overview) for OAuth setup.

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/hubspot-deduplication.git
   cd hubspot-deduplication
   ```
   Install the required dependencies:

bash
Copy
npm install
Create a .env file in the root of the project with the following variables:

env
Copy
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
Replace your_hubspot_access_token with your actual HubSpot API access token.

Usage
Start the server:

bash
Copy
npm start
The server will run on http://localhost:3000 by default.

Trigger the Webhook:
The server listens for incoming POST requests on the /webhook/deduplicate endpoint. You can trigger the webhook by sending a request with the propertyValue (phone number) as part of the request body.

Example request:

json
Copy
{
"propertyValue": "8801889983314"
}
Successful Response:
If duplicate contacts are found and merged, the server will return a response with a message confirming the successful merge:

json
Copy
{
"message": "Contacts Merged Successfully",
"newID": "primary_contact_id"
}
No Duplicates:
If no duplicates are found, the response will be:

json
Copy
{
"message": "No duplicate found"
}
Error Response:
If there's an error fetching or merging the contacts, a 500 status code with the error details will be returned:

json
Copy
{
"error": "Failed to fetch or merge contacts",
"details": "Error message"
}
Logging
The app uses winston for logging. Logs are written to the console and to a file logs/app.log. Each log entry includes a timestamp and a log level (info for successes, error for failures).

Logs can be found in the logs/ directory.

Development
To run the app in development mode, you can use nodemon for automatic server restarts:

Install nodemon globally:

bash
Copy
npm install -g nodemon
Start the server using nodemon:

bash
Copy
nodemon server.js
Contributing
Fork the repository.

Create your feature branch (git checkout -b feature-branch).

Commit your changes (git commit -am 'Add new feature').

Push to the branch (git push origin feature-branch).

Create a new pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.

markdown
Copy

### Key Sections in the `README.md`:

- **Project Overview**: A brief description of the project and its functionality.
- **Features**: Highlights the key functionalities of the application (phone number normalization, duplicate search, merging, logging).
- **Prerequisites**: Lists the dependencies and tools required to run the project.
- **Installation**: Instructions to set up the project on a local machine.
- **Usage**: How to run the project and trigger the webhook.
- **Logging**: Information about how logging is handled in the project.
- **Development**: How to set up the project for development, including using `nodemon` for automatic restarts.
- **Contributing**: Basic instructions on how to contribute to the project.
- **License**: Specifies the license for the project.

### Next Steps:

1. Replace `your-username` in the repository URL with your actual GitHub username if you plan to publish this project.
2. Adjust the instructions as needed based on your actual use case or additional features you may add.

Let me know if you need further adjustments or any other information! 😊
