# MongoDB Schema Diagram

## Database Schema for Varuna Pumps Application

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                              User Schema                              │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ - username: String (required)                                         │
│ - email: String (required, unique)                                    │
│ - password: String (required, hashed)                                 │
│ - role: String (enum: ['admin', 'crm', 'ce', 'user'], default: 'user')│
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                                    │ references
                                    │
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                           Suggestion Schema                           │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ - name: String                                                        │
│ - mobileNo: String                                                    │
│ - email: String                                                       │
│ - state: String                                                       │
│ - city: String                                                        │
│ - district: String                                                    │
│ - businessType: String                                                │
│ - findForm: String                                                    │
│ - typeOfProducts: String                                              │
│ - head: String                                                        │
│ - flow: String                                                        │
│ - pipeSize: String                                                    │
│ - phase: String                                                       │
│ - frequency: String                                                   │
│ - createdAt: Date (default: Date.now)                                 │
│ - sentToCE: Boolean (default: false)                                  │
│ - ceAssigned: ObjectId (ref: 'User')                                  │
│ - completed: Boolean (default: false)                                 │
│ - message: String (default: "")                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                            Product Schema                             │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ // Basic Information                                                  │
│ - model: String                                                       │
│ - type: String                                                        │
│ - description: String                                                 │
│ - input: String                                                       │
│ - images: [String]                                                    │
│                                                                       │
│ // Product Identification                                             │
│ - pump_id: String                                                     │
│ - pump_app_name: String                                               │
│ - pump_model_name: String                                             │
│                                                                       │
│ // Group Information                                                  │
│ - group: String                                                       │
│ - pump_sub_group: String                                              │
│ - pump_sub_group_name: String                                         │
│                                                                       │
│ // Performance Specifications                                         │
│ - stages: Number                                                      │
│ - head_meters: [Number]                                               │
│ - discharge_lpm: [Number]                                             │
│ - pump_discharge_type: String                                         │
│ - pump_discharge_range: String                                        │
│ - pump_rated_head: String                                             │
│ - pump_sp_gr: String                                                  │
│                                                                       │
│ // Power & Electrical Details                                         │
│ - motor_rating: String                                                │
│ - pump_power_hp: String                                               │
│ - pump_power_kw: String                                               │
│ - pump_voltage: String                                                │
│ - pump_frequency: String                                              │
│ - pump_power_supply: String                                           │
│                                                                       │
│ // Physical Specifications                                            │
│ - suction_size: String                                                │
│ - pump_del_size: String                                               │
│ - pump_priming_type: String                                           │
│ - material: String                                                    │
│                                                                       │
│ // Features and Applications                                          │
│ - salient_features: [String]                                          │
│ - applications: [String]                                              │
│                                                                       │
│ // Additional Details                                                 │
│ - motor_details: Map<String, String>                                  │
│ - pump_details: Map<String, String>                                   │
│                                                                       │
│ - reviews: [ReviewSchema]                                             │
│                                                                       │
│ - created_at: Date (default: Date.now)                                │
│ - updated_at: Date (default: Date.now)                                │
│ - created_by: String                                                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ embedded
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                            Review Schema                              │
│                           (Embedded in Product)                       │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ - user: String (required)                                             │
│ - rating: Number (required, min: 1, max: 5)                           │
│ - comment: String (required)                                          │
│ - createdAt: Date (default: Date.now)                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Entity Relationships

1. **User to Suggestion**: One-to-Many
   - A CE user can be assigned to multiple suggestions
   - Each suggestion is assigned to at most one CE

2. **Product to Reviews**: One-to-Many (Embedded)
   - A product can have multiple reviews
   - Reviews are embedded within the product document

## Data Flow in Application

1. **User Authentication Flow**:
   - Users register with username, email, password
   - Passwords are hashed before storage
   - Role determines access level (admin, crm, ce, user)

2. **Product Management Flow**:
   - Admin creates/updates product information
   - Products are displayed to users in catalog
   - Users can view details and submit reviews

3. **Customer Inquiry Flow**:
   - Customer submits inquiry via suggestion form
   - CRM reviews and assigns to appropriate CE
   - CE handles the inquiry and marks as completed

## Schema Validation and Business Rules

1. **User Schema**:
   - Email must be unique
   - Password is hashed for security
   - Role must be one of predefined values

2. **Product Schema**:
   - Flexible structure to accommodate various pump specifications
   - Array fields for multiple values (head_meters, discharge_lpm)
   - Embedded reviews for efficient querying

3. **Suggestion Schema**:
   - Tracks workflow status (sentToCE, completed)
   - References CE user for assignment
   - Stores customer requirements for product matching
