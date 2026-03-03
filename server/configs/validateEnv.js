export const CLERK_ENV_KEYS = [
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
];

export const REQUIRED_ENV_KEYS = [
  "MONGODB_URI",
  ...CLERK_ENV_KEYS,
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_USER",
  "SMTP_PASS",
  "SENDER_EMAIL",
];

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

export const getMissingEnvKeys = (keys) => keys.filter((key) => !hasValue(process.env[key]));

export const hasEnvKeys = (keys) => getMissingEnvKeys(keys).length === 0;
