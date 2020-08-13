const fs = require("fs");

const TITLE = "out/tapestries/101-week9";

const baseTapestry = JSON.parse(fs.readFileSync(`${TITLE}.json`));

const weeks = baseTapestry.nodes
  .filter((node) => {
    const titles = new Set([
      "Week 8: Visual System",
      "Week 9: Other Sensory Systems, Attention, & Perception",
      "Week 10: States of Consciousness",
    ]);
    return titles.has(node.title);
  })
  .map((node) => node.id);

const getNeighbours = (id) => {
  return baseTapestry.links.filter((link) => link.source == id || link.target == id);
};

const getNode = (id) => baseTapestry.nodes.find((node) => node.id === id);

const split = (start, blacklist) => {
  const tapestry = {
    nodes: [],
    links: [],
    settings: {
      tapestrySlug: "psyc101-98a-2020s",
      title: "PSYC 101-98A 2020S",
      status: "publish",
      backgroundUrl: "",
      autoLayout: false,
      nodeDraggable: true,
      defaultPermissions: {
        public: [],
        authenticated: [],
        editor: [],
        contributor: [],
        subscriber: [],
      },
      showAccess: false,
      superuserOverridePermissions: false,
      defaultDepth: 3,
    },
    rootId: start,
  };

  const queue = [];
  const visited = new Set();
  queue.push(start);

  while (queue.length > 0) {
    const node = queue.shift();
    visited.add(node);
    tapestry.nodes.push(getNode(node));

    const neighbours = getNeighbours(node);
    for (const neighbour of neighbours) {
      const id = neighbour.source === node ? neighbour.target : neighbour.source;
      if (!blacklist.includes(id) && !visited.has(id)) {
        tapestry.links.push(neighbour);
        queue.push(id);
      }
    }
  }

  return tapestry;
};

weeks.slice(1).forEach((week, index) => {
  const tp = split(week, weeks);
  fs.writeFile(`${TITLE}-week${index}.json`, JSON.stringify(tp, null, 2), () =>
    console.log("wrote file!")
  );
});
