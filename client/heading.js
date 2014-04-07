// From http://www.movable-type.co.uk/scripts/latlong.html
computeHeading = function computeHeading(p1, p2) {
	var dLon = p2.lng - p1.lng;
	var y = Math.sin(dLon) * Math.cos(p2.lat);
	var x = Math.cos(p1.lat)*Math.sin(p2.lat) -
	        Math.sin(p1.lat)*Math.cos(p2.lat)*Math.cos(dLon);
	return Math.atan2(y, x);
}