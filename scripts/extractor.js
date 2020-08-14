const fs = require("fs");

const extract = (baseTapestry, nodeList) => {
  const tapestry = {
    nodes: nodeList.map((id) => baseTapestry.nodes.find((node) => node.id == id)),
    links: baseTapestry.links.filter(
      (link) => nodeList.includes(link.source) && nodeList.includes(link.target)
    ),
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
    rootId: nodeList[0],
  };
  return tapestry;
};

const baseTapestry = JSON.parse(fs.readFileSync(`tapestry.json`));
const weeks = extract(
  baseTapestry,
  baseTapestry.nodes
    .filter((node) => node.title.startsWith("Week") && node.author.name === "steven")
    .map((node) => node.id)
);
fs.writeFileSync("weeks-only.json", JSON.stringify(weeks, null, 2));
