
var appConfig = {
    apiKey: "AIzaSyDXrunidIfB2HC2tJqWKf8lGo17_qNL3eg",
    authDomain: "rpsonline-d0424.firebaseapp.com",
    databaseURL: "https://rpsonline-d0424.firebaseio.com",
    projectId: "rpsonline-d0424",
    storageBucket: "rpsonline-d0424.appspot.com",
    messagingSenderId: "486550605953"
};

firebase.initializeApp(appConfig);

// Create a variable to reference the database.
var database = firebase.database();

// Database structure:
//
// {
//  "player1" : <user id>;
//  "player2" : <user id>;
//  "player1-start" : <true/false>;
//  "player2-start" : <true/false>;
//  "player1-choice" : <char: {?,R,P,S}>;
//  "player1-choice" : <char: {?,R,P,S}>;
//  "users" : {
//              <user id> : "player name" 
//            };
//  "wait-list" : { <user id> };
// }
//

// Create all the other references to the database.
var dbIsConnected = database.ref(".info/connected");
var dbRefPlayer1 = database.ref("/player1");
var dbRefPlayer2 = database.ref("/player2");
var dbGameRound = database.ref("/round");
var dbRefPlayer1Start = database.ref("/player1-start");
var dbRefPlayer2Start = database.ref("/player2-start");
var dbRefPlayer1Choice = database.ref("/player1-choice");
var dbRefPlayer2Choice = database.ref("/player2-choice");
var dbRefUsersList = database.ref("/users");
var dbRefWaitList = database.ref("/wait-list");
var dbRefMessages = database.ref("/messages");

var isPlayerRegistered = false;
var dbConnectionObject = null;
var dbPlayerName = null;
var playerNumber = 0;
var dbPlayer1Choice = null;
var dbPlayer2Choice = null;
var dbPlayer1 = null;
var dbPlayer2 = null;

// Register the user's connection to the database.  
// Will attach a player name to it later.
dbIsConnected.on("value", function(snap) {
    if (snap.val()) {
        dbConnectionObject = dbRefUsersList.push("temp-name");
        dbConnectionObject.onDisconnect().remove();
    }
});

// See if the provided playerName is already in use.  If so, return a false,
// if not - change the temp-name to the player's name.
// Using async cause we are going to wait on this later..
function dbSetPlayerName(playerName,playerType) {
    dbRefUsersList.once("value",function(snap) {
        if (snap.val()) {
            var userArray = Object.values(snap.val());
            if (userArray.includes(playerName)) {
                alert("Name is already in-use.  Please choose another.");
                return;
            }
        }
 
        dbConnectionObject.set(playerName);
        isPlayerRegistered=true;
        dbPlayerName=playerName;
        playerNumber = 0;
        displayLobby(playerType);
    });
}

// When a user leaves, need to clean up things.  
//   So, if they were playing - that's a 'rage quit' game over right there.
//   Or, they may have been in the queue to play - so they would need to be removed.
//
dbRefUsersList.on("child_removed", function(data) {
    console.log(data);
});

// Add the player to the player queue...
function dbAddPlayerToQueue() {
    if (isPlayerRegistered) {
        dbRefWaitList.push(dbPlayerName);
    }
}

dbRefWaitList.on("value",function(snap) {
    if (snap.val()) {
        var waitArray = Object.values(snap.val());
        if (waitArray.length > 1 && !dbPlayer1 && !dbPlayer2) {
            // At least two people in the queue, but no game going on.
            initateNewGame();
        }
    }    
});

dbRefMessages.on("value",function(snap) {
    $("#chat-display").append($("<div>").text(snap.val()));
});

function addChatMessage(message) {
    msgText = "[" + dbPlayerName + "] " + message;
    database.ref("/messages").set(msgText);
}

dbRefPlayer1.on("value",function(snap) {
    if (snap.val())
    {
        dbPlayer1 = snap.val();
        if (dbPlayer1 === dbPlayerName) {
            playerNumber = 1;
            return;
        }
        else {
            var $playerSection = $("#player-1-section");
            var $playerName = $playerSection.getElementById("#player-name");
            $playerName.text(dbPlayer1);
        }
    }
});

dbRefPlayer2.on("value",function(snap) {
    if (snap.val())
    {
        dbPlayer2 = snap.val();
        if (dbPlayer2 === dbPlayerName) {
            playerNumber = 2;
            return;
        }
        else {
            var $playerSection = $("#player-2-section");
            var $playerName = $playerSection.getElementById("#player-name");
            $playerName.text(dbPlayer2);
        }
    }
});

dbRefPlayer1Choice.on("value",function(snap) {    
    if (snap.val() && playerNumber != 1)
    {
        var playerSection = $("#player-1-section");
        var playerChoiceImage = playerSection.getElementById("#player-choice-img");
        var dbPlayer1Choice = snap.val();
        if (dbPlayer1Choice === 'r') {
            playerChoiceImage.attr("src","./assets/images/rock.png");
        }
        else if (dbPlayer1Choice === 'p') {
            playerChoiceImage.attr("src","./assets/images/paper.png");
        }
        else if (dbPlayer1Choice === 'p') {
            playerChoiceImage.attr("src","./assets/images/scissors.png");
        }
        else {
            playerChoiceImage.attr("src","./assets/images/question.png");
            dbPlayer1Choice=null;
        }
        checkThrows(); 
    }
});

dbRefPlayer2Choice.on("value",function(snap) {
    if (snap.val() && playerNumber != 2)
    {
        var playerSection = $("#player-2-section");
        var playerChoiceImage = playerSection.getElementById("#player-choice-img");
        var dbPlayer2Choice = snap.val();
        if (dbPlayer2Choice === 'r') {
            playerChoiceImage.attr("src","./assets/images/rock.png");
        }
        else if (dbPlayer2Choice === 'p') {
            playerChoiceImage.attr("src","./assets/images/paper.png");
        }
        else if (dbPlayer2Choice === 'p') {
            playerChoiceImage.attr("src","./assets/images/scissors.png");
        }
        else {
            playerChoiceImage.attr("src","./assets/images/question.png");
            dbPlayer2Choice=null;
        }
        checkThrows();
    }
});

function setPlayerChoice(playerChoice) {
    if (playerNumber === 1) {
        database.ref("/player1-choice").set(playerChoice);
    }
    else if (playerNumber === 2) {
        database.ref("/player2-choice").set(playerChoice);
    }
}

// Initiate the game between the first two players in the queue.
function initateNewGame() {
    dbGameRound.set(1);
    dbRefPlayer1Choice.set("");
    dbRefPlayer2Choice.set("");

    player1rec = dbRefWaitList.unshift();
    player2rec = dbRefWaitList.unshift();
    console.log(player1rec);
    console.log(player2rec);
}