const Dao = require('./Dao.js');

const METERS_PER_MILE = 1609;

module.exports = class PoolTierDao extends Dao {
	constructor() {
		super('pools');
	}

	findNearest(lat, long, maxDistance) {
		maxDistance = maxDistance || METERS_PER_MILE;

		return this.filter({ location: { $nearSphere: { $geometry: { type: "Point", coordinates: [ +long, +lat ] }, $maxDistance: METERS_PER_MILE } } });
	}
}