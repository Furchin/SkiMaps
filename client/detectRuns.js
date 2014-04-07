detectRuns = function detectRuns(points) {
	var tracks = [];
	var currentTrack = {
		points: [points[0]],
		type: points[0].altitude < points[1].altitude ? 'LIFT' : 'RUN'
	};
	var previousPoint = points[0];
	for (var i = 1; i < points.length; i++ ) {
		if (currentTrack.type === 'LIFT') {
			if (points[i].altitude >= previousPoint.altitude) {
				// We think we should be going up, and we are. Simply append the point to the currentTrack and keep going.
				currentTrack.points.push(points[i]);
			} else {
				// Well crap, we're going down. Time to switch directions, save currentTrack into the lifts, and reset it.
				tracks.push(currentTrack);
				currentTrack = {
					type: 'RUN',
					points: [points[i]]
				};
			}
		} else { // direction === 'DOWN'
			if (points[i].altitude <= previousPoint.altitude) {
				// We think we should be going down, and we are. Simply append the point to the currentTrack and keep going.
				currentTrack.points.push(points[i]);
			} else {
				// Well crap, we're going up. Time to switch directions, save currentTrack into the runs, and reset it.
				tracks.push(currentTrack);
				currentTrack = {
					points: [points[i]],
					type: 'LIFT'
				};
			}
		}

		// Finally, we set previousPoint to our current point for the next iteration
		previousPoint = points[i];
	}	

	return tracks;
};