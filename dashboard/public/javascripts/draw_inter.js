/* draw_inter.js */

/*
* drawInter() is called by drawRange() for the "pause" mode. 
* creates every point on the map. 
* 
* inter: created by processInterval()
*/
function drawInter(inter) {

    alpha10 = 0;
    // List of the users in the coffee room
    var listCoffe = [];
    // List of points drawn. Used to prevent point collision
    var listPoints = [];

    // counts the number of user on a beacon.
    // Used to prevent point collision
    var collObj = {};
    for(var beac in old_beacons_pos){
        collObj[beac] = 0;
    }

    // For every beacon of every user
    for (var i = 0; i < inter.length; i++) {
        var colorUsr = hexToRgbA(inter[i].color, inter[i].alpha);
        var colorW = "rgba(255,255,255,1)";
        // Here, letter is actually the users id (1, 2, 3, ...)
        var letter = inter[i].user;

        if (inter[i].dist <= 3.85) {
            // If this is your seat
            if (isThisYourSeat(inter[i])){
                var seats;
                if (isOld) seats = old_seats;
                else seats = new_seats;

                var posx = seats[inter[i].user].x;
                var posy = seats[inter[i].user].y;

                if (inter[i].user === "10" && isOld) {
                    drawPoint(posx, posy, 17, colorUsr.replace(/.\.../, alpha10));
                }
                else{
                    drawPoint(posx, posy, 17, colorUsr);
                }
                if (inter[i].most_visited) drawBorder(posx, posy, 17, "rgba(0,0,0,1)");

                listPoints.push({"x":posx, "y":posy, "rad": 17});
                if (inter[i].alpha > 0.55) drawChar(posx, posy, "rgba(255,255,255,1)", letter);
                else drawChar(posx, posy, "rgba(0,0,0,1)", letter);
            }
            // If you are moving
            else{
                var posx = inter[i].beaconX;
                var posy = inter[i].beaconY;
                var rad = 15;

                for (var c = 0; c < listPoints.length; c++) {
                    var nbCollision = collObj[inter[i].beacon];
                    // p is the collision point
                    var p = listPoints[c];
                    // if collision
                    if ((posx > p.x - p.rad - rad +5) && (posx < p.x + p.rad + rad -5) && (posy > p.y - p.rad - rad +5) && (posy < p.y + p.rad + rad -5)) {
                        if (nbCollision < 6) {
                            posx = inter[i].beaconX + alterPos[nbCollision].x*(p.rad + rad);
                            posy = inter[i].beaconY + alterPos[nbCollision].y*(p.rad + rad);
                            c = 0;
                        }
                        else{
                            posx = inter[i].beaconX + alterPos[nbCollision].x;
                            posy = inter[i].beaconY + alterPos[nbCollision].y;
                        }
                        collObj[inter[i].beacon]++;
                    } 
                }
                listPoints.push({"x":posx, "y":posy, "rad": rad});

                if (inter[i].most_visited) drawBorder(posx, posy, rad, "rgba(0,0,0,1)");
                drawPoint(posx, posy, rad, colorUsr);
                if (inter[i].alpha > 0.55) drawChar(posx, posy, "rgba(255,255,255,1)", letter);
                else drawChar(posx, posy, "rgba(0,0,0,1)", letter);        
            }
        }
        else{
            if(listCoffe.indexOf(inter[i].user) === -1){
                listCoffe.push(inter[i].user);

                if (inter[i].most_visited) drawBorder(coffePos[inter[i].user].x, coffePos[inter[i].user].y, 15, "rgba(0,0,0,1)");
                drawPoint(coffePos[inter[i].user].x, coffePos[inter[i].user].y, 15, colorUsr);
                
                if (inter[i].alpha > 0.55) drawChar(coffePos[inter[i].user].x, coffePos[inter[i].user].y, "rgba(255,255,255,1)", letter);
                else drawChar(coffePos[inter[i].user].x, coffePos[inter[i].user].y, "rgba(0,0,0,1)", letter);  
            }
        }
    }
};

// draws an empty circle, radius is usually 1px bigger than the points to circle it
function drawBorder(posx, posy, radius, color, letter) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(posx, posy, radius, 0 ,2*Math.PI);
    ctx.stroke();
};

// returns boolean if the beacon matches the "desk-beacon" attached to it
var alpha10 = 0;
function isThisYourSeat(user) {
    if (isOld){ 
        if (user.user === "10" && (user.beacon === "C7:42" || user.beacon === "E5:E8" || (user.beacon === "F6:B0" && user.dist > 1.00))) {
            alpha10 += Number(user.alpha);
            return true;
        }
        return old_seats[user.user].desk_beacon === user.beacon;
    }
    else return new_seats[user.user].desk_beacon === user.beacon;
};