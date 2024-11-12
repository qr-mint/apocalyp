export class Storage {
  constructor ({ storage: localStorage, name }) {
    this.storage = localStorage;
    this.name = name;
  }

  save(data) {
    this.storage.setItem(this.name, data);
  }

  get() {
    return this.storage.getItem(this.name);
  }

  delete () {
    this.storage.removeItem(this.name);
  }
}