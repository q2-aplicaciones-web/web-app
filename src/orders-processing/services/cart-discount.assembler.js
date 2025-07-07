/**
 * Cart Discount Assembler
 * 
 * This utility assembles cart data with discount calculations.
 * It does not make API calls directly but processes data from:
 * - Cart items with subtotals
 * - Discount policies (fetched via discount-policy.service.js)
 * 
 * The assembler calculates:
 * - Cart subtotal (sum of all item subtotals)
 * - Applied discount amount based on policy percentage
 * - Final total after discount application
 * 
 * INPUT:
 * - cart: Cart object with items and applied_discounts
 * - policies: Array of discount policy objects
 * 
 * OUTPUT:
 * - Enhanced cart object with calculated totals and discount info
 */

const cartDiscountAssembler = {
  assemble(cart, policies) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    let discount = 0;
    let discountPolicy = null;
    let appliedDiscountId = cart.applied_discounts && cart.applied_discounts.length > 0
      ? cart.applied_discounts[0].id
      : undefined;
    if (appliedDiscountId && policies && policies.length > 0) {
      discountPolicy = policies.find(p => p.id === appliedDiscountId);
      if (discountPolicy) {
        discount = subtotal * (discountPolicy.discount_percentage / 100);
      }
    }
    const total = subtotal - discount;
    return {
      items: cart.items,
      subtotal,
      discount,
      total,
      discountPolicy
    };
  }
};

export default cartDiscountAssembler;