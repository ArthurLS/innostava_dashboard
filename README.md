# Innostava Dashboard
Daily tracking data visualisation

---
### How to process the raw data into structured daily summaries
Read *data_format_examples.js* to see what the result looks like and additional info on the files.
Make sure to have node install and run **npm install** in the **root folder**.

1) Your raw data must be an array of JSON objects with at least as property:

 - The UUID of the device that recorded the data point.
 - The mac address of the nearest beacon.
 - The timestamp of the data point.
 - The distance to the nearest beacon.
 
2) Configure the device_ids.json in the root folder:
	
- Create as much as objects as there is users.
- "user_id" will be the new number for this user.
- "uuid" is the 4 first characters of the device UUID of that user.

3) Change the *1_raw_to_standard.js* variables according to your environment and data set. With addFields(obj) you can add properties to the final result.
   Run it.

4) Change the *2_create_summary.js* variables according to your environment and data set.
   Run it.

5) Change the *3_day_splitter.js* variables according to your environment and data set.
   Run it.

---
### Prepare the dashboard
Since every data set is specific, even if the data is formated the same, some of the code won't work with another data set.<br>
You will need first of all to check the constants.js file in the js folder (dashboard/public/javascript/constants.js). constants.js is, for most of it, objects with (x,y) positions. *beacon_pos* and *seats* gives maps the positions of the user seats and where were the beacons placed on the map: crucial to the good functioning of the dashboard. Make sure to change accordingly to the pre Pilot map and Pilot map.

You will have to go through some core functions like processInterval() which makes the link between the daily summaries and the drawing functions.

---
### How to start up the dashboard

Prerequisite: node.js installed
Make sure you have ran the scripts (1/2/3) to have you daily summaries in the *db_sum..* folders.
In the folder of your choice:<br/>
```bash
$ cd dashboard
$ npm install
$ npm start
```
Now that the server is running, connect to localhost:PORT. (default is 8080)

---
### Copyrights
Made by Arthur Le Saint under the Innostava research project. European Funding.