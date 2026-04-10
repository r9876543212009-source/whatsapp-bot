const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;

// التحقق من الـ Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// استقبال الرسائل
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry?.forEach(entry => {
      entry.changes?.forEach(change => {
        const messages = change.value?.messages;
        if (!messages) return;
        messages.forEach(msg => {
          if (msg.type === "text") {
            console.log("رسالة من:", msg.from, "النص:", msg.text.body);
          }
        });
      });
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// إرسال رسالة
async function sendMessage(to, templateName) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: templateName,
      language: { code: "ar_SA" } // ✅ تم التصحيح
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log("نتيجة الإرسال:", data);
  return data;
}

// إرسال تجريبي
app.get("/send-test", async (req, res) => {
  const customers = [
    "966580586898",
    "966556012150",
    "966555717471"
  ];

  const results = []; // ✅ تم التصحيح
  for (const number of customers) {
    const r = await sendMessage(number, "laundries");
    results.push(r);
  }

  res.json(results); // ✅ تم التصحيح
});

app.listen(PORT, () => console.log("السيرفر شغال على بورت", PORT));
