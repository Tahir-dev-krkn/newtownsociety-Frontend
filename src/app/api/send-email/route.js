import dns from "node:dns/promises";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

async function createTransporter() {
  const [smtpHost] = await dns.resolve4("smtp.gmail.com");

  return nodemailer.createTransport({
    host: smtpHost || "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      servername: "smtp.gmail.com",
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function isAuthorized(request) {
  const expectedSecret = process.env.MAIL_RELAY_SECRET;
  const actualSecret = request.headers.get("x-mail-relay-secret");

  return Boolean(expectedSecret && actualSecret && actualSecret === expectedSecret);
}

function isSafeNewTownMail({ to, subject, text }) {
  const validEmail = typeof to === "string" && /^\S+@\S+\.\S+$/.test(to);
  const validSubject =
    subject === "Verify your New Town Society account" ||
    subject === "Reset your New Town Society password";
  const validBrandText = typeof text === "string" && text.includes("New Town Society");
  const validVerification = subject === "Verify your New Town Society account"
    && text.includes("email verification OTP");
  const validReset = subject === "Reset your New Town Society password"
    && text.includes("reset your New Town Society password")
    && text.includes("resetToken=");

  return validEmail && validSubject && validBrandText && (validVerification || validReset);
}

export async function GET(request) {
  try {
    const transporter = await createTransporter();
    await transporter.verify();

    return Response.json({
      ok: true,
      emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        code: error.code,
        responseCode: error.responseCode,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { to, subject, text } = await request.json();

    if (!to || !subject || !text) {
      return Response.json({ error: "Missing email fields" }, { status: 400 });
    }

    if (!isAuthorized(request) && !isSafeNewTownMail({ to, subject, text })) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transporter = await createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        code: error.code,
        responseCode: error.responseCode,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
