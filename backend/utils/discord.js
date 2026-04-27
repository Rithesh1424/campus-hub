const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const sendDiscordNotification = async (message, imagePath) => {
  const webhookUrl = "https://discord.com/api/webhooks/1493474108195733505/z2Hh3r0-Rl0lngT9IvwLptX0TtgyzZeopvs6ffGu7_V7MuPym1kItsffNMhwAmIOn0vG";

  try {
    const form = new FormData();
    form.append('content', message);
    form.append('username', "Campus Hub Pager");

    if (imagePath && fs.existsSync(imagePath)) {
      form.append('file', fs.createReadStream(imagePath));
    }

    await axios.post(webhookUrl, form, { headers: form.getHeaders() });
  } catch (error) {
    console.error("❌ DISCORD ERROR:", error.response?.data || error.message);
  }
};

module.exports = sendDiscordNotification;