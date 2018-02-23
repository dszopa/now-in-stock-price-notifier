module.exports = class TrackingRow {
  constructor(id, name, store, url, status, price, lastStock) {
    this.id = id;
    this.name = name;
    this.store = store;
    this.url = url;
    this.status = status;
    this.price = price;
    this.lastStock = lastStock;
  }
};
