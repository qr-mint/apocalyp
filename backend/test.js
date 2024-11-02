const crypto = require('crypto');

function generateSignature(data, secretKey) {
  // Сортируем ключи объекта по алфавиту
  const sortedKeys = Object.keys(data).sort();
  
  // Создаём строку в формате URL-запроса
  const queryString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  const stringToSign = `${queryString}&key=${secretKey}`;
  console.log(stringToSign);
  console.log("appId=TEST000001&merchantOrderNo=11126&orderAmount=1000&payCurrency=USD&paymentExchange=16f021b0-f220-4bbb-aa3b-82d423301957,9226e5c2-ebc3-4fdd-94f6-ed52cdce1420&paymentTokens=USDT,ETH&userId=505884978@qq.com&key=ixdFyEZzZo7m95dr7qWAjKBaEj4qSMMdeSmW0b5nCak");
  let buffer;
    try {
      buffer = Buffer.from(stringToSign, "UTF-8");
    } catch (error) {
      buffer = Buffer.from(stringToSign); 
    }
  const j = crypto.createHash('sha512').update(buffer);
  console.log(j, "j")
  return toHex(j);
}

function toHex(input) {
  if (!input) return null;
  return input.toString('hex').toUpperCase();
}

const jsData = {
  "appId": "TEST000001",
  "merchantOrderNo": "11126",
  "userId": "505884978@qq.com",
  "orderAmount": "1000",
  "payCurrency": "USD",
  "paymentTokens": "USDT,ETH",
  "paymentExchange": "16f021b0-f220-4bbb-aa3b-82d423301957,9226e5c2-ebc3-4fdd-94f6-ed52cdce1420"
}
console.log(generateSignature(jsData, "ixdFyEZzZo7m95dr7qWAjKBaEj4qSMMdeSmW0b5nCak"));
//3962E8FF2ABD24B806D744C6630B95A05855A2AB86944CCF52009D6E2582787EB0F34CFF323843DDA55B148D770390598AF335DDBECC61D702AA1A87EE93D1E0
//3962E8FF2ABD24B806D744C6630B95A05855A2AB86944CCF52009D6E2582787EB0F34CFF323843DDA55B148D770390598AF335DDBECC61D702AA1A87EE93D
