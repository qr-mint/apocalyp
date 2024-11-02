const prisma = require('../prisma');

class Payments {
  constructor(name) {
    this.name = name;
  }
  
  async loadKeys (key) {
    const app = await prisma.apps.findFirst({
      select: { email: true, payments: { select: { keys: true, payment: true } } }, 
      where: { key }
    });
    
    const keys = app.payments.find((p) => p.payment === this.name).keys;
    this.privateKey = keys.private_key;
    this.apiKey = keys.api_key;
    this.email = app.email;
  }
}

module.exports.Payments = Payments;