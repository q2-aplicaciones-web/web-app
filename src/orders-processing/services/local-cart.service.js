/**
 * LocalCartService - localStorage-based cart management
 * 
 * This service manages the shopping cart using localStorage for persistence
 * and integrates with the Product Catalog API to fetch full product details.
 * 
 * API ENDPOINTS USED:
 * 
 * 1. GET /api/products
 *    - Description: Fetch all products to get full details for cart items
 *    - Used by: getCartProducts()
 *    - Response: Array of product objects with id, name, description, priceAmount, etc.
 *    - Example: [
 *        {
 *          id: "prod_123",
 *          name: "Cotton T-Shirt",
 *          description: "Comfortable cotton t-shirt",
 *          priceAmount: 29.99,
 *          currency: "USD",
 *          category: "Apparel",
 *          garmentColor: "blue",
 *          garmentSize: "M",
 *          garmentGender: "unisex",
 *          imageUrl: "https://cloudinary.../tshirt.jpg",
 *          previewUrl: "https://cloudinary.../preview.jpg"
 *        }
 *      ]
 * 
 * 2. GET /api/products/{productId}
 *    - Description: Fetch specific product details (if needed for individual lookups)
 *    - Used by: Future enhancement for individual product validation
 *    - Response: Single product object
 * 
 * STORAGE SCHEMA (localStorage):
 * Key: 'quri_cart_items'
 * Value: JSON Array of cart items
 * Structure: [
 *   {
 *     productId: "prod_123",
 *     quantity: 2,
 *     addedAt: "2025-07-06T10:30:00.000Z"
 *   }
 * ]
 * 
 * CART PRODUCT ENHANCED SCHEMA:
 * When getCartProducts() is called, cart items are enhanced with full product data:
 * {
 *   ...productData,           // All product fields from API
 *   cartQuantity: 2,          // Quantity in cart
 *   addedAt: "2025-07-06...", // When added to cart
 *   subtotal: 59.98           // priceAmount * cartQuantity
 * }
 */

import productCatalogService from '../../productCatalog/application/productCatalogService.js';

const CART_STORAGE_KEY = 'quri_cart_items';

class LocalCartService {
  // 1. Add product ID to localStorage
  addToCart(productId, quantity = 1) {
    const cartItems = this.getCartItems();
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
    
    this.saveCartItems(cartItems);
    return cartItems;
  }

  // 2. Get product IDs from localStorage
  getCartItems() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // 3. Fetch full product details for cart items
  async getCartProducts() {
    const cartItems = this.getCartItems();
    if (cartItems.length === 0) return [];

    try {
      // Fetch all products that are in the cart
      const allProducts = await productCatalogService.getAllProducts();
      
      // Map cart items with their full product details and enhance with additional info
      return cartItems.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.productId);
        if (!product) {
          console.warn(`Product ${cartItem.productId} not found`);
          return null;
        }
        
        // Enhanced product object with all available details
        return {
          ...product,
          cartQuantity: cartItem.quantity,
          addedAt: cartItem.addedAt,
          subtotal: (product.priceAmount || 0) * cartItem.quantity,
          // Additional computed fields for better display
          currency: product.currency || 'USD',
          isAvailable: product.status !== 'discontinued' && product.status !== 'out_of_stock',
          displayName: product.name || product.projectTitle || 'Untitled Product',
          displayDescription: product.description || `Custom design by ${product.designerName || 'Unknown Designer'}`,
          // Ensure we have fallback values for missing attributes
          garmentColor: product.garmentColor || product.color,
          garmentSize: product.garmentSize || product.size,
          garmentGender: product.garmentGender || product.gender,
          // Enhanced metadata
          productMetadata: {
            id: product.id,
            sku: product.sku,
            category: product.category,
            designerId: product.designerId,
            designerName: product.designerName,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            views: product.views || 0,
            likes: product.likes || 0,
            status: product.status || 'available'
          }
        };
      }).filter(Boolean); // Remove null entries
    } catch (error) {
      console.error('Error fetching cart products:', error);
      throw error;
    }
  }

  // Update quantity of item in cart
  updateQuantity(productId, quantity) {
    const cartItems = this.getCartItems();
    const item = cartItems.find(item => item.productId === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCartItems(cartItems);
      }
    }
    
    return cartItems;
  }

  // Remove item from cart
  removeFromCart(productId) {
    const cartItems = this.getCartItems();
    const filtered = cartItems.filter(item => item.productId !== productId);
    this.saveCartItems(filtered);
    return filtered;
  }

  // Clear entire cart
  clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }

  // Get cart summary
  async getCartSummary() {
    const products = await this.getCartProducts();
    const totalItems = products.reduce((sum, product) => sum + product.cartQuantity, 0);
    const totalAmount = products.reduce((sum, product) => sum + product.subtotal, 0);
    
    return {
      products,
      totalItems,
      totalAmount,
      itemCount: products.length
    };
  }

  // Private helper to save cart items
  saveCartItems(cartItems) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }

  // Get cart item count for UI badges
  getCartItemCount() {
    const cartItems = this.getCartItems();
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}

export default new LocalCartService();
