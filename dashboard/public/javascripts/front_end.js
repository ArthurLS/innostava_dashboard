/* front_end.js */

//Old Office
var canvas = document.getElementById("officeCanvas");
var ctx = canvas.getContext('2d');
var img = new Image;
img.src = '/images/old_office.png';

/*
* Is called by checkDate() (index.js)
* Handles the background picture (new or old office)
* Switches the value of isOld
*/
function switchCanvas() {
	if (isOld) {
		img = new Image;
		img.src = '/images/new_office.png';
	} 
	else {
		img = new Image;
		img.src = '/images/old_office.png';
	}
	isOld = !isOld;
};

// Handles the containers placement according to the user window (phone, tablet, PC)
window.addEventListener('resize', function () {
	resize();
})
function resize() {
	var big = document.body;
	var right = document.getElementById("right-container");
	var bigWidth = $(big).width();
	if(bigWidth > 1005){
		var str = (bigWidth - 550) +"px";
		right.style.width = str;		
	}
}

// Called by the menu. Show/Hide info
function showInfo() {
	var doc = document.getElementById("show-info");
	if (localStorage.info == "true"){
		localStorage.info = false;
		doc.innerHTML = "Show Info";
		$("#info-display").hide();
		writeESM();
	} 
	else {
		localStorage.info = true;
		doc.innerHTML = "Hide Info";
		$("#info-display").show();
		writeESM();
	}
	hr();
};

// Called by the menu. Show/Hide Users selector
function showUsers() {
	var doc = document.getElementById("show-users");
	if (localStorage.users == "true"){
		localStorage.users = false;
		doc.innerHTML = "Show Users";
		$("#users-display").hide();
	} 
	else {
		localStorage.users = true;
		doc.innerHTML = "Hide Users";
		$("#users-display").show();
	}
	hr();
};

// Only called when creating the page. Initialize users colored selectors html code
function initUsers() {
	var userColors = JSON.parse(localStorage.userColors);
	
	var h4 = '<h4><b>Select</b> or <b>Unselect</b> users by clicking on the top square. Change color with the second one.</h4>';
	$("#users-display").append(h4);
	for (var i = 1; i < 11; i++) {
		var div ='<div id="color_container_'+i+'" style="display: inline-block;" > </div>';
		var elem = '<div class="small-square" id="user_'+i+'" onclick="getSelectedUsers(\''+i+'\');">'+i+'</div>';
		var input = '<div>'+'<input type="color" id="color_'+i+'" value="'+userColors[i-1]+'" onchange="changeColor(\''+i+'\', this)"></div>';
		
		$("#users-display").append(div);
		$("#color_container_"+i).append(elem);
		$("#color_container_"+i).append(input);
	}

	var reset = '<div class="tab-btn" style="display: block; background:black;" onclick="resetColors()">Reset Colors</div>';
	$("#users-display").append(reset);

	if (localStorage.users == "false"){
		document.getElementById('show-users').innerHTML = "Show Users";
		$("#users-display").hide();
	}
	else {
		document.getElementById('show-users').innerHTML = "Hide Users";
		$("#users-display").show();
	}
};

/*
* getSelectedUsers: onchange() function on the users selection box
* Handles the array which contains all the selectedUsers
*
* id: users that needs to be added/removed
*/
function getSelectedUsers(id) {
	var selectedUsers = JSON.parse(localStorage.selectedUsers);

	if (selectedUsers.indexOf(id) > -1) selectedUsers.splice(selectedUsers.indexOf(id), 1);

	else selectedUsers.push(id);

	localStorage.selectedUsers = JSON.stringify(selectedUsers);
	updateColorUsers();
	drawRange();
};

// Triggerd by the black "Reset Colors" button.
// Resets the colors for each user
function resetColors() {
	var obj = ["#e31a1c","#33a02c","#1f78b4","#ff7f00","#6a3d9a","#fb9a99","#b2df8a","#a6cee3","#fdbf6f","#cab2d6"];
	localStorage.userColors = JSON.stringify(obj);
	for (var i = 1; i < 11; i++) {
		document.getElementById("color_"+i).value = obj[i-1];
	}
	updateColorUsers();
	drawRange();
}

// Change the color of one user (called by the colorpicker)
function changeColor(id, elem) {
	var userColors = JSON.parse(localStorage.userColors);
	userColors[id-1] = elem.value;
	localStorage.userColors = JSON.stringify(userColors);
	updateColorUsers();
	drawRange();
}

// Called by every function that affects the user colors
// updates the color of all the colored small-squares
function updateColorUsers() {
	var selectedUsers = JSON.parse(localStorage.selectedUsers);
	var userColors = JSON.parse(localStorage.userColors);

	for (var i = 1; i < 11; i++) {
        // If he's a selected user
        if (selectedUsers.indexOf(i+"") > -1) {
        	document.getElementById("user_"+i).style.background = userColors[i-1];
        	document.getElementById("user_"+i).style.color = 'white';
        	$('#color_'+i).removeClass('disabledbutton');
        }
        else {
        	document.getElementById("user_"+i).style.background = "rgba(100,100,100,0.2)";
        	document.getElementById("user_"+i).style.color = 'rgba(20,20,20,0.3)';
        	$('#color_'+i).addClass('disabledbutton');
        }
    }
};

// Called by the menu. Show/Hide ESM responeses
function showESM() {
	var doc = document.getElementById("show-esm");
	if (localStorage.esm == "true"){
		localStorage.esm = false;
		doc.innerHTML = "Show ESM";
		$("#esm-display").hide();
	} 
	else {
		localStorage.esm = true;
		doc.innerHTML = "Hide ESM";
		writeESM();
		$("#esm-display").show();
	}
	hr();
};

// Writes the html code for the esm responses
function writeESM() {

	$("#esm-content").html("");

	if($("#show-info").html() == "Hide Info") $("#esm-hr").show();
	else $("#esm-hr").hide();

	var userColors = JSON.parse(localStorage.userColors);

	esm_day.sort(function(a, b) {
		var Atime = addZero(a.hour)+"-"+addZero(a.minute);
		var Btime = addZero(b.hour)+"-"+addZero(b.minute);
		if (Atime > Btime) return 1;
		if (Atime < Btime) return -1;
		return 0;
	});

	for (var i = 0; i < esm_day.length; i++) {
		var str = "";

		var color = userColors[Number(esm_day[i].device_id)-1];
		str +=  '<div class="col-md-12" style="padding-left: 0px;">'+
		'<span class="glyphicon glyphicon-question-sign"></span>'+
		'<span class="really-small-square" style="background: '+color+';">'+esm_day[i].device_id+'</span>'+
		'<span id="btn_coll_'+i+'" onclick="triggered('+i+')" class="really-small-square collapsed" style="cursor: pointer; background: '+color+';"'+
		'data-toggle="collapse" data-target="#demo_'+i+'">+</span>'+
		'<span>'+addZero(esm_day[i].hour)+':'+addZero(esm_day[i].minute)+'</span>'+
		'</div>';

		if (localStorage.language == "finnish") {
			str += '<div class="col-md-12 collapse" style="padding-left: 0px;" id="demo_'+(i)+'">'+ 
			'<b>Q1: Valitse tilanne:</b> '+formatAnswers("v1", esm_day[i]["v1"])+'<br>'+
			'<b>Q2: Valitse tilanne asiakastapaamiselle:</b> '+formatAnswers("v2", esm_day[i]["v2"])+'<br>'+
			'<b>Q3: Valitse tila:</b> '+formatAnswers("v3", esm_day[i]["v3"])+'<br>'+
			'<b>Q4: Kenen kanssa?:</b> '+formatAnswers("v4", esm_day[i]["v4"])+'<br>'+
			'<b>Q5: Tukiko tila … ?</b> (0-5, 0 = eivastausta, 1 = matala, 5 = korkea)<br>'+
			esm_day[i]["v5-1"]+' -> Keskittymistä <br>'+
			esm_day[i]["v5-2"]+' -> Kommunikaatiota <br>'+
			esm_day[i]["v5-3"]+' -> Häiriötöntä työskentelyä <br>'+
			esm_day[i]["v5-4"]+' -> Ongelmanratkaisua <br>'+
			esm_day[i]["v5-5"]+' -> Uuden tiedon tai tuotteen tuottamista <br>'+
			esm_day[i]["v5-6"]+' -> Innovointia <br>'+
			esm_day[i]["v5-7"]+' -> Asioiden esittämistä <br>'+
			esm_day[i]["v5-8"]+' -> Yksityisyyttä <br>'+
			esm_day[i]["v5-9"]+' -> Tukiko yhteisöllinen vaiheistus työskentelyä <br>'+
			'<b>Q6: Kesto:</b> '+formatAnswers("v6", esm_day[i]["v6_2"])+'<br>'+
			'<b>Q7: Vapaa Kommentti:</b> '+formatAnswers("v7", esm_day[i]["v7"])+' <br>'+
			'</div>';	
		}
		else{
			str += '<div class="col-md-12 collapse" style="padding-left: 0px;" id="demo_'+(i)+'">'+ 
			'<b>Q1: Select situation:</b> '+translate("v1", formatAnswers("v1", esm_day[i]["v1"]))+'<br>'+
			'<b>Q2: Select context for client meeting:</b> '+translate("v2", formatAnswers("v2", esm_day[i]["v2"]))+'<br>'+
			'<b>Q3: Select location:</b> '+translate("v3", formatAnswers("v3", esm_day[i]["v3"]))+'<br>'+
			'<b>Q4: With whom?:</b> '+formatAnswers("v4", esm_day[i]["v4"])+'<br>'+
			'<b>Q5: Did the space support…?</b> (0-5, 0 = no answer, 1 = low, 5 = high)<br>'+
			esm_day[i]["v5-1"]+' -> Concentration <br>'+
			esm_day[i]["v5-2"]+' -> Communication <br>'+
			esm_day[i]["v5-3"]+' -> Undisturbed working <br>'+
			esm_day[i]["v5-4"]+' -> Problem solving <br>'+
			esm_day[i]["v5-5"]+' -> Producing new knowledge or product <br>'+
			esm_day[i]["v5-6"]+' -> Innovation <br>'+
			esm_day[i]["v5-7"]+' -> Presentation <br>'+
			esm_day[i]["v5-8"]+' -> Privacy <br>'+
			esm_day[i]["v5-9"]+' -> Did scripting support working? <br>'+
			'<b>Q6: Duration:</b> '+formatAnswers("v6", esm_day[i]["v6_2"])+'<br>'+
			'<b>Q7: Free comment:</b> '+formatAnswers("v7", esm_day[i]["v7"])+' <br>'+
			'</div>';
		}
		
		$("#esm-content").append(str);
	}
}

function translate(Q_id, a) {
	if (a == "No Answer") return a;
	else if (Q_id === "v1") {
		return esm_v1[a];
	}
	else if (Q_id === "v2") {
		return esm_v2[a];
	}
	else if (Q_id === "v3") {
		if (isOld) return esm_v3_old[a];
		else return esm_v3_new[a];
	}
}

// Called by writeESM()
// Reformat the ESM raw data into better readable answers
function formatAnswers(Q_id, a) {
	if ((a == '' || a == 'NA' || a == '[]') && Q_id != "v4") {
		if (localStorage.language == "finnish") return "Ei vastausta";
		else return "No Answer";
	}
	else if (Q_id === "v3") {
		return a.replace(/\[|;\]/gi, '');
	}
	else if(Q_id === "v4"){
		if (a == 'NA') {
			if (localStorage.language == "finnish") return "Yksin";
			else return "Alone";
		}
		else return a;
	}
	else if(Q_id === "v6"){
		return a+" min";
	}
	else return a;
}

// Triggers the collapse of esm responses paragraphs
function triggered(i) {
	if(document.getElementById('btn_coll_'+i).innerHTML == "-"){
		document.getElementById('btn_coll_'+i).innerHTML = "+";
	}
	else document.getElementById('btn_coll_'+i).innerHTML = "-";
}

// Called by the menu. Show/Hide Beacons on the map
function showBeacons() {
	var doc = document.getElementById("show-beacons");

	if (localStorage.beacons == "true"){
		localStorage.beacons = false;
		doc.innerHTML = "Show Beacons";
		$("#show-beacons").removeClass("active");
	} 
	else {
		localStorage.beacons = true;
		doc.innerHTML = "Hide Beacons";
		$("#show-beacons").addClass("active");
	}
	drawRange();
};

// Called by the menu. Show/Hide Seats on the map
function showSeats() {
	var doc = document.getElementById("show-seats");

	if (localStorage.seats == "true"){
		localStorage.seats = false;
		doc.innerHTML = "Show Seats";
		$("#show-seats").removeClass("active");
	} 
	else {
		localStorage.seats = true;
		doc.innerHTML = "Hide Seats";
		$("#show-seats").addClass("active");
	}
	drawRange();
};

// Creates the line between Info/ESM/User Selector according to wich one is "ON" or "OFF"
function hr() {
	if(($("#show-info").html() == "Hide Info" || $("#show-esm").html() == "Hide ESM") && $("#show-users").html() == "Hide Users")
		$("#hr-display").show();

	else
		$("#hr-display").hide();
}

// switches the language of the esm questionnaires

function esmLanguage() {
	if (localStorage.language == "english") localStorage.language = "finnish";
	else localStorage.language = "english";

	writeESM();
}

// Jquery listeners
$(document).ready(function(){
	$('#date').on("change", function(e){
		checkDate();
	});
	$('#date').on("click", function(e){
		checkDate();
	});

	$('#first-dropdown li').on("click", function(e){
		e.stopPropagation();
		e.preventDefault();
	});

	$('#menu_interval').on("click", function(e){
		$("#ul_speed").hide();
		$(this).next('ul').toggle();
		e.stopPropagation();
		e.preventDefault();
	});
	$('#menu_speed').on("click", function(e){
		$("#ul_interval").hide();
		$(this).next('ul').toggle();
		e.stopPropagation();
		e.preventDefault();
	});

	$('#ul_speed li a').on("click", function(e){
		$("#ul_speed").hide();
        // remove old active
        $("#"+localStorage.speed).removeClass("active");
        // store in local Storage
        localStorage.speed = e.target.id;
        // display new active
        $("#"+localStorage.speed).addClass("active");
        e.stopPropagation();
        e.preventDefault();
    });
	$('#ul_interval li a').on("click", function(e){
		$("#ul_interval").hide();
        // remove old active
        $("#"+localStorage.intervalLength).removeClass("active");
        // store in local Storage
        localStorage.intervalLength = e.target.id;
        // display new active
        $("#"+localStorage.intervalLength).addClass("active");
        e.stopPropagation();
        e.preventDefault();
    });
});


// Step up/down the range input, then draws the new position
function arrowUp() {
	document.getElementById("range").stepUp();
	drawRange();
};
function arrowDown() {
	document.getElementById("range").stepDown();
	drawRange();
};

// Keybord Shortcuts
$(document).keydown(function(e) {
	switch(e.which) {
		case 32:  play_btn();
		break;

        case 37: arrowDown(); // left
        break;

        case 38: arrowUp(); // up
        break;

        case 39: arrowUp(); // right
        break;

        case 40: arrowDown(); // down
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
