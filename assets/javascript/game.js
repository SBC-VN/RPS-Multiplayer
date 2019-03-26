// Array of allowable choices.  Can add Spoc(k) and (L)izard later.
var gameChoices = ['r', 'p', 's'];

// The matrix will be an array of arrays.   The choices will already be made in the matrix.
var gameMatrix = [];

for (i=0; i<gameChoices.length; i++) {
    gameMatrix[i] = [];   
    for (j=0; j<gameChoices.length; j++) {
        gameMatrix[i][j] = 0;
    }
}

//  Now populate the matrix with player 1 victories.  (Player1 = 'index 1')
gameMatrix[gameChoices.indexOf('r')][gameChoices.indexOf('s')] = 1;
gameMatrix[gameChoices.indexOf('p')][gameChoices.indexOf('r')] = 1;
gameMatrix[gameChoices.indexOf('s')][gameChoices.indexOf('p')] = 1;

// Now populate the matrix with player 2 victories.  (Player 2 = 'index 2')
gameMatrix[gameChoices.indexOf('s')][gameChoices.indexOf('r')] = 2;
gameMatrix[gameChoices.indexOf('r')][gameChoices.indexOf('p')] = 2;
gameMatrix[gameChoices.indexOf('p')][gameChoices.indexOf('s')] = 2;


// Login..
$(".choice-btn").on("click",function() {
    var screenName = $("#screen-name").val();
    if (screenName) {
        var buttonId = this.getAttribute("id");
        if (buttonId === "btn-spectate") {
            console.log("spectator",screenName);
        }
        else if (buttonId === "btn-play") {
            console.log("player",screenName);
        }
    }   
    $("#screen-name").val("");
});