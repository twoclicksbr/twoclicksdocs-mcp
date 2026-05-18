import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3100', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'https://docs.twoclicks.com.br/api',
};
