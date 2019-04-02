// We will have a list of players connected to the game.
// This code block will handle that list.
var dbUserList = null;

// Keep check if we are connected.
var dbIsConnected = database.ref(".info/connected");

// We will have a list of users that are connected.
// Each user keeps their own connection information handy.
var dbRefUsersList = database.ref("/users");
var myDbConnectionObject = null;

// Variable holds my player number 0 - spectator, 1 & 2 - player.
var myPlayerNumber = 0;
var isUserRegistered = false;
var myScreenName = null;

// Register the user's connection to the database.  
// Will attach a player name to it later.
// Also setup the game matrix.
dbIsConnected.on("value", function(snap) {
    if (snap.val()) {
        dbConnectionObject = dbRefUsersList.push("temp-name");
        dbConnectionObject.onDisconnect().remove();
        setupGameMatrix();
    }
});

// The user connects to the game with a temporary name.  Once the select a name,
// see if the provided playerName is already in use.  If so, alert the user.
// if not - change the temp-name to the player's name and go to the lobby.
function dbSetPlayerName(screenName,playerType) {
    dbRefUsersList.once("value",function(snap) {
        if (snap.val()) {
            var userArray = Object.values(snap.val());
            if (userArray.includes(screenName)) {
                alert("Name is already in-use.  Please choose another.");
                return;
            }
        }
 
        dbConnectionObject.set(screenName);
        isUserRegistered=true;
        myScreenName=screenName;
        myPlayerNumber = 0;

        setSpectatorDisplay();
        if (playerType == "btn-play") {
            dbAddMeToQueue();
        }
    });
}

// Every time a user enters or leaves, check if we need to start a game.
// This should help prevent any 'hang' conditions for starting a game.
dbRefUsersList.on("value", function(snap) {
    if (snap.val())
    {
        dbUserList = snap.val();

        // If there are enough players waiting and a game isn't started, start one.
        if (dbWaitQueue && !dbGameStarted && Object.values(dbWaitQueue).length >= 2) {
            startNewGame();
        } 
        else if (Object.keys(dbUserList).length == 1) {
            // If there is only one user - reset everything.
            resetAll();
        }
    }
    else {
        resetAll();
    }
});

// Chat messages will be broadcast through the database.  Only the
// last chat will be stored - all the other messages will be local.
var dbRefMessages = database.ref("/messages");

// Function to add a message to chat.
function addChatMessage(message) {
    msgText = "[" + myScreenName + "] " + message;
    dbRefMessages.set(msgText);
}

// Function to add a system message to chat.
function addSystemMessage(message) {
    var systemMsg = $("<div>").text(message);
    systemMsg.css("color","grey");
    $("#chat-display").append(systemMsg);
}