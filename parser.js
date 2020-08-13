const fs = require("fs");
const unserialize = require("./unserialize");

const parse = (path) => {
  const nodes = JSON.parse(fs.readFileSync(path));
  fs.writeFileSync(
    "out/tapestries/fixed.json",
    JSON.stringify(nodes.map(unserialize).map(([_, node]) => node))
  );
};

parse(process.argv.slice(2)[0]);
