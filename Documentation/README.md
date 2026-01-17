# Varuna Pumps Web Application Documentation

This folder contains architectural and database schema diagrams for the Varuna Pumps web application.

## Contents

1. **Project Architecture Diagram**
   - View the HTML version: [Project_Architecture_Diagram.html](./Project_Architecture_Diagram.html)
   - View the Markdown version: [Project_Architecture_Diagram.md](./Project_Architecture_Diagram.md)

2. **MongoDB Schema Diagram**
   - View the HTML version: [MongoDB_Schema_Diagram.html](./MongoDB_Schema_Diagram.html)
   - View the Markdown version: [MongoDB_Schema_Diagram.md](./MongoDB_Schema_Diagram.md)

## How to View the Diagrams

### HTML Versions
1. Open the HTML files in any modern web browser
2. The diagrams are rendered using Mermaid.js and will display automatically
3. You can zoom in/out and navigate the diagrams interactively

### Markdown Versions
1. The Markdown files contain text-based representations of the diagrams
2. These can be viewed in any Markdown viewer or text editor
3. They provide the same information in a more portable format

## Project Overview

The Varuna Pumps web application is built using:
- Node.js and Express.js for the backend
- MongoDB for the database
- EJS for templating
- Bootstrap for frontend styling

The application follows the MVC (Model-View-Controller) architecture pattern and implements role-based access control with four user roles: Admin, CRM, CE, and regular users.

## Key Features

1. **Product Management**
   - Comprehensive product catalog
   - Detailed product specifications
   - Customer reviews

2. **Customer Inquiry System**
   - Product requirement submission
   - CRM assignment workflow
   - CE handling and resolution

3. **Role-Based Dashboards**
   - Admin dashboard for product and user management
   - CRM dashboard for inquiry management
   - CE dashboard for handling assigned inquiries

## Database Structure

The application uses MongoDB with three main collections:
1. **Users** - Authentication and role management
2. **Products** - Product catalog with embedded reviews
3. **Suggestions** - Customer inquiries and workflow management

For detailed information about each collection and their relationships, refer to the MongoDB Schema Diagram.
