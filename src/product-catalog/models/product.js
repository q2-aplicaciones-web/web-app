export default class Product {
  constructor({
    id, projectId, manufacturerId, price, likes, tags, createdAt, gallery,
    rating, status, comments, projectDetails
  }) {
    this.id = id;
    this.projectId = projectId;
    this.manufacturerId = manufacturerId;
    this.price = price;
    this.likes = likes;
    this.tags = tags;
    this.createdAt = createdAt;
    this.gallery = gallery;
    this.rating = rating;
    this.status = status;
    this.comments = comments;
    this.projectDetails = projectDetails;
  }
}