export class Fulfillment {
  constructor({
    id = '',
    order_id = '',
    status = 'pending',
    received_date = (new Date()).toISOString(),
    shipped_date = null,
    manufacturer_id = ''
  } = {}) {
    this.id = id;
    this.order_id = order_id;
    this.status = status;
    this.received_date = received_date;
    this.shipped_date = shipped_date;
    this.manufacturer_id = manufacturer_id;
  }

  get formattedReceivedDate() {
    return new Date(this.received_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get formattedShippedDate() {
    if (!this.shipped_date) return 'Not shipped';
    return new Date(this.shipped_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get statusDisplayName() {
    switch ((this.status || '').toLowerCase()) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return this.status;
    }
  }
}