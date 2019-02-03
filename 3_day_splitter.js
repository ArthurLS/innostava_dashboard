/* day splitter */
const fs = require('fs');

// intervals that you want
var inters = ["30sec","05min", "day"];

var prePilotStart = 1484200800000; // Thursday 12 January 2017 08:00:00
var pilotEnd = 1490968800000; // Friday 31 March 2017 17:00:00

var res = [];
for (var i = 0; i < inters.length; i++) {

	// fetch the files created by step 2
	var read = fs.readFileSync('all_inters_1file/sum_'+inters[i]+'.json');

	var file = JSON.parse(read);
	var curDay = "01-12";

	console.log("Interval: " +inters[i]);

	for(var inter in file){
		var d = new Date(Number(inter));
		var date = addZero(d.getMonth()+1)+"-"+addZero(d.getDate());

		var obj = {};
		obj[inter] = file[inter];
		obj[inter]["interval"] = inter;

		// If the object is in the current interval
		if (date == curDay){
			res.push(obj);
		}
		// If the object is the next day
		else{
			res.sort(function (a, b) {
				return Number(Object.keys(a)[0]) - Number(Object.keys(b)[0]);
			});

			fs.writeFileSync("db_sum"+inters[i]+"/"+curDay+".json", JSON.stringify(res));
			// Start the new interval
			curDay = date;
			res = new Array();
			res.push(obj);
		}
	}

	// for the final day 
	res.sort(function (a, b) {
		return Number(Object.keys(a)[0]) - Number(Object.keys(b)[0]);
	});
	fs.writeFileSync("db_sum"+inters[i]+"/"+curDay+".json", JSON.stringify(res));
	console.log("Interval: " +inters[i]+" is done");

	// reset and restart
	res = new Array();
	console.log("");
}

function addZero(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}