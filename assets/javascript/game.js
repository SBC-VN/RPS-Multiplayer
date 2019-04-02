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

function setupGameMatrix() {
    // Populate this here so we know it gets done.
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
}

// Login..
$(".register-btn").on("click",function() {
    var screenName = $("#screen-name").val();
    if (screenName) {
        dbSetPlayerName(screenName, this.getAttribute("id"));
    }
    $("#screen-name").val("");
});

function displayLobbyFrame() {
    $("#main-section").empty();
    $("#right-section").empty();
    $("#sub-header").text("Game Lobby");
    $("#right-section").append($("#chat-section"));   

    var playerContainer1=$('<div id="player-container-1" class="player-container">');
    $("#main-section").append(playerContainer1);

    var playerContainer2=$('<div id="player-container-2" class="player-container">');
    $("#main-section").append(playerContainer2);

    var resultsSection=$('<div id="results-section">');
    resultsSection.append('<h2>Player <span id="winning-player">name</span> wins!</h2>');
    resultsSection.css("display","none");
    $("#main-section").append(resultsSection);
}

function setSpectatorFrame(playerFrame) {
    console.log("setSpectatorFrame",playerFrame);
    // Clear out what's there.
    var playerContainer=$("#player-container-"+playerFrame);
    playerContainer.empty();

    // Create a player specific frame from the 'default' view.
    var genericPlayerSection = $("#player-view-section");
    var playerSection = genericPlayerSection.clone();
    playerSection.attr("id","player-"+playerFrame+"-section");    
    var playerNameSection = playerSection.find("#player-name");
    if (playerFrame == 1) {
        playerNameSection.text(dbPlayer1Name);
    }
    else {
        playerNameSection.text(dbPlayer2Name);
    }
    playerSection.css("display","block");    
    playerContainer.append(playerSection);
    playerContainer.css("display","block");
}

function setPlayerFrame(playerFrame) {
    // Clear out what's there.
    console.log("setPlayerFrame",playerFrame);
    var playerContainer=$("#player-container-"+playerFrame);
    playerContainer.empty();

    var genericPlayerSection = $("#player-play-section");
    var playerSection = genericPlayerSection.clone();
    playerSection.attr("id","player-"+playerFrame+"-section");
    var playerNameSection = playerSection.find("#player-name");
    if (playerFrame == 1) {
        playerNameSection.text(dbPlayer1Name);
    }
    else {
        playerNameSection.text(dbPlayer2Name);
    }
    playerSection.css("display","block");    
    playerContainer.append(playerSection);
    playerContainer.css("display","block");
}

// Set the display to a spectator.
function setSpectatorDisplay() {
    displayLobbyFrame();
    setSpectatorFrame(1);
    setSpectatorFrame(2);
}

function setPlayerDisplay(playerNumber) {
    console.log("setPlayerDisplay",playerNumber);
    displayLobbyFrame();

    if (playerNumber == 1) {
        setPlayerFrame(1);
        setSpectatorFrame(2);        
    }
    else {
        setSpectatorFrame(1);
        setPlayerFrame(2);
    }
    $("#timer-section").css("display","block");
}

function startRoundTimer() {
    return;
    clearInterval(timerId);
    timerId = setInterval(timerTickHandler,1000);
}

function setPlayerNames() {
    var player1Section = $("#player-1-section");
    var player1NameSection = player1Section.find("#player-name");
    player1NameSection.text(dbPlayer1Name);
    var player2Section = $("#player-2-section");
    var player2NameSection = player2Section.find("#player-name");
    player2NameSection.text(dbPlayer2Name);
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
    console.log("Player current choice",playerCurrentChoice);
    playerThrowChoice = playerCurrentChoice.toLowerCase();
    console.log("throw button");
    setPlayerChoice(playerThrowChoice);
});

function timerTickHandler() {
    $("#time-remaining").text(--currentChoiceTime);
    if (currentChoiceTime <= 0) {
        console.log("timer tick setplayerchoice");
        clearInterval(timerId);
        setPlayerChoice("?");
    }
}

function displayThrow(playerNumber, playerChoice) {
    var playerSection = $("#player-" + playerNumber + "-section");
    var playerChoiceImage = playerSection.find("#player-choice-img");        
    if (playerChoice === 'r') {
        playerChoiceImage.attr("src","./assets/images/rock.png");
    }
    else if (playerChoice === 'p') {
        playerChoiceImage.attr("src","./assets/images/paper.png");
    }
    else if (playerChoice === 's') {
        playerChoiceImage.attr("src","./assets/images/scissors.png");
    }
    else {
        playerChoiceImage.attr("src","./assets/images/question.png");
    }
}

function displayRound() {
    console.log("displayRound",dbGameRound);
    $("#results-section").css("display","none");
    // This routine should do nothing (else) if the user is not a player.
    if (myPlayerNumber != 1 && myPlayerNumber != 2) {
        if (dbGameRound == 0) {
            setSpectatorDisplay();
        }
        return;
    }
    else if (dbGameRound == 0) {
        setPlayerDisplay(myPlayerNumber);
    }
       
    $("#player-rock-choice").css("opacity",1);
    $("#player-paper-choice").css("opacity",1);
    $("#player-scissors-choice").css("opacity",1);
    setPlayerChoice("");

    currentChoiceTime = initialChoiceTime;
    clearInterval(timerId);
    timerId = setInterval(timerTickHandler,1000);
}

function endRound(winningPlayerNumber) {
    // Announce the winner..
    if (myPlayerNumber == 0) {
        displayThrow(1,dbPlayer1Choice);
        displayThrow(2,dbPlayer2Choice);
    }
    else if (myPlayerNumber == 1) {
        displayThrow(2,dbPlayer2Choice);
    }
    else {
        displayThrow(1,dbPlayer1Choice);
    }

    $("#results-section").css("display","block");
    if (winningPlayerNumber == 1) {
        $("#winning-player").text(dbPlayer1Name);
    }
    else {
        $("#winning-player").text(dbPlayer2Name);
    }
    
    if (roundId > 5) {
        // End of game.  Select new players.  Wait 5 seconds.
        selectReplacementPlayer();
        setTimeout(startNextRound,5000);
    }
    else {
    // Wait for 3 seconds, then initiate the next round.
        setTimeout(startNextRound,3000);
    }
}

function endGame(winningPlayerNumber) {
    clearInterval(timerId);
    $("#timer-section").css("display","none");
    displayLobby();
}

$( document ).ready(function() {
    var instructions = $("#instructions-object");
    $("#main-section").append(instructions);
});

