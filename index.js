const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    Message: "Too many requests, please try again later.",
    ClientError: true,
    ServerError: false,
  },
});
app.use(limiter);

app.post("/api/webhooks/:WebhookID/:WebhookToken", async (req, res) => {
  try {
    const WebhookID = req.params.WebhookID;
    const WebhookToken = req.params.WebhookToken;

    const DiscordWebhookURL = `https://discord.com/api/webhooks/${WebhookID}/${WebhookToken}`;
    const Request = await fetch(DiscordWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const LocaleString = new Date().toLocaleString();

    if (Request.ok) {
      console.log(`✅ | Webhook forwarded successfully ${LocaleString}`);
      return res.status(200).json({
        Message: "Webhook forwarded successfully",
        ClientError: false,
        ServerError: false,
      });
    } else {
      const Decoded = await Request.json();
      console.log(
        `⚠️ | An error occured while forwarding webhook ${LocaleString}`
      );
      return res.status(400).json({
        Message: Decoded,
        ClientError: true,
        ServerError: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      Message: error.message ?? null,
      ClientError: false,
      ServerError: true,
    });
  }
});

app.listen(process.env.PORT ?? 3000, () => {
  console.log(
    `✅ | Express Server is running on port ${process.env.PORT ?? 3000}`
  );
});
