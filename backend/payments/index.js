const Aeon = require('./aeon');
const Arcpay = require('./arcpay');
const Stars = require('./stars');

module.exports = {
  aeon: new Aeon(),
  arcpay: new Arcpay(),
  stars: new Stars()
};