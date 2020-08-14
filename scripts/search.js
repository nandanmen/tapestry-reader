const mysql = require("promise-mysql");
const unserialize = require("./unserialize");
const fs = require("fs");

const run = async (predicate) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: "8889",
    user: "root",
    password: "root",
    database: "ubc",
  });

  const results = await connection.query(
    `select meta_value from wp_4_postmeta where meta_key = 'tapestry_node_data'`
  );
  const items = results
    .map(({ meta_value }) => unserialize(meta_value))
    .filter(([success, _]) => success)
    .map(([_, node]) => node)
    .filter(predicate);
  connection.end();
  return items;
};

run((node) => true /* change this! */).then((results) => console.log(results));
