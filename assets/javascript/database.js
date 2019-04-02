
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

var dbGameStarted=false;

// Start a new game
function startNewGame() {
    var userNames = Object.values(dbUserList);
    // Only allow 1 user to make changes here - whoever is first in the user list.
    if (myScreenName == userNames[0]) {
        // If there's not 2 players, assign them.
        if (!dbPlayer1Object || !dbPlayer2Object) {
            var waitingUsers = Object.values(dbWaitQueue);
            if (waitingUsers.length >= 2) {
                dbRefPlayer1Name.set(waitingUsers[0]);
                dbRefPlayer2Name.set(waitingUsers[1]);
            }

            // Stop processing.  Normal game start should kick in.
            return;
        }
        else if (!dbRoundStarted) {            
            startNextRound();
        }
    }
    setPlayerNames();  
}

function resetAll() {
    console.log("reset all");
    dbRefPlayer1Name.set("");
    dbRefPlayer2Name.set("");
    dbRefPlayer1Choice.set("");
    dbRefPlayer2Choice.set("");
    dbRefPlayer1Score.set("0");
    dbRefPlayer2Score.set("0");
    dbRefGameRound.set("0");
    dbRefGameStarted.set("false");
    dbRefRoundStarted.set("false");
    dbRefRoundComplete.set("false");
}

