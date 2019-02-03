/* index.js */

// global variable which tells if we are in the pre-Pilot or the Pilot
// initialised for the pre-Pilot. The value is changed by checkDate.
var isOld = true;

/*
* init is call onload. It sets up the page and the localStorage
*/
function init() {
    $("#container-1").show();
    $("#container-2").hide();

    // Info
    if (!localStorage.info) {
        localStorage.info = true;
    }
    else{
        if (localStorage.info == "false"){
            document.getElementById("show-info").innerHTML = "Show Info";
            $("#info-display").hide();
        }
    }
    // ESM
    if (!localStorage.esm) {
        localStorage.esm = true;
    }
    else{
        if (localStorage.esm == "false"){
            document.getElementById("show-esm").innerHTML = "Show ESM";
            $("#esm-display").hide();
        }
    }            
    // Users
    if (!localStorage.users) {
        localStorage.users = true;
    }
    // Language
    if (!localStorage.language) {
        localStorage.language = "finnish";
    }
    // Color Input
    if (!localStorage.userColors){
        localStorage.userColors = JSON.stringify(listColors);
    }
    // Beacons
    if (!localStorage.beacons) {
        localStorage.beacons = true;
    }
    else {
        if (localStorage.beacons == "false") document.getElementById("show-beacons").innerHTML = "Show Beacons";
        else $("#show-beacons").addClass("active");
    }
    // Seats
    if (!localStorage.seats) {
        localStorage.seats = true;
    }
    else {
        if (localStorage.seats == "false") document.getElementById("show-seats").innerHTML = "Show Seats";
        else $("#show-seats").addClass("active");
    }
    // Speed
    if (!localStorage.speed) {
        localStorage.speed = 125;
    }
    else if(localStorage.speed > 200) localStorage.speed = 125;
    // Interval Length
    if (!localStorage.intervalLength) {
        localStorage.intervalLength = '30sec';
    }
    // Selected Users
    if (!localStorage.selectedUsers) {
        var array = []
        for(var u in old_seats){
            array.push(u);
        }
        localStorage.selectedUsers = JSON.stringify(array);
    }
    // Date
    if (!localStorage.date) {
        localStorage.date = document.getElementById("date").value.substring(5, 10);
    }
    else{
        document.getElementById("date").value = '2017-'+localStorage.date;
    }

    $("#"+localStorage.speed).addClass("active");
    $("#"+localStorage.intervalLength).addClass("active");

    initUsers();

    updateColorUsers();

    fetchESM();

    submitDate();

    if (localStorage.language == "finnish") document.getElementById('language').checked = false;
    else document.getElementById('language').checked = true;
};

/*
* submitDate is the main function, onclick listener on the Submit button
* 
* Checks if the date is valid
* Set up the layout accordingly
* Fetches the file from the db and stores it in daySum[]
* Draws up the first interval of the day
*/
var daySum = [];
var esm = [];
var esm_day = [];

function submitDate() {
    checkDate();
    
    resetMap();

    isPlaying = false;
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/json/"+localStorage.date+"/"+localStorage.intervalLength);
    xhr.addEventListener('readystatechange', function() { 
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) { 
            if(xhr.responseText === "Date asked not available"){
                alert("A problem has occured, the date is not available (no data for this day)");
            }
            else{
                document.getElementById("play").innerHTML = "Play";
                // daySum[] is where the current day is stored. Every 30s/5min interval object in the array is sorted by timestamp.
                // The range below the map is divided in a way that 
                // moving the range up from 1 corresponds to the next 30s/5min interval in daySum[]
                daySum = JSON.parse(xhr.responseText);
                document.getElementById('range').max = daySum.length-1;
                document.getElementById('range').value = 0;

                var jour = localStorage.date;

                esm_day = [];

                for (var i = 0; i < esm.length; i++) {
                    if(esm[i] != null && esm[i].date.substring(5, 10) == jour){
                        esm_day.push(esm[i]);
                    }
                }
                esm_day.reverse();
                writeESM();
                setTimeout(function(){
                    drawRange();
                }, 100);
            }
        }
    });
    xhr.send();
};


/*
* processInterval() returns the current interval selected processed 
* This function process all the information needed to place the points on the map
* that leaves the drawing functions without too much processing to do
*
* position: position in the day on the range input
* return: example obj format in constants.js
*/
function processInterval(position) {
    var resInterval = [];
    var interval = daySum[position][Object.keys(daySum[position])[0]];
    var selectedUsers = JSON.parse(localStorage.selectedUsers);

    // Only process the selected users
    for (var i = 0; i < selectedUsers.length; i++) {
        var user_id = selectedUsers[i];
        var user_info = interval[user_id];

        var sum_most_visited = {};
        // Creates an object with the most visited beacon for each user
        // used to circle the most visited in "Pause" mode
        for (var prop in user_info) {
            // Only work on beacons
            if (old_beacons_pos.hasOwnProperty(prop)) {
                // needed or we couldn't test the "if" that follow
                if(sum_most_visited.hasOwnProperty(user_id)){
                    if (Number(user_info[prop].times_here) > Number(sum_most_visited[user_id].max_times)) 
                        if(isOld)
                            sum_most_visited[user_id] = {"beacon": prop, "max_times": user_info[prop].times_here};
                        else
                            sum_most_visited[user_id] = {"beacon": prop, "max_times": user_info[prop].times_here};                
                    } 
                    else{                         
                        if(isOld)
                            sum_most_visited[user_id] = {"beacon": prop, "max_times": user_info[prop].times_here};
                        else
                            sum_most_visited[user_id] = {"beacon": prop, "max_times": user_info[prop].times_here};
                    }
                }
            }

        // Maps the useful landmarks: coord(x, y) of the beacon and the room
        for (var prop in user_info) {
            if (old_beacons_pos.hasOwnProperty(prop)) {
                // Distance to the beacon recorded
                var dist = user_info[prop].dist;
                // Number of times the user has been here in this interval
                // "times" only makes sense for 5min and Full Day intervals
                var times = user_info[prop].times_here;
                // alpha is the transparency of the point
                var alpha = times/user_info.nbSignals;
                if (alpha < 0.1) alpha = 0.1;

                // Set the coordonates of the beacon recorded
                var beaconX, beaconY;
                if(isOld){
                    beaconX = Number(old_beacons_pos[prop].x);
                    beaconY = Number(old_beacons_pos[prop].y);;
                }
                else{
                    beaconX = Number(new_beacons_pos[prop].x);
                    beaconY = Number(new_beacons_pos[prop].y);
                }

                // Set the room the user is in
                // Sets the exact position of the user for the animation (1 position fixed for every room)
                // Every fixed position are declared in constants.js: coffePos[], old_seats[], old_roomName_pos[] ...
                var room = "";
                var anim_pos = {};
                if (dist > 3.85) {
                    anim_pos = coffePos[user_id];
                    room = "coffee";
                }
                // Pre Pilot
                else if(isOld) {
                    // CDF top room
                    if (prop == ("E5:E8") || prop == ("C7:42") || prop == ("F6:B0")) {
                        if (old_topRoom_pos.hasOwnProperty(user_id)) anim_pos = old_topRoom_pos[user_id];
                        else anim_pos = old_seats[user_id];    
                        room = "top";                    
                    }
                    // E meet room
                    else if (prop == ("C4:69")) {
                        if (old_meetRoom_pos.hasOwnProperty(user_id)) anim_pos = old_meetRoom_pos[user_id];
                        else anim_pos = old_seats[user_id]; 
                        room = "meet";
                    }
                    // AB bot room
                    else {
                        if (old_botRoom_pos.hasOwnProperty(user_id)) anim_pos = old_botRoom_pos[user_id];
                        else anim_pos = old_seats[user_id]; 
                        room = "bot";
                    }
                }
                // Pilot
                else{
                    // BCD top room
                    if (prop == ("C0:6D") || prop == ("F6:B0") || prop == ("C7:42")) {
                        if (new_topRoom_pos.hasOwnProperty(user_id)) anim_pos = new_topRoom_pos[user_id];
                        else anim_pos = new_seats[user_id];
                        room = "top";
                    }
                    // EF meet room
                    else if (prop == ("E5:E8") || prop == ("C4:69")) {
                        if (new_meetRoom_pos.hasOwnProperty(user_id)) anim_pos = new_meetRoom_pos[user_id];
                        else anim_pos = new_seats[user_id];
                        room = "meet";
                    }
                    // A bot room
                    else {
                        if (new_botRoom_pos.hasOwnProperty(user_id)) anim_pos = new_botRoom_pos[user_id];
                        else anim_pos = new_seats[user_id];
                        room = "bot";
                    }
                }

                var obj = {
                    "user": user_id,
                    "beacon": prop,
                    "times": times,
                    "most_visited": sum_most_visited[user_id].beacon === prop,
                    "dist": dist.toFixed(2),
                    "alpha": alpha.toFixed(2),
                    "beaconX": beaconX,
                    "beaconY": beaconY,
                    "room": room,
                    "animX": anim_pos.x,
                    "animY": anim_pos.y,
                    "color": rgb2hex(document.getElementById("user_"+user_id).style.background),
                    "interval": interval["interval"]
                };
                resInterval.push(obj);
            }
        }
    }// end for each user
    console.log(resInterval);
    return resInterval;
};

// Get request the server for the esm responses
// returns the object
function fetchESM() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "esm");
    xhr.addEventListener('readystatechange', function() { 
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) { 
            if(xhr.responseText === "File asked not available"){
                alert("A problem has occured, the file is not available" );
            }
            else{
                esm = JSON.parse(xhr.responseText);
            }
        }
    });
    xhr.send();
};

// Check if the date is right from the date picker. switch Canvas if needed
// switchCanvas() is defined in front_end.js
function checkDate() {
    selectedFullDate = document.getElementById("date").value;
    month = selectedFullDate.substring(5, 7);
    jour = selectedFullDate.substring(8, 10);
    var d = new Date(2017,month,jour);
    console.clear();
    //1489356000000 == Monday 13 March 2017 00:00:00
    if((isOld && d.getTime() >= 1489356000000) || (!isOld && d.getTime() < 1489356000000)) {
        // changes the background map and switches the value of isOld.
        switchCanvas();
    }
    localStorage.date = document.getElementById("date").value.substring(5, 10);;
};

//Function to convert hex format to a rgb color 
function rgb2hex(orig){
    var rgb = orig.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
    return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : orig;
};
