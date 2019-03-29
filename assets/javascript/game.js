var playerDbConnection;
var initialChoiceTime=20;
var currentChoiceTime=20;
var timerId;
var roundId=0;

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
$(".register-btn").on("click",function() {
    var screenName = $("#screen-name").val();
    if (screenName) {
        dbSetPlayerName(screenName, this.getAttribute("id"));
    }
    $("#screen-name").val("");
});

function displayLobby(playerType) {    
    if (playerType === "btn-play") {
        dbAddPlayerToQueue();
    }
    console.log("switch to lobby");
}   


var playerCurrentChoice="";

// Select Rock, Paper, or Scissors..
$("#main-section").on("click","img",function() {
    var buttonId = this.getAttribute("id");
    if (buttonId === "player-rock-choice") {
        playerCurrentChoice = "r";
        $("#player-rock-choice").css("opacity",1);
        $("#player-paper-choice").css("opacity",0.3);
        $("#player-scissors-choice").css("opacity",0.3);
    }
    else if (buttonId === "player-paper-choice") {
        playerCurrentChoice = "p";
        $("#player-rock-choice").css("opacity",0.3);
        $("#player-paper-choice").css("opacity",1);
        $("#player-scissors-choice").css("opacity",0.3);
    }
    else if (buttonId === "player-scissors-choice") {
        playerCurrentChoice = "s";
        $("#player-rock-choice").css("opacity",0.3);
        $("#player-paper-choice").css("opacity",0.3);
        $("#player-scissors-choice").css("opacity",1);
    }
    else {
        playerCurrentChoice="";
    }
});

function processThrow() {
    clearInterval(timerId);
    console.log("Player throws!",playerCurrentChoice);
    // playerDbId
    // playerCurrentChoice

}

// The click on "throw"..
$("#main-section").on("click","button",function() {
    var buttonId = this.getAttribute("id");
    if (buttonId === "throw-button") {
        processThrow();
    }
});

function timerTickHandler() {
    $("#time-remaining").text(--currentChoiceTime);
    if (currentChoiceTime <= 0) {
        processThrow();
    }
}

function startRound() {
    roundId++;
    $("#sub-header").text("Round: " + roundId);
    currentChoiceTime = initialChoiceTime;
    $("#player-rock-choice").css("opacity",1);
    $("#player-paper-choice").css("opacity",1);
    $("#player-scissors-choice").css("opacity",1);
    clearInterval(timerId);
    timerId = setInterval(timerTickHandler,1000);
}