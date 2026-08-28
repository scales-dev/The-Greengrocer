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

                if (!env.RESEND_API_KEY) {
                    console.error("RESEND_API_KEY is not configured");

                    return Response.json(
                        { error: "Email service is not configured" },
                        { status: 500 }
                    );
                }

                const resend = new Resend(env.RESEND_API_KEY);

                const { data, error } = await resend.emails.send({
                    from: "onboarding@resend.dev",
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
                        { error: error.message || "Failed to send email" },
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
                    { error: "Unable to process request" },
                    { status: 500 }
                );
            }
        }

        return env.ASSETS.fetch(request);
    }
};