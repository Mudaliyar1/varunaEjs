# Project Architecture Diagram

## Varuna Pumps Web Application Architecture

```
varunaEjs/
│
├── app.js                  # Main application entry point
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables (DB connection, etc.)
│
├── models/                 # MongoDB Schema definitions
│   ├── User.js             # User authentication and roles
│   ├── Product.js          # Product information and reviews
│   └── Suggestion.js       # Customer inquiries and CE assignments
│
├── views/                  # EJS templates
│   ├── index.ejs           # Homepage
│   ├── product.ejs         # Product details page
│   ├── productMain.ejs     # Products listing page
│   ├── suggestion.ejs      # Product inquiry form
│   ├── admin.ejs           # Admin dashboard
│   ├── adminProductList.ejs # Admin product management
│   ├── crm.ejs             # CRM dashboard
│   ├── ce.ejs              # CE dashboard
│   ├── loginMain.ejs       # Login page
│   ├── register.ejs        # User registration
│   │
│   └── includes/           # Reusable template parts
│       ├── header.ejs      # Site header
│       └── footer.ejs      # Site footer
│
├── routes/                 # Route definitions
│   ├── index.js            # Main product routes
│   ├── products.js         # Product listing routes
│   ├── admin.js            # Admin panel routes
│   ├── auth.js             # Authentication routes
│   ├── crmRoutes.js        # CRM dashboard routes
│   ├── ceRoutes.js         # CE dashboard routes
│   └── suggestion.js       # Customer inquiry routes
│
├── middlewares/            # Custom middleware functions
│   └── authMiddleware.js   # Authentication and authorization
│
└── public/                 # Static assets
    ├── css/                # Stylesheets
    │   ├── style.css       # Main styles
    │   └── utility.css     # Utility classes
    ├── js/                 # Client-side JavaScript
    └── images/             # Image assets
```

## Application Flow Diagram

```
┌─────────┐     ┌─────────┐     ┌─────────────┐     ┌─────────┐     ┌─────────────┐
│         │     │         │     │             │     │         │     │             │
│ Browser │────▶│ Routes  │────▶│ Controllers │────▶│ Models  │────▶│ MongoDB     │
│         │     │         │     │             │     │         │     │             │
└─────────┘     └─────────┘     └─────────────┘     └─────────┘     └─────────────┘
     ▲                                                                    │
     │                                                                    │
     │                                                                    │
     └────────────────────────────────────────────────────────────────────┘
                                 Response
```

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │         │    │         │    │         │    │         │   │
│  │  Admin  │    │   CRM   │    │    CE   │    │  User   │   │
│  │         │    │         │    │         │    │         │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │              │              │              │        │
│       ▼              ▼              ▼              ▼        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Product │    │ Manage  │    │ Handle  │    │ Browse  │   │
│  │ Manage- │    │ Inquir- │    │ Assign- │    │Products │   │
│  │  ment   │    │   ies   │    │ ments   │    │& Submit │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

1. **Express.js Framework**: Handles HTTP requests, routing, and middleware
2. **EJS Templating**: Server-side rendering of dynamic HTML
3. **MongoDB with Mongoose**: NoSQL database with schema validation
4. **Authentication System**: User login, registration, and role-based access
5. **Product Management**: CRUD operations for pump products
6. **Customer Inquiry System**: Form submission and processing workflow
7. **Role-Based Dashboards**: Admin, CRM, and CE interfaces
