export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/send-email" && request.method === "POST") {
            try {
                const { name, email, message } = await request.json();

                if (!name || !email || !message) {
                    return Response.json(
                        { error: "Missing required fields" },
                        { status: 400 }
                    );
                }

                const response = await fetch(
                    "https://api.resend.com/emails",
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            from: "thegreengrocer@myexoticfruit.com",
                            to: "thegreengrocer@myexoticfruit.com",
                            reply_to: email,
                            subject: `Website enquiry from ${name}`,
                            text: `Name: ${name}\nEmail: ${email}\n\n${message}`
                        })
                    }
                );

                if (!response.ok) {
                    console.error(await response.text());

                    return Response.json(
                        { error: "Failed to send email" },
                        { status: 500 }
                    );
                }

                return Response.json({ success: true });

            } catch (error) {
                console.error(error);

                return Response.json(
                    { error: "Invalid request" },
                    { status: 400 }
                );
            }
        }

        return env.ASSETS.fetch(request);
    }
};