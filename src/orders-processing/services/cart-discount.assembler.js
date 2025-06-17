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