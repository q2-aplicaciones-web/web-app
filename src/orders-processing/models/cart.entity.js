export class CartItem {
  constructor() {
    this.project_id = '';
    this.quantity = 1;
    this.unit_price = 0;
    this.projectImage = '';
    this.projectName = '';
    this.projectDescription = '';
  }
  get subtotal() {
    return this.unit_price * this.quantity;
  }
}

export class Cart {
  constructor() {
    this.id = '';
    this.user_id = '';
    this.items = [];
    this.applied_discounts = [];
  }
}