const fs = require("fs");

const getNeighbours = (tapestry, id) => {
  return tapestry.links
    .filter((link) => link.source == id || link.target == id)
    .map((neighbour) =>
      neighbour.source === id ? neighbour.target : neighbour.source
    );
};

const getNode = (tapestry) => (id) => {
  return tapestry.nodes.find((node) => node === id);
};

const get = (tapestry, nodeId, { neighbours }) => {
  if (neighbours) {
    return getNeighbours(tapestry, nodeId);
  }
  return getNode(tapestry)(nodeId);
};

module.exports = {
  get,
};
