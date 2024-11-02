import { InlineKeyboard, Context, Api } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";

const introMessage = `Play Game`;

export class BotContext extends Context {
  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
  }

  public async Menu() {
    const inlineKeyboard = new InlineKeyboard()
      .row({
        text: "Open",
        web_app: { url: process.env.APP_URL },
      })
      .row(
        {
          text: "Channel (EN)",
          url: "https://t.me/QRMint",
        },
        {
          text: "Channel (RU)",
          url: "https://t.me/qr_mint",
        }
      )
      .row({
        text: "Group",
        url: "https://t.me/qrmint_group",
      });

    return await this.replyWithPhoto(
      `${process.env.BASE_HOST}/images/intro.jpg`,
      {
        reply_markup: inlineKeyboard,
        caption: introMessage,
        parse_mode: "HTML",
      }
    );
  }
}
