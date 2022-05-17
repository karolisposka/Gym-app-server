require('dotenv').config();

module.exports = {
  port: process.env.SERVER_PORT,
  jwtCode: process.env.JWT_CODE,
  mysqlConfig: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  },
};
