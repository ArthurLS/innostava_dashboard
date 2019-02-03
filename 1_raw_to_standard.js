/* 1_raw_to_standard */
const fs = require('fs')
var process_start = new Date().getTime();

/* 
* Path to your files 
* Change the device_ids file according to the number of users
*/
var rawData_path = 'raw_data.json';
var device_ids_path = 'device_ids.json';

/*
* Change the fields according to your raw data column names
* in order: 
	- UUID of the device (later transformed with device_ids.json),
	- timestamp, 
	- beacon mac address
	- distance to that beacon
*
*/
var uuid = "uuid1";
var timestamp = "timestamp";
var mac_address = "mac_address";
var distance = "double_distance";

/*
* Epoch Dates for your data set
*/
var prePilotStart = 1484200800000; // Thursday 12 January 2017 08:00:00
var pilotEnd = 1490968800000; // Friday 31 March 2017 17:00:00
var epokDay = 86400000; // day in ms

var epokWorkDay = 32400000; // 9h in ms (from 8:00 to 17:00)
var epokWorkNight = 54000000; // 15h in ms (from 17:00 to 8:00)

var epok30s = 30000; // 30sec in ms, interval you want to work with

// Offline time is the maximum time a phone can be deconnected without putting the user out of the map
var offlineTime = 120000; //120s = 2min

/*
* Processing starts
*/

// fetch the raw data
var data = JSON.parse(fs.readFileSync(rawData_path));

// fetch the files with the users description
var ids = JSON.parse(fs.readFileSync(device_ids_path));
var nbUsers = ids.length;

var list_user = [];
var list_devices_ids = [];

// for every user, we push his device id in the array list_devices_ids
for (var i = 0; i < ids.length; i++) {
	for(var prop in ids[i]){
		if(prop === uuid || prop === "uuid2"){
			list_devices_ids.push(ids[i][prop]);
		}

		if(prop === "user_id") list_user[i] = ids[i][prop];
	}
}

// cur is the current 30sec interval we are working on
var cur = prePilotStart;
// create the end file named "res"
var res = {};

var dayEnd = 0;
var startDay = true;

// Creates the empty shell for the results
// Allows to fill in blanks for missing signals
while(cur <= pilotEnd){

	var obj_template = {};

	for (var i = 0; i < nbUsers; i++) {
		obj_template[list_user[i]] = new Object();
		obj_template[list_user[i]]["user"] = list_user[i];
		obj_template[list_user[i]]["timestamp"] = cur.toString();
		obj_template[list_user[i]]["beacon"] = null;
		obj_template[list_user[i]]["dist"] = -1;
	}

	res[cur.toString()] = obj_template;
	
	// If we start a day
	// set when is the end of that day
	if (startDay) {
		dayEnd = cur + epokWorkDay;
	}
	// if end of the day, go to 8:00 the next day
	if (dayEnd <= cur) {
		cur += epokWorkNight;
		startDay = true;
	}
	else{
		cur += epok30s;
		startDay = false;
	}
}

var process_end = new Date().getTime();
var duration = (process_end - process_start) / 1000;
console.log("Wrote the shell in: "+duration+"seconds");
process_start = new Date().getTime();
var c = 0
// Simply puts every data point in the right box
// Adds more info if you need
for (var i = 0; i < data.length; i++) {
	var time = Number(data[i].timestamp);
	var interval = 0;

	// if == 0, keep as interval
	// else if >=, means that time is closer to next interval
	// else means previous interval
	if ((time % epok30s) == 0) 
		interval = time;
	
	else if ((time % epok30s) >= 15000) 
		interval = time - (time % epok30s) + epok30s;
	
	else
		interval = time - (time % epok30s);
	

	// If the interval calculated is in the shell (99.99% it is)
	if (res.hasOwnProperty(interval)) {

		var deviceID = data[i]["device_id"].substring(0, 4);	
		// Checks if the device is valid
		if(list_devices_ids.indexOf(deviceID) !== -1){
			// Finds which uuid matches which user_id
			var user_id = "";
			for(var user in ids){
				if(ids[user][uuid] === deviceID || ids[user]["uuid2"] === deviceID){
					user_id = ids[user].user_id;
				}
			}
			var obj = {
				"user": user_id,
				"timestamp": time,
				"beacon": data[i].mac_address.substring(0, 5),
				"dist": data[i][distance]
			};

	        // Use addFiedls(obj) if you want more information in your object
	        res[interval][user_id] = addFields(obj);
	    }
	}
}

process_end = new Date().getTime();
duration = (process_end - process_start) / 1000;
console.log("Base data in: "+duration+"seconds");
process_start = new Date().getTime();

var prevInter = 0;
var leaveOffice = {};

// Fill in the blanks if a phone is silent for 1 or 2 min.
// Allow a more consistent and smooth visualisation and analysis
for (var inter in res) {

	// THIS IS OPTIONAL: Used to add the coworkers field
	/*	
	// First, fills in the room where everybody is
	var groups = {"top": [], "bot": [], "meeting": [], "coffee": []};
	for(var user in res[inter]){
		if (res[inter][user]["beacon"] != null) {
			groups[res[inter][user].room].push(Number(user));
		}
	}
	// Second, put the result in the file, without the user himself noted as his own coworker
	for(var user in res[inter]){
		if (res[inter][user]["beacon"] != null) {
			var withoutUser = [];
			for (var i = 0; i < groups[res[inter][user]["room"]].length; i++) {
				if (groups[res[inter][user]["room"]][i] != user) {
					withoutUser.push(groups[res[inter][user]["room"]][i]);
				}
			}
			res[inter][user]["coworkers"] = withoutUser;
		}
	}*/
	// END OF OPTIONAL


	// if the previous interval is not 30sec before, it means we changed the day.
	// we then reset the object that counts the number of absences.
	if (prevInter+30000 != Number(inter)) {
		leaveOffice = new Object();
		for (var i = 0; i < list_user.length; i++) {
			leaveOffice[list_user[i]] = 0;
		}	
	}

	for(var user in res[inter]){
		// If the user hasn't a defined point
		// 1) we look 2min30s ahead for a point (if he doesn't sends a signal every 30 sec)
		// 2) He may have left the office.
		// We give him 2 min with a fake point (last position) before the algorithm waits for a new real point
		if (res[inter][user].beacon === null) {
			var cursor = Number(inter) + epok30s;
			// look every 30 sec for 2 min ahead if there is a point
			while(Number(inter) + offlineTime >= cursor){
				// if the next interval exists and the user has a datapoint
				if (res.hasOwnProperty(cursor.toString()) && res[cursor.toString()][user].beacon !== null) {
					// replace the empty point with the one found less than 4 min ahead 
					res[inter][user] = res[cursor.toString()][user];
					// get out of the while
					break;
				}
				else{
					cursor += epok30s;
				}
			}
			// if we didn't find a point 2 min ahead 
			// Let's look back at the last position.
			// If we do that more than 4 times (so for 2min), we leave the position undecided
			if(res[inter][user].beacon === null){
				if(leaveOffice[user] < 4){
					var lastPoint = Number(inter) - epok30s;
					// if the previous interval exists and the user has a datapoint
					if (res.hasOwnProperty(lastPoint.toString()) && res[lastPoint.toString()][user].beacon !== null) {
						// replace the empty point with the previous one
						res[inter][user] = res[lastPoint.toString()][user];
					}
					// add a fake point score if previous exists or not
					leaveOffice[user] +=1;
				}
			}
		}
		// if the user has a defined point, we rest his leaveOffice score
		else{
			leaveOffice[user] = 0;
		}
	}
}

process_end = new Date().getTime();
duration = (process_end - process_start) / 1000;
console.log("Filled in blank data in: "+duration+"seconds");
process_start = new Date().getTime();

// Write the File
var str = JSON.stringify(res);
fs.writeFileSync("all_inters_1file/1_standard_data.json", str);

process_end = new Date().getTime();
duration = (process_end - process_start) / 1000;
console.log("Wrote in: "+duration+"seconds");


function addFields(obj) {

	var newObj = new Object();
	newObj = obj;
	// THIS IS OPTIONAL: Used to add the room field
	/*
	var isOld = newObj["timestamp"] < 1486930000000; // time < 12 feb 2017 22:00:00
	var beacon = newObj["beacon"];

	if(beacon === "E5:E8" && (newObj["dist"] > 1.1) && !isOld){
		beacon = "C4:69";
	}

	var room = "";

	if (newObj["dist"] > 3.85) {
		room = "coffee";
	}
	else if(isOld) {
        // CDF top room
        if (beacon == ("E5:E8") || beacon == ("C7:42") || beacon == ("F6:B0")) {
        	room = "top";                    
        }
        // E meet room
        else if (beacon == ("C4:69")) {
        	room = "meeting";
        }
        // AB bot room
        else {
        	room = "bot";
        }
    }
    else{
        // BCD top room
        if (beacon == ("C0:6D") || beacon == ("F6:B0") || beacon == ("C7:42")) {
        	room = "top";
        }
        // EF meet room
        else if (beacon == ("E5:E8") || beacon == ("C4:69")) {
        	room = "meeting";
        }
        // A bot room
        else {
        	room = "bot";
        }
    }

    newObj["room"] = room;
	*/
	// END OF OPTIONAL
    return newObj;
}