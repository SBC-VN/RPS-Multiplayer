
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
var dbRefPlayer1Start = database.ref("/player1-start");
var dbRefPlayer2Start = database.ref("/player2-start");
var dbRefPlayer1Choice = database.ref("/player1-choice");
var dbRefPlayer2Choice = database.ref("/player2-choice");
var dbRefUsersList = database.ref("/users");
var dbRefWaitList = database.ref("/wait-list");

var isPlayerRegistered = false;
var dbConnectionObject = null;
var dbPlayerName = null;

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
        displayLobby(playerType);
    });
}

function dbAddPlayerToQueue() {
    console.log("Add player to queue");
    if (isPlayerRegistered) {
        var newKey = 1;
        dbRefWaitList.once("value",function(snap) {
            if (snap.val()) {
                var waitArray = Object.keys(snap.val());
                newKey = waitArray.length + 1;
            }

            database.ref("/wait-list/" + newKey).set(dbPlayerName);
        });
    }
}
