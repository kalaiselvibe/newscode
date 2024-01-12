"use strict";
var mysql = require("mysql");
const debug = require("debug")("test");
var util = require("util");

var pool = mysql.createPool({
  connectionLimit: 5000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  user: "sql12676184",
  password: "hkJfbP56pI",
  port:3306,
  database: "sql12676184",
  host: "sql12.freesqldatabase.com",
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }
  if (connection) connection.release();
  console.log("connected");
  return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;


