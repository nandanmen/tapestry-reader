# Tapestry Reader

This repo contains a collection of scripts to read and analyze Tapestries from the Tapestry database.

All of the scripts are defined under `/scripts` and can be ran using `node <script-name>.js`. There are 7 scripts in total, but `finder`, `reader`, and `search` are probably going to be the ones you'll want to use (the others are either unpolished or require extensive modifications to be usable).

## Finder

Given group name(s), this script will return all Tapestries that the group has contributed to. The result will be in the form of a folder under the `out` directory.

The name of the folder is the group name. Inside that folder are a series of JSON files corresponding to each Tapestry the group has contributed to. The name of the JSON file is the Tapestry's post ID.

Each JSON file is an object with 2 keys: `tapestry` and `nodes`.

- `tapestry` is the Tapestry object itself
- `nodes` is an array of nodes created by that group that exists in that Tapestry

For this to work correctly, ensure the `mysql` database is running and the credentials are correct (the credentials are defined at the top of `finder.js`).

**Example usage**

```
node finder.js pinkfreud aoa2020
```

**Example output**

Two folders under the `out` directory: `aoa2020` and `pinkfreud`. Under `pinkfreud`, a JSON file called `3293.json` that looks like:

```
{
  "tapestry": {
    "nodes": [
      5757,
      5761,
      5763,
      5765,
      5767,
      5769,
      5771,
      5773,
      5775,
      5777,
      5779,
      5781,
      5783,
      5785,
      5787,
      5789,
      ...
```

## Reader

Given a Tapestry post ID, this script will attempt to reconstruct the Tapestry into a JSON file based solely off the data in the database (i.e. not through the custom endpoints).

The script attempts to read the database by piping the data through a JS implementation of PHP's `unserialize` function. Parsing does fail sometimes, and when it does it will log the errors through the console.

Nevertheless, the script will continue and will return a partial Tapestry that is guaranteed to be correct. After correcting itself, the script will print the number of nodes the data has vs. the number of nodes that were able to be parsed. All links that connect to nodes that failed to parse will be filtered out. The link count before and after the correction will be printed as well.

The resulting Tapestry will be saved in `out/tapestries` with the default file name of `tapestry.json`. The file name can be changed by adding an extra parameter.

**Example usage**

```
node reader.js 3293 week10
```

For this to work correctly, ensure the `mysql` database is running and the credentials are correct (the credentials are defined at the top of `reader.js`).

**Example output**

```
SyntaxError: Unknown / Unhandled data type(s): : in s:5:"image
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:237:15)
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:223:22)
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:227:22)
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:227:22)
    at unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:252:19)
    at /Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/reader.js:41:14
    at async Promise.all (index 101)
    at async run (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/reader.js:26:17)
SyntaxError: Unknown / Unhandled data type(s): : in s:5:"image
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:237:15)
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:223:22)
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:227:22)
    at _unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:227:22)
    at unserialize (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/unserialize.js:252:19)
    at /Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/reader.js:41:14
    at async Promise.all (index 135)
    at async run (/Users/narendrasyahrasyad/Documents/Dev/tapestry-reader/scripts/reader.js:26:17)
Node length before: 237
Node length after: 235
Link length before: 250
Link length after: 246
```

In this case, 2 nodes failed to parse and 4 links connected to these nodes were filtered out.

## Search

Given a predicate, this script searches all nodes in the database and logs all those nodes that satisfy the predicate.

This predicate is defined at the bottom of the `search.js` file. The predicate function takes in a TapestryNode object and returns a boolean.

Again for this to work correctly, ensure the `mysql` database is running and the credentials are correct (defined at the top of `search.js`).
