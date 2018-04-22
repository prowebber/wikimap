import { Group as ThreeGroup } from 'three';
import ThreeForceGraph from './forcegraph-kapsule.js';
import fromKapsule from './kapsule-class.js';

export default fromKapsule(ThreeForceGraph, ThreeGroup, true);
