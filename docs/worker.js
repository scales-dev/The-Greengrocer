import { Resend } from "resend";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/send-email") {

            if (request.method !== "POST") {
                return Response.json(
                    { error: "Method not allowed" },
                    { status: 405 }
                );
            }

            try {
                const { name, email, phone, message } = await request.json();

                if (!name || !email || !message) {
                    return Response.json(
                        { error: "Missing required fields" },
                        { status: 400 }
                    );
                }

                const resend = new Resend(env.RESEND_API_KEY);

                const { data, error } = await resend.emails.send({
                    from: "thegreengrocer@myexoticfruit.com",
                    to: ["jack@myexoticfruit.com"],
                    replyTo: email,
                    subject: `Website enquiry from ${name}`,
                    text:
                        `Name: ${name}\n` +
                        `Email: ${email}\n` +
                        `Phone: ${phone || "Not provided"}\n\n` +
                        message
                });

                if (error) {
                    console.error(error);

                    return Response.json(
                        { error: "Failed to send email" },
                        { status: 500 }
                    );
                }

                return Response.json({
                    success: true,
                    id: data?.id
                });

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