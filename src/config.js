import dotenv from 'dotenv';
import path from 'path';

// Read universal config
dotenv.config();

// Read Node environment-specific config
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

const config = {
  jwtSecret: process.env.JWT_SECRET,
  enableVerificationPublishing:
    (process.env.ENABLE_VERIFY_PUBLISHING || 'false').toLowerCase() == 'true',
};

export { config };
