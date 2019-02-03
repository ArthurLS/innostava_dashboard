// Raw data from the server
[
	{
		"own_id": "12450",
		"device_id": "fd7fb493-7a05-4696-8940-c636e6c7e2da",
		"name": "Ion",
		"mac_address": "C0:6D:08:F3:B1:02",
		"timestamp": "1487570423040",
		"date": "2017-20-02 08:00:23",
		"double_distance": "0.38648929138798",
		"near": "1"
	}, //next data point...
]
/*
	After 1_raw_to_standard with optional "room" and "coworkers".
	1 file with all the data divided in 30 sec intervals
	One object point per user per interval.
*/
{
	"1487570400000":{
		"1": {
			"user": "1",
			"timestamp": 1487570413139,
			"beacon": "C0:6D",
			"dist": "0.38648929138798",
			"room": "top",
			"coworkers": [5]
		},
		"2": {
			"user": "2",
			"timestamp": 1487570412871,
			"beacon": "D3:8C",
			"dist": "1.0467871501593",
			"room": "bot",
			"coworkers": []
		},
		"3": {
			"user": "3",
			"timestamp": "1487570400000",
			"beacon": null,
			"dist": -1
		}, //next users
	}, // next interval
}
/*
	After 2_create_summary.js
	Creates 3 file summaries of fixed intervals: 30sec, 5min and day.
*/
{
	"1487570400000": { 
		"1": {
			"user": "1",
			"nbSignals": 1,
			"absent": 0,
			"C0:6D": {
				"letter": "B",
				"dist": 0.38648929138798,
				"times_here": 1
			},
			//other beacons... (if 5min or day)
		}, 
		//other users...
	}, 
	//next intervals...
}

/*
	Then 3_day_splitter divide these 1 big interval summaries file into daily files (folder db_sum30sec, db_sum05min, db_sumday)
	This step is for the dashboard and server time optimization
	The daily files are arrays. Meaning a file in "db_sumday" is an array with a length of 1
*/