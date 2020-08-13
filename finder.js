const mysql = require("promise-mysql");
const unserialize = require("./unserialize");
const fs = require("fs");

const run = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    port: "8889",
    user: "root",
    password: "root",
    database: "ubc",
  });

  const getNodeIdFromPostId = async (postId) => {
    const results = await connection.query(
      `SELECT meta_value FROM wp_4_postmeta WHERE post_id = ${postId} AND meta_key = "tapestry_node_data"`
    );
    if (results.length && results[0].meta_value) {
      const [success, nodeData] = unserialize(results[0].meta_value);
      if (success) {
        return nodeData;
      }
    }
    return null;
  };

  const find = async (nodePostId) => {
    const results = await connection.query(
      "SELECT post_id, meta_value FROM wp_4_postmeta WHERE meta_key = 'tapestry'"
    );

    const tapestries = [];
    for (const result of results) {
      const { meta_value, post_id } = result;
      const [success, parsed] = unserialize(meta_value);
      if (success) {
        tapestries.push({ ...parsed, id: post_id });
      }
      if (post_id === 3293) {
        console.log(parsed.nodes.length);
      }
    }

    const node = await getNodeIdFromPostId(nodePostId);
    const tapestryWithNode = tapestries.find((tapestry) => {
      return tapestry.nodes.includes(node && node.id);
    });
    return tapestryWithNode;
  };

  const findTapestriesWithGroupsNodes = async (groupName) => {
    const user = await connection.query(
      `select ID from wp_users where display_name = '${groupName}'`
    );
    if (!user.length) {
      return console.error(`User not found with name ${groupName}`);
    }
    const { ID } = user[0];
    const nodes = await connection.query(
      `select ID from wp_4_posts where post_author = ${ID} and post_type = 'tapestry_node'`
    );
    const nodeTapestries = await Promise.all(
      nodes.map(async ({ ID: post_id }) => {
        const node = await getNodeIdFromPostId(post_id);
        const tapestry = await find(post_id);
        return { node, tapestry };
      })
    );

    const tapestries = {};
    for (const { node, tapestry } of nodeTapestries) {
      if (tapestry) {
        if (tapestries[tapestry.id]) {
          tapestries[tapestry.id].nodes.push(node);
        } else {
          tapestries[tapestry.id] = {
            tapestry,
            nodes: [node],
          };
        }
      }
    }
    return tapestries;
  };

  const OUT_DIR = "out";

  const groupNames = process.argv.slice(2);
  Promise.all(
    groupNames.map((name) => {
      return findTapestriesWithGroupsNodes(name).then((tapestries) => {
        const path = `${OUT_DIR}/${name}`;
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path);
        }
        Object.values(tapestries).forEach(({ tapestry, nodes }) => {
          fs.writeFileSync(
            `${path}/${tapestry.id}.json`,
            JSON.stringify({ tapestry, nodes }, null, 2)
          );
        });
      });
    })
  ).finally(() => connection.end());
};

run();
