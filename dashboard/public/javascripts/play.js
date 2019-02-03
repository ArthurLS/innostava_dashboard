/* play.js */
var isPlaying = false;

// onclick listener of "Play" button and space bar
function play_btn() {

    var btn = document.getElementById('play');
    if (btn.innerHTML === "Play") {
        btn.innerHTML = "Pause";
        isPlaying = true;
        play();
    }
    else if(btn.innerHTML === "Pause"){
        btn.innerHTML = "Play";
        isPlaying = false;
        // Reset prevMap. It's used for the animation
        prevMap = new Object();
    }
};

// play() moves up the range (position in the day) from one and draws it.
// Loop over itself until the end of the range or if the user pauses.
// timeout is the frame rate of the animation, set by the user
function play() {
    document.getElementById("range").stepUp();
    var pos = document.getElementById("range").value;
    
    if (isPlaying) {
        drawRange();

        if (pos < daySum.length-1) {
            setTimeout(function(){
                play();
            }, localStorage.speed);
        }
        else{
            setTimeout(function(){
                document.getElementById('play').innerHTML = "Play";
                document.getElementById("range").value = 0;
                isPlaying = false;

                drawRange();
            }, localStorage.speed);
        }
    }
};
