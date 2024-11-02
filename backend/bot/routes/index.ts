import { Composer, CallbackQueryContext, InlineKeyboard } from "grammy";

import { commands } from "./commands";
import { BotContext } from "../context";
import { InlineQueryResult } from "grammy/types";

import prisma from "../../prisma";
import * as socket_connection from "../../utils/socket_connection";

let socket = null;
let socketIsReady = socket_connection
  .createClient()
  .then((res) => {
    socket = res;
  })
  .catch((err) => {
    console.error("Fatal error (0):", err);
  });


export const app = new Composer();

app.use(commands);
app.callbackQuery("menu", async (ctx: CallbackQueryContext<BotContext>) => {
  return await ctx.Menu();
});

const messageText = (code) =>
  `🎨🌐 Transform your images into unique QR Art and mint them on the TON blockchain!

Our app offers you an exclusive opportunity to create your own NFTs using an innovative process of converting images into QR Art.

📲 Simply upload your image, and we'll help you make it a part of the TON blockchain. Start your journey into the world of digital art right now!

https://t.me/QrMint_Bot/app?startapp=${code}`;

app.inlineQuery(/invite\/(.+)/, async (ctx) => {
  const code = ctx.match[1];
  const imageSource = `${process.env.BASE_HOST}/images/intro.jpg`;
  const inlineQuery: InlineQueryResult = {
    id: "invite",
    photo_url: imageSource,
    thumbnail_url: imageSource,
    //caption: `Create QR Art and Mint \n https://t.me/QrMint_Bot/app?startapp=${code}`,
    type: "photo",
    title: "Invite Link",
    description: `Create QR Art and Mint.`,
    parse_mode: "HTML",
    input_message_content: {
      message_text: messageText(code),
      photo_url: imageSource,
      link_preview_options: {
        is_disabled: false,
      },
    },
    reply_markup: new InlineKeyboard().row({
      text: "OPEN APP",
      url: `https://t.me/QrMint_Bot/app?startapp=${code}`,
    }),
  };
  await ctx.answerInlineQuery([inlineQuery], {
    is_personal: true,
  });
});

app.preCheckoutQuery('invoice_payload', async ctx => {
  try {
    // You can add validation logic here if needed
    await ctx.answerPreCheckoutQuery(true);
  } catch (error) {
    console.error('Pre-checkout error:', error);
    await ctx.answerPreCheckoutQuery(false, 'Payment failed, please try again.');
  }
});

app.on(":successful_payment", async (ctx) => {
  const payload = ctx.message?.successful_payment?.invoice_payload;
  console.log(ctx.message?.successful_payment);
  try {
    if (!payload) {
      throw new Error('No order payload found');
    }
    let order = await prisma.order.findFirst({
      select: { id: true },
      where: { order_no: payload }
    });
    if (!order) {
      throw new Error('No order found');
    }
    // Update order status to confirmed
    order = await prisma.orders.update({
      where: { id: order.id },
      data: { status: "confirmed" }
    });
    await socketIsReady;
    socket.emit("order", order);
    // Send confirmation message to user
    await ctx.reply('✅ Payment successful! Your order has been confirmed.');
    
  } catch (error) {
    console.error('Payment processing error:', error);
    await ctx.reply('⚠️ There was an issue processing your payment. Please contact support.');
    
    // Update order status to failed
    if (payload) {
      await prisma.orders.update({
        where: { order_no: payload },
        data: { status: "failed" }
      });
    }
  }
});