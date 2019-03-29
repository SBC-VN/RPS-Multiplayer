var playerDbConnection;
var initialChoiceTime=20;
var currentChoiceTime=20;
var timerId;
var roundId=0;

var playerCurrentChoice="";
var playerThrowChoice="";

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
    $("#main-section").empty();
    $("#right-section").empty();
    $("#sub-header").text("Game Lobby");
}   

$("#msg-submit-btn").on("click",function(event) {
    event.preventDefault();
    if ($("#msg-text").val()) {
        addChatMessage($("#msg-text").val());
    }
});

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

// The click on "throw"..
$("#throw-button").on("click",function() {
    clearInterval(timerId);
    playerThrowChoice = playerCurrentChoice.toLowerCase();
    setPlayerChoice(playerThrowChoice);
});

function timerTickHandler() {
    $("#time-remaining").text(--currentChoiceTime);
    if (currentChoiceTime <= 0) {
        processThrow();
    }
}

// Only one player needs to do this.  Let it be player 1.
function selectReplacementPlayer() {
    if (playerNumber == 1) {
        newPlayer1 = 0;
    }
}

function startRound(startType) {
    $("#results-section").css("display","hidden");
    // This routine should do nothing (else) if the user is not a player.
    if (playerNumber != 1 && playerNumber != 2) {
        return;
    }

    if (startType != "reset") {
        roundId++;
    }

    $("#sub-header").text("Round: " + roundId);
    currentChoiceTime = initialChoiceTime;
    $("#player-rock-choice").css("opacity",1);
    $("#player-paper-choice").css("opacity",1);
    $("#player-scissors-choice").css("opacity",1);
    setPlayerChoice("");
    clearInterval(timerId);
    timerId = setInterval(timerTickHandler,1000);
}

function endRound(winningPlayerNumber) {
    // Announce the winner..
    $("#results-section").css("display","block");
    $("winning-player").text(winningPlayerNumber);    
    
    if (roundId > 5) {
        // End of game.  Select new players.  Wait 5 seconds.
        selectReplacementPlayer();
        setTimeout(startRound,5000);
    }
    else {
    // Wait for 3 seconds, then initiate the next round.
        setTimeout(startRound,3000);
    }
}

function checkThows() {
    // Convert relative (playerThrowChoice) to absolute (player 1/2)
    if (playerNumber === 1) {
        player1Choice = playerThrowChoice;
        player2Choice = dbPlayer2Choice;
    }
    else if (playerNumber === 2) {
        player1Choice = dbPlayer1Choice;
        player2Choice = playerThrowChoice;
    }
    else {
        player1Choice = dbPlayer1Choice;
        player2Choice = dbPlayer2Choice;
    }

    // If one of the players hasn't made a choice yet - need to wait.
    if (player1Choice && player2Choice) {
        // The matrix determines the winner...     
        var winner = gameMatrix[gameChoices.indexOf(player1Choice)][gameChoices.indexOf(player2Choice)];
        if (winner === 0) {
            startRound("reset");
        }
        else {
            endRound(winner);
        }
    }
}

$( document ).ready(function() {
    var instructions = $("#instructions-object");
    $("#main-section").append(instructions);
});

