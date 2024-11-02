const prisma = require("../prisma");
const uuid = require("uuid");

const apps = [
  {
    name: "Apocalyton",
    email: "qr.mint.dev@gmail.com",
    payments: [
      {
        payment: "arcpay",
        keys: {
          private_key: "fa91cc3f0264953aec9e848c0a0bef7dd16e17cc5b69133ee4911316396fb7df",
          api_key: "ee7a635b-eec4-416c-9568-cc4310f13a1b"
        }
      },
      {
        payment: "aeon",
        keys: {
          private_key: "PrteX3442eVQ4fNYJGFWitPylrKZ",
          api_key: "opweePd6i9ysEvRleln3ppesic"
        }
      },
      {
        payment: "stars",
        keys: {
          telegram_id: "7176703496",
          token: "7176703496:AAFZgjTuLw9MYr8xmyWQn0WH_Nc_An70PdE"
        }
      }
    ]
  },
];

function generateReferralCode() {
  return uuid.v4().replace(/-/g, "").substring(0, 16); // Генерация UUID
}

(async () => {
  for (const item of apps) {
    item.key = generateReferralCode();
    let app = await prisma.apps.findFirst({
      where: { name: item.name }
    })
    if (!app) {
      app = await prisma.apps.create({
        data: {
          name: item.name,
          email: item.email,
          key: item.key,
        }
      });
    } else {
      app = await prisma.apps.update({
        data: {
          name: item.name,
          email: item.email,
        },
        where: { id: app.id }
      });
    }

    for (const paymentItem of item.payments) {
      const foundPayment = await prisma.app_payments.findFirst({
        where: { payment: paymentItem.payment }
      });
      if (!foundPayment) {
        await prisma.app_payments.create({
          data: {
            payment: paymentItem.payment,
            keys: paymentItem.keys,
            app_id: app.id
          }
        });
      } else {
        await prisma.app_payments.update({
          data: {
            payment: paymentItem.payment,
            keys: paymentItem.keys,
          },
          where: { id: foundPayment.id }
        });
      }
    }
  }
})();