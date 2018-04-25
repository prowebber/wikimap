import "./src/css/style.css";
import v from './lib/globals.js';
import wikimap from './lib/custom.js';
import theGraph from "./lib/three-forcegraph.js";
v.Graph = theGraph;
wikimap();