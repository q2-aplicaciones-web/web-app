# Comprehensive Order Processing System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Service Layer Documentation](#service-layer-documentation)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Frontend Components](#frontend-components)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Security & Authentication](#security--authentication)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Configuration](#deployment--configuration)

---

## System Overview

The Q2 Order Processing System is a comprehensive e-commerce solution that manages the complete customer journey from product discovery to order fulfillment. It's built using a modern micro-frontend architecture with Vue.js and integrates with a RESTful backend API.

### Key Features
- **Local Cart Management**: localStorage-based cart for performance and offline capability
- **Product Catalog Integration**: Real-time product data synchronization
- **Multi-Manufacturer Support**: Flexible manufacturer assignment and fulfillment routing
- **Payment Processing**: Stripe integration for secure payments
- **Order Tracking**: Real-time order and fulfillment status updates
- **Internationalization**: Full i18n support for multiple languages
- **Responsive Design**: Mobile-first responsive UI with PrimeVue components

### Technology Stack
- **Frontend**: Vue.js 3, PrimeVue, Vue Router, Vue I18n
- **State Management**: localStorage + reactive Vue refs
- **HTTP Client**: Native Fetch API
- **Styling**: CSS3 with PrimeVue theming
- **Build Tool**: Vite
- **Package Manager**: npm

---

## Architecture & Data Flow

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vue.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Cart Management     │  Order Processing  │  Product Catalog    │
│  (localStorage)      │  (API Integration) │  (API Integration)  │
├─────────────────────────────────────────────────────────────────┤
│                     Service Layer                               │
│  LocalCartService   │  OrderService     │  FulfillmentService │
│  ProductCatalogApi  │  ManufacturerSvc  │  PaymentService     │
├─────────────────────────────────────────────────────────────────┤
│                      API Gateway                                │
│            RESTful API Endpoints (/api/v1/*)                   │
├─────────────────────────────────────────────────────────────────┤
│                      Backend Services                           │
│     Product DB      │    Order DB      │   Fulfillment DB     │
│     User Auth       │    Payments      │   Notifications      │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence

#### 1. Product Discovery & Cart Management
```
User → ProductList → ProductCatalogApi → GET /api/v1/products
User → AddToCart → LocalCartService → localStorage['quri_cart_items']
User → ViewCart → LocalCartService → GET /api/v1/products (enrich cart data)
```

#### 2. Checkout Process
```
User → Checkout → ManufacturerService → GET /api/v1/manufacturers
User → SelectManufacturer → FulfillmentService → POST /api/v1/fulfillments
User → PlaceOrder → OrderService → POST /api/v1/orders
User → Payment → PaymentService → POST /api/v1/payments/stripe/intents
```

#### 3. Order Fulfillment
```
Manufacturer → Dashboard → ManufacturerOrdersService → GET /api/v1/fulfillments
Manufacturer → UpdateStatus → FulfillmentService → PATCH /api/v1/fulfillments/{id}
Customer → TrackOrder → OrderService → GET /api/v1/orders/{id}
```

---

## Service Layer Documentation

### LocalCartService

**Purpose**: Manages shopping cart using localStorage for persistence and performance.

**File**: `src/orders-processing/services/local-cart.service.js`

**Key Methods**:

```javascript
class LocalCartService {
  // Core cart operations
  addToCart(productId, quantity = 1)           // Add product to cart
  removeFromCart(productId)                    // Remove product from cart
  updateQuantity(productId, quantity)          // Update item quantity
  clearCart()                                  // Empty the cart
  
  // Data retrieval
  getCartItems()                               // Get raw cart data from localStorage
  async getCartProducts()                      // Get enriched cart data with product details
  async getCartSummary()                       // Get cart totals and summary
  getCartItemCount()                           // Get total item count for badges
}
```

**Storage Schema**:
```javascript
// localStorage key: 'quri_cart_items'
[
  {
    productId: "uuid-string",
    quantity: 2,
    addedAt: "2025-07-06T10:30:00.000Z"
  }
]
```

**Enhanced Product Schema** (returned by getCartProducts):
```javascript
{
  // Original product data from API
  id: "uuid-string",
  name: "Product Name",
  description: "Product description",
  priceAmount: 29.99,
  currency: "USD",
  
  // Cart-specific data
  cartQuantity: 2,
  addedAt: "2025-07-06T10:30:00.000Z",
  subtotal: 59.98,
  
  // Enhanced display data
  displayName: "Computed display name",
  displayDescription: "Enhanced description",
  isAvailable: true,
  
  // Product metadata for detailed view
  productMetadata: {
    id: "uuid-string",
    sku: "SKU-123",
    category: "Apparel",
    designerId: "uuid-string",
    designerName: "Designer Name",
    status: "available",
    views: 150,
    likes: 25
  }
}
```

### OrderService

**Purpose**: Handles order creation, retrieval, and management.

**File**: `src/orders-processing/services/order.service.js`

**Key Methods**:

```javascript
class OrderService {
  async createOrder(orderData)                 // Create new order
  async getUserOrders(filters = {})            // Get user's order history
  async getOrderById(orderId)                  // Get specific order details
  async updateOrder(orderId, updateData)       // Update order status/details
}
```

**Order Data Schema**:
```javascript
// Request body for createOrder
{
  userId: "uuid-string",
  items: [
    {
      productId: "uuid-string",
      quantity: 2,
      unitPrice: 29.99,
      projectName: "Custom Design"
    }
  ],
  totalAmount: 59.98,
  manufacturerId: "uuid-string",
  shippingAddress: {
    fullName: "John Doe",
    address: "123 Main St",
    city: "Los Angeles",
    state: "CA",
    zip: "90210",
    country: "US"
  }
}

// Response from API
{
  id: "uuid-string",
  orderNumber: "ORD-2025-001234",
  userId: "uuid-string",
  status: "pending",
  totalAmount: 59.98,
  currency: "USD",
  items: [...],
  shippingAddress: {...},
  createdAt: "2025-07-06T20:43:48.662Z",
  updatedAt: "2025-07-06T20:43:48.662Z"
}
```

### FulfillmentService

**Purpose**: Manages order fulfillment tracking and manufacturer assignments.

**File**: `src/orders-processing/services/fulfillment.service.js`

**Key Methods**:

```javascript
class FulfillmentService {
  async createFulfillment(fulfillmentData)     // Create fulfillment assignment
  async getAllFulfillments(filters = {})       // Get fulfillments (manufacturer view)
  async getFulfillmentItems(fulfillmentId)     // Get items for specific fulfillment
  async updateFulfillment(fulfillmentId, data) // Update fulfillment status
  async calculateFulfillment(data)             // Calculate fulfillment estimates
}
```

**Fulfillment Data Schema**:
```javascript
// Request body for createFulfillment
{
  orderId: "uuid-string",
  manufacturerId: "uuid-string",
  items: [
    {
      productId: "uuid-string",
      quantity: 2,
      unitPrice: 29.99
    }
  ],
  priority: "normal",
  requestedDeliveryDate: "2025-07-13T00:00:00.000Z"
}

// Response from API
{
  id: "uuid-string",
  orderId: "uuid-string",
  manufacturerId: "uuid-string",
  status: "pending",
  totalAmount: 59.98,
  estimatedCompletionDate: "2025-07-13T00:00:00.000Z",
  items: [...],
  createdAt: "2025-07-06T20:43:48.662Z",
  updatedAt: "2025-07-06T20:43:48.662Z"
}
```

### ManufacturerService

**Purpose**: Manages manufacturer data and selection.

**File**: `src/orders-processing/services/manufacturer.service.js`

**Key Methods**:

```javascript
class ManufacturerService {
  async getAllManufacturers()                  // Get all available manufacturers
  async getManufacturerById(id)                // Get specific manufacturer details
  async createManufacturer(manufacturerData)   // Create new manufacturer
}
```

**Manufacturer Data Schema**:
```javascript
{
  id: "uuid-string",
  userId: "uuid-string",
  name: "Manufacturer Name",
  address_Street: "123 Factory St",
  address_City: "Los Angeles",
  address_State: "CA",
  address_Country: "USA",
  address_Zip: "90210",
  createdAt: "2025-07-07T01:14:55.624Z",
  updatedAt: "2025-07-07T01:14:55.625Z",
  
  // Enhanced fields added by service for UI compatibility
  averageProductionTime: 7,        // Default fallback
  qualityRating: 4.5,              // Default fallback
  specialties: ["T-Shirts"],       // Default fallback
  displayLocation: "Los Angeles, CA, USA",
  estimatedDeliveryRange: "7-14 days"
}
```

### PaymentService

**Purpose**: Handles Stripe payment integration.

**File**: `src/orders-processing/services/payment.service.js`

**Key Methods**:

```javascript
class PaymentService {
  async createPaymentIntent(paymentData)       // Create Stripe payment intent
  async confirmPayment(paymentIntentId)        // Confirm payment completion
  async refundPayment(paymentIntentId, amount) // Process refunds
}
```

### ProductCatalogService

**Purpose**: Manages product data integration.

**File**: `src/productCatalog/application/productCatalogService.js`

**Key Methods**:

```javascript
class ProductCatalogService {
  async getAllProducts(projectId)              // Get all products (optionally filtered)
  async getProductById(id)                     // Get specific product details
  async createProduct(productData)             // Create new product
  async updateProduct(id, productData)         // Update existing product
  async deleteProduct(id)                      // Delete product
}
```

---

## API Endpoints Reference

### Product Catalog Endpoints

#### GET /api/v1/products
**Purpose**: Fetch all products, optionally filtered by projectId  
**Authentication**: Required (Bearer token)  
**Query Parameters**:
- `projectId` (optional): Filter products by project UUID

**Response**:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "priceAmount": 25.99,
    "priceCurrency": "USD",
    "status": "available",
    "projectTitle": "Cool Design T-Shirt",
    "projectPreviewUrl": "https://cloudinary.com/image.jpg",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "likeCount": 5,
    "createdAt": "2025-07-06T20:43:48.662Z",
    "updatedAt": "2025-07-06T20:43:48.662Z",
    "garmentColor": "White",
    "garmentSize": "M",
    "garmentGender": "Unisex"
  }
]
```

#### GET /api/v1/products/{productId}
**Purpose**: Get specific product details  
**Authentication**: Required (Bearer token)  
**Path Parameters**:
- `productId` (required): UUID of the product

#### POST /api/v1/products
**Purpose**: Create a new product  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "priceAmount": 25.99,
  "priceCurrency": "USD",
  "projectTitle": "New Design T-Shirt",
  "garmentColor": "Blue",
  "garmentSize": "L",
  "garmentGender": "Unisex"
}
```

### Manufacturer Endpoints

#### GET /api/v1/manufacturers
**Purpose**: Get all available manufacturers, optionally filtered by userId  
**Authentication**: Required (Bearer token)  
**Query Parameters**:
- `userId` (optional): Filter manufacturers by user UUID

**Response**:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Premium Prints Co.",
    "address_Street": "123 Factory Street",
    "address_City": "Los Angeles",
    "address_State": "CA",
    "address_Country": "USA",
    "address_Zip": "90210",
    "createdAt": "2025-07-07T01:14:55.624Z",
    "updatedAt": "2025-07-07T01:14:55.625Z"
  }
]
```

#### POST /api/v1/manufacturers
**Purpose**: Create a new manufacturer  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "New Manufacturer",
  "address_Street": "456 Production Ave",
  "address_City": "New York",
  "address_Country": "USA",
  "address_State": "NY",
  "address_Zip": "10001"
}
```

**Response**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "New Manufacturer",
  "address_Street": "456 Production Ave",
  "address_City": "New York",
  "address_Country": "USA",
  "address_State": "NY",
  "address_Zip": "10001",
  "createdAt": "2025-07-07T01:14:55.624Z",
  "updatedAt": "2025-07-07T01:14:55.625Z"
}
```

#### GET /api/v1/manufacturers/{manufacturerId}
**Purpose**: Get specific manufacturer details  
**Authentication**: Required (Bearer token)  
**Path Parameters**:
- `manufacturerId` (required): UUID of the manufacturer

### Order Endpoints

#### POST /api/v1/orders
**Purpose**: Create a new order from cart items  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "items": [
    {
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "quantity": 2,
      "unitPrice": 25.99,
      "projectName": "Custom Design"
    }
  ],
  "totalAmount": 51.98,
  "currency": "USD",
  "manufacturerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "paymentIntentId": "pi_1234567890"
}
```

**Response**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "orderNumber": "ORD-2025-001234",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending",
  "totalAmount": 51.98,
  "currency": "USD",
  "items": [
    {
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "quantity": 2,
      "unitPrice": 25.99,
      "projectName": "Custom Design"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90210",
    "country": "USA"
  },
  "createdAt": "2025-07-06T20:43:48.662Z",
  "updatedAt": "2025-07-06T20:43:48.662Z"
}
```

#### GET /api/v1/orders
**Purpose**: Get user's order history  
**Authentication**: Required (Bearer token)  
**Query Parameters**:
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by order status
- `limit` (optional): Number of orders to return
- `offset` (optional): Pagination offset

#### GET /api/v1/orders/{orderId}
**Purpose**: Get specific order details  
**Authentication**: Required (Bearer token)  
**Path Parameters**:
- `orderId` (required): UUID of the order

#### PATCH /api/v1/orders/{orderId}
**Purpose**: Update order status or details  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "status": "confirmed",
  "notes": "Order confirmed and ready for fulfillment"
}
```

### Fulfillment Endpoints

#### POST /api/v1/fulfillments
**Purpose**: Create fulfillment when manufacturer is selected  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "manufacturerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "items": [
    {
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "quantity": 2,
      "unitPrice": 25.99
    }
  ],
  "priority": "normal",
  "requestedDeliveryDate": "2025-07-13T00:00:00.000Z"
}
```

**Response**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "manufacturerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending",
  "totalAmount": 51.98,
  "estimatedCompletionDate": "2025-07-13T00:00:00.000Z",
  "items": [
    {
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "quantity": 2,
      "unitPrice": 25.99
    }
  ],
  "createdAt": "2025-07-06T20:43:48.662Z",
  "updatedAt": "2025-07-06T20:43:48.662Z"
}
```

#### GET /api/v1/fulfillments
**Purpose**: Get fulfillments (for manufacturer dashboard)  
**Authentication**: Required (Bearer token)  
**Query Parameters**:
- `manufacturerId` (optional): Filter by manufacturer
- `status` (optional): Filter by fulfillment status
- `orderId` (optional): Filter by order ID

#### GET /api/v1/fulfillment-items/{fulfillmentId}
**Purpose**: Get items for a specific fulfillment  
**Authentication**: Required (Bearer token)  
**Path Parameters**:
- `fulfillmentId` (required): UUID of the fulfillment

**Response**:
```json
[
  {
    "id": "string",
    "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "quantity": 2,
    "status": 0,
    "fulfillmentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
]
```

#### PATCH /api/v1/fulfillments/{fulfillmentId}
**Purpose**: Update fulfillment status  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json  
**Path Parameters**:
- `fulfillmentId` (required): UUID of the fulfillment

**Request Body**:
```json
{
  "status": "in_progress",
  "notes": "Started production",
  "estimatedCompletionDate": "2025-07-13T00:00:00.000Z"
}
```

#### POST /api/v1/fulfillment-items/{fulfillmentItemId}/ship
**Purpose**: Mark fulfillment item as shipped  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json  
**Path Parameters**:
- `fulfillmentItemId` (required): UUID of the fulfillment item

**Request Body**:
```json
{
  "trackingNumber": "1Z999AA1234567890",
  "carrier": "UPS",
  "shippedAt": "2025-07-06T20:43:48.662Z",
  "notes": "Package shipped via UPS Ground"
}
```

### Payment Endpoints

#### POST /api/v1/payments/stripe/intents
**Purpose**: Create Stripe payment intent  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "amount": 5198,
  "currency": "usd",
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "description": "Order ORD-2025-001234"
}
```

**Response**:
```json
{
  "paymentIntentId": "pi_1234567890",
  "clientSecret": "pi_1234567890_secret_...",
  "status": "requires_payment_method"
}
```

#### POST /api/v1/payments/stripe/confirm
**Purpose**: Confirm payment completion  
**Authentication**: Required (Bearer token)  
**Content-Type**: application/json

**Request Body**:
```json
{
  "paymentIntentId": "pi_1234567890",
  "paymentMethodId": "pm_1234567890"
}
```

### Discount Policy Endpoints

#### GET /api/v1/discount-policies
**Purpose**: Get available discount policies  
**Authentication**: Required (Bearer token)  
**Query Parameters**:
- `type` (optional): Filter by discount type
- `active` (optional): Filter by active status

**Response**:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "First Time Customer",
    "type": "percentage",
    "value": 10,
    "minimumAmount": 50.00,
    "maximumDiscount": 10.00,
    "isActive": true,
    "validFrom": "2025-07-01T00:00:00.000Z",
    "validUntil": "2025-12-31T23:59:59.999Z"
  }
]
```

---

## Frontend Components

### Core Components

#### CheckoutComponent
**File**: `src/public/pages/checkout.component.vue`  
**Purpose**: Complete checkout flow with cart review, manufacturer selection, and payment

**Key Features**:
- Cart item review and editing (quantity, remove)
- Manufacturer selection with details
- Shipping information form
- Order placement with payment integration
- Real-time cart updates
- Internationalization support

**Component Structure**:
```vue
<template>
  <div class="checkout-page">
    <!-- Cart Summary Section -->
    <div class="checkout-section">
      <!-- Cart items with edit capabilities -->
      <!-- Clear cart functionality -->
    </div>
    
    <!-- Manufacturer Selection Section -->
    <div class="checkout-section">
      <!-- Manufacturer dropdown -->
      <!-- Selected manufacturer details -->
    </div>
    
    <!-- Shipping Information Section -->
    <div class="checkout-section">
      <!-- Shipping form -->
    </div>
    
    <!-- Checkout Actions -->
    <div class="checkout-actions">
      <!-- Place order button -->
    </div>
  </div>
</template>
```

#### ShoppingCartComponent
**File**: `src/public/pages/shopping-cart.component.vue`  
**Purpose**: Dedicated shopping cart page with full cart management

**Key Features**:
- Complete cart item management
- Quantity controls
- Item removal
- Cart totals calculation
- Proceed to checkout
- Empty cart handling

#### ProductListComponent
**File**: `src/productCatalog/ui/ProductList.vue`  
**Purpose**: Display products with add to cart functionality

**Key Features**:
- Product grid/list display
- Add to cart integration
- Product filtering and search
- Pagination support
- Loading states

#### ProductCardComponent
**File**: `src/productCatalog/ui/ProductCard.vue`  
**Purpose**: Individual product display with cart actions

**Key Features**:
- Product image and details
- Price display with currency formatting
- Add to cart button
- Product metadata badges
- Responsive design

### Component Hierarchy

```
App.vue
├── Router
│   ├── HomeComponent
│   ├── ExploreComponent
│   │   └── ProductListComponent
│   │       └── ProductCardComponent
│   ├── ShoppingCartComponent
│   ├── CheckoutComponent
│   └── DashboardComponent
│       └── OrderHistoryComponent
└── NavigationComponent
    └── CartBadgeComponent
```

---

## State Management

### localStorage Schema

The application uses localStorage for cart persistence with the following schema:

#### Cart Items Storage
**Key**: `quri_cart_items`  
**Type**: JSON Array

```javascript
[
  {
    productId: "uuid-string",      // Product identifier
    quantity: 2,                   // Item quantity
    addedAt: "2025-07-06T10:30:00.000Z"  // Timestamp when added
  }
]
```

#### User Preferences
**Key**: `quri_user_preferences`  
**Type**: JSON Object

```javascript
{
  language: "en",                  // User's preferred language
  currency: "USD",                 // User's preferred currency
  theme: "light",                  // UI theme preference
  notifications: true              // Notification preferences
}
```

#### Authentication Token
**Key**: `token`  
**Type**: String (JWT token)

### Reactive State Management

The application uses Vue 3's Composition API for reactive state management:

```javascript
// Cart state
const cartProducts = ref([]);
const cartSummary = ref({ totalAmount: 0, totalItems: 0 });

// UI state
const loading = ref(false);
const error = ref(null);

// User state
const selectedManufacturer = ref(null);
const shippingInfo = ref({});
```

### State Synchronization

State synchronization between components is handled through:

1. **Service Layer**: Centralized business logic in service classes
2. **Event System**: Custom events for cross-component communication
3. **Router State**: URL-based state for navigation
4. **localStorage**: Persistent state for cart and preferences

---

## Error Handling

### Error Classification

#### 1. Network Errors
- **Connection failures**: No internet or server unavailable
- **Timeout errors**: Request takes too long
- **HTTP status errors**: 4xx and 5xx responses

#### 2. Validation Errors
- **Form validation**: Required fields, format validation
- **Business rules**: Stock availability, pricing validation
- **Authentication**: Token expiry, insufficient permissions

#### 3. Data Errors
- **Parsing errors**: Invalid JSON responses
- **Missing data**: Required fields not present
- **Type errors**: Unexpected data types

### Error Handling Strategy

#### Service Layer Error Handling

```javascript
class OrderService {
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Log error for monitoring
      this.logError('ORDER_CREATION_FAILED', {
        error: error.message,
        orderData,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw for component handling
      throw error;
    }
  }
}
```

#### Component Error Handling

```javascript
// In Vue components
async function placeOrder() {
  try {
    processingOrder.value = true;
    const order = await orderService.createOrder(orderData);
    
    toast.add({
      severity: 'success',
      summary: t('checkout.success'),
      detail: t('checkout.orderPlaced'),
      life: 5000
    });
    
    router.push('/dashboard');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('checkout.error'),
      detail: error.message || t('checkout.orderError'),
      life: 3000
    });
  } finally {
    processingOrder.value = false;
  }
}
```

### Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "error": "VALIDATION_ERROR",
  "detail": "Human-readable error message",
  "field": "specificField",
  "code": "FIELD_REQUIRED",
  "timestamp": "2025-07-06T20:43:48.662Z"
}
```

### Fallback Mechanisms

#### 1. Mock Data Fallbacks
```javascript
// Manufacturer service with mock fallback
try {
  const manufacturers = await this.fetchFromAPI();
  return manufacturers;
} catch (error) {
  console.warn('API unavailable, using mock data');
  return manufacturerMockService.getAllManufacturers();
}
```

#### 2. Retry Logic
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

#### 3. Graceful Degradation
- **Cart**: localStorage fallback when API is unavailable
- **Products**: Cached data when fresh data can't be loaded
- **Images**: Placeholder images when product images fail to load

---

## Security & Authentication

### Authentication Flow

#### 1. JWT Token Management
```javascript
// Token storage and validation
const token = localStorage.getItem('token');
const isValidToken = token && !isTokenExpired(token);

// Automatic token refresh
if (isTokenExpired(token)) {
  await refreshAuthToken();
}
```

#### 2. Request Authentication
All API requests include authentication headers:

```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

#### 3. Route Guards
```javascript
// Authentication guard for protected routes
export const authenticationGuard = (to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    next('/sign-in');
    return;
  }
  
  next();
};
```

### Data Security

#### 1. Input Validation
- **Client-side**: Form validation with PrimeVue validators
- **Sanitization**: XSS prevention with proper escaping
- **Type checking**: Runtime type validation

#### 2. Secure Storage
- **Sensitive data**: Never stored in localStorage
- **Payment data**: Handled by Stripe, not stored locally
- **User preferences**: Non-sensitive data only

#### 3. API Security
- **HTTPS only**: All API communication encrypted
- **CORS policy**: Restricted to authorized domains
- **Rate limiting**: Prevent abuse and DDoS

### Permission Management

#### User Roles
- **Customer**: Can browse, purchase, track orders
- **Manufacturer**: Can view assigned orders, update fulfillment
- **Admin**: Full system access

#### Permission Checks
```javascript
// Role-based access control
const hasPermission = (user, action, resource) => {
  const permissions = user.roles.flatMap(role => role.permissions);
  return permissions.some(p => 
    p.action === action && p.resource === resource
  );
};
```

---

## Testing Strategy

### Unit Testing

#### Service Layer Tests
```javascript
// Example: LocalCartService tests
describe('LocalCartService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should add product to cart', () => {
    const service = new LocalCartService();
    service.addToCart('product-1', 2);
    
    const items = service.getCartItems();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('product-1');
    expect(items[0].quantity).toBe(2);
  });

  test('should update existing item quantity', () => {
    const service = new LocalCartService();
    service.addToCart('product-1', 2);
    service.addToCart('product-1', 1);
    
    const items = service.getCartItems();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });
});
```

#### Component Tests
```javascript
// Example: CheckoutComponent tests
describe('CheckoutComponent', () => {
  test('should display cart items', async () => {
    const wrapper = mount(CheckoutComponent);
    
    // Mock cart data
    wrapper.vm.cartProducts = [
      { id: '1', name: 'Test Product', quantity: 2, price: 29.99 }
    ];
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.cart-item')).toBeTruthy();
    expect(wrapper.text()).toContain('Test Product');
  });
});
```

### Integration Testing

#### API Integration Tests
```javascript
describe('Order API Integration', () => {
  test('should create order successfully', async () => {
    const orderData = {
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 2, unitPrice: 29.99 }],
      totalAmount: 59.98
    };
    
    const response = await orderService.createOrder(orderData);
    
    expect(response.id).toBeDefined();
    expect(response.status).toBe('pending');
    expect(response.totalAmount).toBe(59.98);
  });
});
```

### End-to-End Testing

#### User Journey Tests
```javascript
// Example: Complete checkout flow
test('user can complete checkout flow', async () => {
  // 1. Add product to cart
  await page.goto('/explore');
  await page.click('[data-testid="add-to-cart-btn"]');
  
  // 2. Navigate to checkout
  await page.click('[data-testid="cart-icon"]');
  await page.click('[data-testid="checkout-btn"]');
  
  // 3. Select manufacturer
  await page.selectOption('[data-testid="manufacturer-select"]', 'manufacturer-1');
  
  // 4. Fill shipping info
  await page.fill('[data-testid="full-name"]', 'John Doe');
  await page.fill('[data-testid="address"]', '123 Main St');
  
  // 5. Place order
  await page.click('[data-testid="place-order-btn"]');
  
  // 6. Verify success
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

### Performance Testing

#### Load Testing
```javascript
// Example: Cart performance test
test('cart should handle 100 products efficiently', () => {
  const service = new LocalCartService();
  const startTime = performance.now();
  
  // Add 100 products
  for (let i = 0; i < 100; i++) {
    service.addToCart(`product-${i}`, Math.floor(Math.random() * 5) + 1);
  }
  
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100); // Should take less than 100ms
});
```

---

## Deployment & Configuration

### Environment Configuration

#### Development Environment
```javascript
// .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=dev-cloudinary
VITE_ENABLE_MOCK_DATA=true
```

#### Production Environment
```javascript
// .env.production
VITE_API_BASE_URL=https://api.q2app.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_CLOUDINARY_CLOUD_NAME=q2-production
VITE_ENABLE_MOCK_DATA=false
```

### Build Configuration

#### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['primevue', '@primeuix/themes']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['primevue/usetoast', 'primevue/tooltip']
  }
});
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.q2app.com
    depends_on:
      - api
      
  api:
    image: q2-api:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - STRIPE_SECRET_KEY=sk_...
```

### Monitoring & Analytics

#### Error Tracking
```javascript
// Error reporting integration
window.addEventListener('error', (event) => {
  // Send error to monitoring service
  errorTracker.captureException(event.error, {
    user: getCurrentUser(),
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
});
```

#### Performance Monitoring
```javascript
// Performance tracking
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      analytics.track('page_load_time', {
        page: entry.name,
        loadTime: entry.loadEventEnd - entry.loadEventStart
      });
    }
  }
});
observer.observe({ entryTypes: ['navigation'] });
```

### Continuous Integration

#### GitHub Actions Workflow
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker build -t q2-frontend .
          docker push registry.com/q2-frontend:latest
```

---

## Conclusion

The Q2 Order Processing System is a comprehensive, modern e-commerce solution that provides:

- **Scalable Architecture**: Service-oriented design with clear separation of concerns
- **Performance**: localStorage-based cart with API integration for optimal speed
- **Security**: JWT authentication, input validation, and secure payment processing
- **User Experience**: Responsive design, internationalization, and real-time updates
- **Maintainability**: Well-documented code, comprehensive testing, and monitoring

This documentation serves as the definitive guide for understanding, maintaining, and extending the order processing system.
