/* draw.js */

/*
* Globally used function used to refresh the map after any kind of change (color, position, users, date...)
* writes the date and hour on the UI
* calls either the animation function drawPlay() or the basic drawInter()
*/
function drawRange(){
    // position is defined by where the range is in the day
    var position = Number(document.getElementById("range").value);
    
    // Writes the date and time below the map
    var date = new Date(Number(Object.keys(daySum[position])[0]));
    var properDate = weekDays[date.getDay()]+" "+addZero(date.getDate())+"-"+addZero(date.getMonth()+1);

    // If end of the interval
    var str2 = "17:00";
    if(position < document.getElementById("range").max){
        var date2 = new Date(Number(Object.keys(daySum[position+1])[0]));
        str2 = addZero(date2.getHours())+":"+addZero(date2.getMinutes());
    }
    // Full string
    var str ="";
    if (isPlaying) str = properDate +"<br>"+addZero(date.getHours())+":"+addZero(date.getMinutes());
    else str = properDate +"<br>"+addZero(date.getHours())+":"+addZero(date.getMinutes())+ " - "+str2;
    document.getElementById("label_range").innerHTML= str;
    
    resetMap();
    
    // if playing or not, the drawing process is not the same
    // processInterval() is defined in index.js
    // drawInter() is defined in draw_inter.js
    if(isPlaying) drawPlay(mapPoints(processInterval(position)));
    else drawInter(processInterval(position));
};

/*
* Draws the animation (one interval)
* map is a list of points to draw, created by mapPoints()
*/
function drawPlay(map) {
    for(var id in map){
        var user = map[id];
        for(var room in user){
            if(room == "bot" || room == "top" || room == "meet" || room == "coffee"){
                drawPoint(user[room]["x"], user[room]["y"], user[room]["radius"], user["color"]);
                drawChar(user[room]["x"], user[room]["y"], "rgba(255,255,255,1)", user["user_id"]);  
            }
        }
    }
}

/*
* mapPoints() main use is to add the radius of the point, according to previous intervals.
* the more a user stays in the same spot, the bigger the point is
* inter: created by processInterval()
* returns: new obj with only required info to draw a point in animation.
*/
// prevMap records the previous interval, to see which points have to get bigger or smaller
var prevMap = {};
function mapPoints(inter) {
    var map = {};
    var radius = 4;

    var nbrUser = JSON.parse(localStorage.selectedUsers).length;

    // loops over all the data point processed by getInterval
    for (var i = 0; i < inter.length; i++) {
        var user_id = inter[i].user;

        // precise position of the user on the map is already defined
        var posx = inter[i].animX;
        var posy = inter[i].animY;
        var point = {};
        
        // this loops handle the size of the point.
        // in the animation, the more a user stays still, the bigger the point.
        if(prevMap.hasOwnProperty(user_id)){
            
            point = prevMap[user_id];

            // Lower down every radius of one.
            // Only one will increase, the others will decrease
            for(var salle in point){
                if (salle == "bot" || salle == "top" || salle == "meet" || salle == "coffee"){
                    point[salle].repet -= 1;
                    point[salle].radius -= radius;
                    // if the radius coef = 0, we delete the room
                    if(point[salle].repet < 0) delete point[salle];
                }
            }
            if (point.hasOwnProperty(inter[i]["room"])) {
                if (point[inter[i]["room"]].repet+1 < 4) {
                    point[inter[i]["room"]].repet += 2;
                    point[inter[i]["room"]].radius += radius*2;
                }
                else {
                    point[inter[i]["room"]].repet = 4;
                    point[inter[i]["room"]].radius = radius * point[inter[i]["room"]].repet;
                }
            }
            else{
                point[inter[i]["room"]] = {repet: 1, x: posx, y: posy, radius: radius}
            }
        }
        else{
            point["user_id"] = user_id;
            point[inter[i]["room"]] = {repet: 1, x: posx, y: posy, radius: radius}
            point["color"] = inter[i].color;
        }
        map[point.user_id] = point;
    }
    prevMap = map;
    return map;
};

/*
* Resets the map
*/
function resetMap() {
    drawImageProp(ctx, img, 0, 0, canvas.width, canvas.height, 0.1, 0.5);
    if (localStorage.seats == "true") drawSeats();
    if (localStorage.beacons == "true") drawBeacons();
};

/*
* Draws a white circle than the point on top of it 
*/
function drawPoint(posx, posy, radius, color) {
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.beginPath();
    ctx.arc(posx, posy, radius, 0 ,2*Math.PI);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(posx, posy, radius, 0 ,2*Math.PI);
    ctx.fill();

};

/*
* Draws a character, used inside the points
*/
function drawChar(posx, posy, color, letter) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (letter === "10") ctx.fillText(letter, posx-6, posy+4);
    else ctx.fillText(letter, posx-3, posy+3);
    ctx.fill();
};

/*
* Draws the beacons on the map 
*/
function drawBeacons() {
    var beacons_pos;
    if (isOld) beacons_pos = old_beacons_pos;
    else beacons_pos = new_beacons_pos;

    ctx.strokeStyle = "#000000"; //black for arcs (stroke)
    ctx.fillStyle = "#000000"; //black for text (fill)
    for (var point in beacons_pos) {
        var obj = beacons_pos[point];
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 10, 0 ,2*Math.PI);
        ctx.fillText(obj.letter, obj.x-4, obj.y+4);
        ctx.stroke();
    }
};

/*
* Draws the seats on the map
*/
function drawSeats() {
    var seats;
    if (isOld) seats = old_seats;
    else  seats = new_seats;

    ctx.strokeStyle = "#1f78b4"; // light blue
    ctx.fillStyle = "#1f78b4";
    for (var point in seats) {
        var obj = seats[point];
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 16, 0 ,2*Math.PI);
        if (point === "10") ctx.fillText(point, obj.x-5, obj.y+4);
        else ctx.fillText(point, obj.x-3, obj.y+3);
        ctx.stroke();
    }
};

/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
 */
 function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    /// default offset is center
    offsetX = typeof offsetX === 'number' ? offsetX: 0.5;
    offsetY = typeof offsetY === 'number' ? offsetY: 0.5;

    /// keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
        nw = iw * r,   /// new prop. width
        nh = ih * r,   /// new prop. height
        cx, cy, cw, ch, ar = 1;

    /// decide which gap to fill    
    if (nw < w) ar = w / nw;
    if (nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    /// calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    /// make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // FIll image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
};

// Transforms a hex color (ex: #FFFFFF) value into rgba(255, 255, 225, alpha)
// Used by drawInter
function hexToRgbA(hex, alpha){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    throw new Error('Bad Hex');
};

function addZero(i) {
    if (i < 10) i = "0" + i;
    return i;
}