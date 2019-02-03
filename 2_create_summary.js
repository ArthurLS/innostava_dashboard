/* create_summary.js */
const fs = require('fs');
// fetch the day.json
var read = fs.readFileSync('all_inters_1file/1_standard_data.json');
var data = JSON.parse(read);

// fetch the files with the users description
var ids = JSON.parse(fs.readFileSync('device_ids.json'));
var nbUsers = ids.length;

var prePilotStart = 1484200800000; // Thursday 12 January 2017 08:00:00
var pilotEnd = 1490968800000; // Friday 31 March 2017 17:00:00
var epok30s = 30000; // 30sec in ms
var epokDay = 86400000; // day in ms

// If the day start/end is more complicated, please check the code around line 110
var startDay = 8 // the day starts at 8:00
var endDay = 17 // the day ends at 17:00

// For 30 sec
var sum = create_summary(data, epok30s);
fs.writeFileSync("all_inters_1file/sum_30sec.json", JSON.stringify(sum));
console.log("30sec interval summary is done");
console.log("");

// For 5 min
var sum = create_summary(data, 300000);
fs.writeFileSync("all_inters_1file/sum_05min.json", JSON.stringify(sum));
console.log("5min interval summary is done");
console.log("");

// For 1 Day
var sum = create_summary(data, epokDay);
fs.writeFileSync("all_inters_1file/sum_day.json", JSON.stringify(sum));
console.log("Daily interval summary is done");
console.log("");

/*
* create_summary
*
* db: object with all the days with points within a 30 sec interval
* interLength: in ms => 30 000 for 30 sec - 604 800 000 for a week
*
* return: object of interval objects
*/
function create_summary(db, interLength) {

	var nbInter = Math.floor((pilotEnd - prePilotStart)/interLength);
	console.log("Number of interval to process = "+nbInter);

	var curInter = prePilotStart;
	var nextInter = prePilotStart + interLength;

	var res = {};

	// We create the first interval at the start
	res[curInter] = create_inter();
	
	// for each interval in day, key is the interval object index
	for(var key in db){
		var obj30 = db[key];
		// if the key is in the current interval (curInter <= key < nextInter)
		if ((Number(key) >= curInter) && (Number(key) < nextInter)){
			// for each user
			for(var user in obj30){
				// User Object
				var uObj = obj30[user];
				// If the user object hasn't been initialized (eg: first iteration of loop)
				if (Object.getOwnPropertyNames(res[curInter][user]).length == 0) {
					// if the current point is a fake, initialize
					if (uObj.beacon == null || uObj.dist == -1) 
						res[curInter][user] = create_user(user, 0, -1, false);
					// else fill in normally
					else	
						res[curInter][user] = create_user(user, uObj.beacon, uObj.dist);
					res[curInter]["interval"] = curInter;
				}
				else{
					res[curInter][user]["nbSignals"]++;
					// if the beacon is fake
					if (uObj.beacon == null) {
						res[curInter][user]["absent"]++;
					}
					// if the beacon exist
					else if (res[curInter][user].hasOwnProperty(uObj.beacon)) {
						var mac = uObj.beacon;
						// make the average between the prev signals and the new one
						var prevAvg = Number(res[curInter][user][mac].dist);
						var prevTimes = Number(res[curInter][user][mac].times_here);
						res[curInter][user][mac].dist = (prevAvg*prevTimes+Number(uObj.dist))/(prevTimes+1);
						res[curInter][user][mac].times_here ++;
					}
					// if the beacon doesn't exist
					else{
						var mac = {"dist": Number(uObj.dist), "times_here": 1};
						res[curInter][user][uObj.beacon] = mac;
					}
				}
			}
		}
		else{
			// We find a new suitable interval (7:00 AM is not accepted)
			// can be improved (less brutal)
			curInter += interLength;
			nextInter += interLength;

			var date = new Date(Number(curInter));
			var hour = Number(date.getHours());
			var min = Number(date.getMinutes());
			if (((hour >= endDay && min != 0) || hour < startDay) && interLength != epokDay) {
				while((hour >= endDay && min != 0) || hour < startDay){
					curInter += interLength;
					nextInter += interLength;
					date = new Date(Number(curInter));
					hour = date.getHours();
				}
			}

			// initalize a new interval
			// fills it with the data from the first 30 sec interval
			res[curInter] = create_inter();
			for(var user in obj30){
				// if the current point is a fake, initialize
				if (obj30[user].beacon == null || obj30[user].dist == -1) 
					res[curInter][user] = create_user(user, 0, -1, false);
				// else fill in normally
				else
					res[curInter][user] = create_user(user, obj30[user].beacon, obj30[user].dist, true);
				res[curInter]["interval"] = curInter;
			}
		}
	}// end of the interval
	return res;
}// end of the function


function create_inter() {
	var obj = {};
	for (var i = 0; i < nbUsers; i++) {
		obj[ids[i]["user_id"]] = {};
	}
	return obj;
}

function create_user(user, mac, dist, data) {
	var obj = {};
	if (data) {
		obj = {
			"user": user,
			"nbSignals": 1, 
			"absent": 0	
		};
		var beac = {"dist": Number(dist), "times_here": 1};
		obj[mac] = beac;
	}
	else{
		obj = {
			"user": user,
			"nbSignals": 1, 
			"absent": 1	
		};
	}

	return obj;
}
