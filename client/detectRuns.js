detectRuns = function detectRuns(points) {
	var runs = [];
	var lifts = [];
	var direction = points[0].altitude < points[1].altitude ? 'UP' : 'DOWN';
	var currentTrack = [points[0]];
	var previousPoint = points[0];
	for (var i = 1; i < points.length; i++ ) {
		if (direction === 'UP') {
			if (points[i].altitude >= previousPoint.altitude) {
				// We think we should be going up, and we are. Simply append the point to the currentTrack and keep going.
				currentTrack.push(points[i]);
			} else {
				// Well crap, we're going down. Time to switch directions, save currentTrack into the lifts, and reset it.
				lifts.push(currentTrack);
				currentTrack = [points[i]];
				direction = 'DOWN';
			}
		} else { // direction === 'DOWN'
			if (points[i].altitude <= previousPoint.altitude) {
				// We think we should be going down, and we are. Simply append the point to the currentTrack and keep going.
				currentTrack.push(points[i]);
			} else {
				// Well crap, we're going up. Time to switch directions, save currentTrack into the runs, and reset it.
				runs.push(currentTrack);
				currentTrack = [points[i]];
				direction = 'UP';
			}
		}

		// Finally, we set previousPoint to our current point for the next iteration
		previousPoint = points[i];
	}	

	return {
		runs: runs,
		lifts: lifts
	};
};