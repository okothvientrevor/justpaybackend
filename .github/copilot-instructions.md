# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a Node.js backend project for JustPay that integrates with Stripe for payment processing. The backend serves RESTful APIs for a Flutter mobile application.

## Key Technologies
- Node.js with Express.js
- Stripe Payment API for payment link generation
- CORS enabled for Flutter app integration
- Environment variables for secure configuration

## Code Style Guidelines
- Use ES6+ syntax where appropriate
- Implement proper error handling and validation
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper logging with Morgan
- Use Helmet for security headers

## API Design Principles
- All endpoints should return consistent JSON responses
- Include proper HTTP status codes
- Implement input validation for all endpoints
- Use descriptive error messages
- Follow REST naming conventions

## Security Considerations
- Never expose Stripe secret keys in client code
- Validate all incoming requests
- Use CORS appropriately for Flutter app
- Implement rate limiting where necessary
