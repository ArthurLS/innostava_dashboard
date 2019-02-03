/* constants.js */

// processInterval() result example:
/*
[
	{
        "user": 1,
        "beacon": "C0:6D",
        "times": 1,
        "most_visited": true,
        "dist": 0.39,
        "alpha": "1.00",
        "beaconX": 183,
        "beaconY": 215,
        "room": "top",
        "animX": 228,
        "animY": 178,
        "color": "#e31a1c",
        "interval": "1487570400000"
    }, ...
]
*/

// Beacon Positions => mac_add:{posx, posy, letter of beacon}
// Used also as a list of beacons
var old_beacons_pos = {"D3:8C":{"x":315, "y":495, "letter": 'A'},
"C0:6D":{"x":70,  "y":475, "letter": 'B'},
"E5:E8":{"x":70,  "y":275, "letter": 'C'},
"C7:42":{"x":145, "y":70, "letter": 'D'},
"C4:69":{"x":390, "y":45, "letter": 'E'},
"F6:B0":{"x":290, "y":245, "letter": 'F'}};
var new_beacons_pos = {"D3:8C":{"x":190, "y":480, "letter": 'A'},
"C0:6D":{"x":183, "y":215, "letter": 'B'},
"F6:B0":{"x":93,  "y":37, "letter": 'C'},
"C7:42":{"x":219, "y":58, "letter": 'D'},
"E5:E8":{"x":330, "y":175, "letter": 'E'},
"C4:69":{"x":407, "y":103, "letter": 'F'}};

// Seats position of each user
// Used also as a list of users
var old_seats = {"1":{"x":230, "y":533, "desk_beacon":"D3:8C"},
"2":{"x":80, "y":533, "desk_beacon":"C0:6D"},
"3":{"x":95, "y":88, "desk_beacon":"C7:42"},
"4":{"x":222, "y":81, "desk_beacon":"C7:42"},
"5":{"x":360, "y":81, "desk_beacon":"C4:69"},
"6":{"x":310,  "y":440, "desk_beacon":"D3:8C"},
"7":{"x":80, "y":418, "desk_beacon":"C0:6D"},
"8":{"x":100, "y":282, "desk_beacon":"E5:E8"},
"9":{"x":428, "y":81, "desk_beacon":"C4:69"},
"10":{"x":100, "y":169, "desk_beacon":"E5:E8"}};

var new_seats = {"1":{"x":228, "y":178, "desk_beacon":"C0:6D"},
"2":{"x":239, "y":488, "desk_beacon":"D3:8C"},
"3":{"x":122, "y":178, "desk_beacon":"C0:6D"},
"4":{"x":122, "y":267, "desk_beacon":"C0:6D"},
"5":{"x":175, "y":80, "desk_beacon":"C7:42"},
"6":{"x":213, "y":425, "desk_beacon":"D3:8C"},
"7":{"x":114, "y":466, "desk_beacon":"D3:8C"},
"8":{"x":140, "y":529, "desk_beacon":"D3:8C"},
"9":{"x":242, "y":80, "desk_beacon":"C7:42"},
"10":{"x":228, "y":267, "desk_beacon":"C0:6D"}};

// Array of the alternative position for a point if there is collistion
// The more point at the same place, the further we pick our position in the array
var alterPos = [{"x":Math.cos(Math.PI), "y":Math.sin(Math.PI)},
{"x":Math.cos(Math.PI+Math.PI/3), "y":Math.sin(Math.PI+Math.PI/3)},
{"x":Math.cos(Math.PI+2*Math.PI/3), "y":Math.sin(Math.PI+2*Math.PI/3)},
{"x":Math.cos(0), "y":Math.sin(0)},
{"x":Math.cos(Math.PI/3), "y":Math.sin(Math.PI/3)},
{"x":Math.cos(2*Math.PI/3), "y":Math.sin(2*Math.PI/3)},
{"x":0, "y":-53},
{"x":Math.cos(Math.PI/6)*53, "y":Math.sin(Math.PI/6)*53},
{"x":Math.cos(5*Math.PI/6)*53, "y":Math.sin(5*Math.PI/6)*53}];

// Array of the fixed position for coffe break room users
var coffePos = {"1":{"x":408, "y":334},
"2":{"x":448, "y":335},
"3":{"x":408, "y":369},
"4":{"x":448, "y":369}, 
"5":{"x":408, "y":404},
"6":{"x":448, "y":404},
"7":{"x":408, "y":439},
"8":{"x":448, "y":439},
"9":{"x":408, "y":474},
"10":{"x":448, "y":474}};

// Fixed user position for the Animation
// Used in index.js
var old_topRoom_pos = {"1": {"x":175, "y":180},
"2": {"x":175, "y":225},
"5": {"x":205, "y":245}, 
"6": {"x":205, "y":200},
"7": {"x":175, "y":270},
"9": {"x":205, "y":155}};
var old_botRoom_pos = {"3": {"x":145, "y":460},
"4": {"x":185, "y":460}, 
"5": {"x":225, "y":460},
"8": {"x":125, "y":490},
"9": {"x":165, "y":490},
"10":{"x":205, "y":490}};
var old_meetRoom_pos = {"1": {"x":320, "y":150},
"2": {"x":360, "y":150}, 
"3": {"x":400, "y":150},
"4": {"x":440, "y":150},
"6": {"x":340, "y":180},
"7":{"x":380, "y":180},
"8": {"x":420, "y":180},
"10": {"x":460, "y":180}};
var new_topRoom_pos = {"7": {"x":175, "y":180},
"8": {"x":175, "y":225},
"2": {"x":150, "y":140}, 
"6": {"x":200, "y":140}};
var new_botRoom_pos = {"1": {"x":154, "y":427},
"3": {"x":168, "y":460}, 
"4": {"x":183, "y":497},
"5": {"x":197, "y":529},
"9": {"x":148, "y":490},
"10": {"x":205, "y":468}};
var new_meetRoom_pos = {"1": {"x":385, "y":160},
"2": {"x":415, "y":125},
"3": {"x":425, "y":160}, 
"4": {"x":460, "y":155},
"5": {"x":460, "y":120},
"6": {"x":375, "y":125},
"7": {"x":415, "y":55},
"8": {"x":445, "y":90},
"9": {"x":370, "y":90},
"10": {"x":410, "y":90}};

var esm_v1 = {
	"Keskittymistä vaativa yksin työskentely": "Concentration intensive individual work",
	"Ratkaisukehitys tiimityönä": "Problem solving teamwork", 
	"Ratkaisukehitys ad hoc": "Ad hoc problem solving",
	"Tiimipalaverit": "Team meeting",
	"Kommunikaatio asiakkaiden ja yhteistyökumppaneiden kanssa":"Communication with clients and collaborators",
	"Lounas kahvitauko ja muut tauot":"Lunch, coffee and other breaks",
	"Johtoryhmätyöskentely": "Steering group work",
	"Etätyöskentely": "Remote work"
};
var esm_v2 = {
	"Tapaaminen yrityksen tiloissa":"In-office meeting",
	"Tapaaminen toisaalla":"Out-of-office meeting",
	"Puhelin":"Phone meeting",
	"Skype tai muu videoneuvottelu":"Video conference"
};
var esm_v3_old = {
	"Oma työpiste":"Personal workstation",
	"Jonkun toisen työpiste":"Someone else’s workstation",
	"Yhteinen taukotila aulassa":"Break room",
	"Kokoushuone":"Shared meeting room",
	"Valkotaulu":"White board", 
	"Oma työpiste; Jonkun toisen työpiste pienessä huoneessa":"Personal workstation and someone else’s workstation",
	"Jonkun toisen työpiste pienessä huoneessa; Yhteinen taukotila aulassa":"Someone else’s workstation and the break room"
};
var esm_v3_new = {
	"Oma työpiste":"Personal workstation",
	"Jonkun toisen työpiste":"Someone else’s workstation",
	"Iso työtila":"Larger work area",
	"Laavu":"Camp",
	"Puhelinkoppi":"Phone booth",
	"Puro":"Stream",
	"Tunturimaja":"Fell hut",
	"Pieni työtila":"Smaller work area",
	"Puiston penkki":"Park bench",
	"Yhteinen taukotila aulassa":"Break room",
	"Kokoushuone":"Shared meeting room"
};

var listColors = ["#e31a1c","#33a02c","#1f78b4","#ff7f00","#6a3d9a","#fb9a99","#b2df8a","#a6cee3","#fdbf6f","#cab2d6"];

var weekDays = ["Sunday", "Monday", "Tuesday", "WednesD", "Thursday", "Friday", "Saturday"];