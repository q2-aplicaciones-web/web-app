export default class Comment {
  constructor({ id, userId, text, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.text = text;
    this.createdAt = createdAt;
  }
}