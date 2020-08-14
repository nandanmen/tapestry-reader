const mysql = require("promise-mysql");
const unserialize = require("./unserialize");
const fs = require("fs");

const run = async (postId, outFile) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: "8889",
    user: "root",
    password: "root",
    database: "ubc",
  });

  const results = await connection.query(
    `SELECT post_id, meta_value FROM wp_4_postmeta WHERE meta_key = 'tapestry'`
  );
  const rawTapestry = results.find(({ post_id }) => post_id == postId);
  let [success, tapestry] = unserialize(rawTapestry.meta_value);
  if (!success) {
    console.error("Failed to parse tapestry");
    console.log(tapestry);
    return;
  }
  console.log(tapestry.nodes.length);

  const nodes = await Promise.all(
    tapestry.nodes.map(async (nodeId) => {
      const metaResults = await connection.query(
        `SELECT meta_value FROM wp_4_postmeta WHERE meta_id = ${nodeId}`
      );
      let [success, nodeMeta] = unserialize(metaResults[0].meta_value);
      if (!success) {
        console.error("Failed to parse node meta");
        console.log(nodeMeta);
        return;
      }

      const nodeDataResults = await connection.query(
        `SELECT meta_value FROM wp_4_postmeta WHERE post_id = ${nodeMeta.post_id} AND meta_key = 'tapestry_node_data'`
      );
      return unserialize(nodeDataResults[0].meta_value);
    })
  );
  const successNodes = nodes
    .filter((results) => results[0])
    .map((results) => results[1]);

  const newNodes = new Set(successNodes.map((node) => node.id));
  console.log(`Node length before: ${tapestry.nodes.length}`);
  tapestry.nodes = successNodes;
  console.log(`Node length after: ${tapestry.nodes.length}`);

  console.log(`Link length before: ${tapestry.links.length}`);
  tapestry.links = tapestry.links.filter((link) => {
    return newNodes.has(link.source) && newNodes.has(link.target);
  });
  console.log(`Link length after: ${tapestry.links.length}`);

  fs.writeFileSync(
    `../out/tapestries/${outFile}.json`,
    JSON.stringify(tapestry, null, 2)
  );

  connection.end();
};

const [tapestryId, outFile = "tapestry"] = process.argv.slice(2);
run(tapestryId, outFile);
