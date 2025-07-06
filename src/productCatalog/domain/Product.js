// Dominio: Product.js
export default class Product {
  constructor({ id, projectId, priceAmount, priceCurrency, status, projectTitle, projectPreviewUrl, userId, likeCount, createdAt, updatedAt }) {
    this.id = id;
    this.projectId = projectId;
    this.priceAmount = priceAmount;
    this.priceCurrency = priceCurrency;
    this.status = status;
    this.projectTitle = projectTitle;
    this.projectPreviewUrl = projectPreviewUrl;
    this.userId = userId;
    this.likeCount = likeCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  // Métodos de dominio, validaciones, etc.
}
