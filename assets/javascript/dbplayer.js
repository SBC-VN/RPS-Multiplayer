// This code block will handle player events.

// The player name set when a game starts.   Will be a trigger set by the 'senior'
// user (first in the user's queue) that tells the players to initiate the 'game connection'.
var dbRefPlayer1Name = database.ref("/player1-name");
var dbPlayer1Name = "";
var dbRefPlayer2Name = database.ref("/player2-name");
var dbPlayer2Name = "";

//  Game Connection.  This is really sort of a dead-man's switch.  Set by the player, 
//  if they disconnect - the object goes away and tells everyone (they left).
var myPlayerObject = null;
var dbRefPlayer1Connection = database.ref("/player1-connection");
var dbPlayer1Object = null;
var dbRefPlayer2Connection = database.ref("/player2-connection");
var dbPlayer2Object = null;

// Storage for player choices.
var dbRefPlayer1Choice = database.ref("/player1-choice");
var dbPlayer1Choice = "";
var dbRefPlayer2Choice = database.ref("/player2-choice");
var dbPlayer2Choice = "";

// Storage to keep track of player's won rounds.
var dbRefPlayer1Score = database.ref("/player1-score");
var dbPlayer1Score = 0;
var dbRefPlayer2Score = database.ref("/player2-score");
var dbPlayer2Score = 0;

// Someone has been selected as player 1, or they have left and the value should be cleared.
dbRefPlayer1Name.on("value",function(snap) {
    //console.log("dbRefPlayer1Name",snap.val());
    // If there's already a player 1 - just return.
    if (dbPlayer1Object) {
        return;
    }

    // If we've cleared a name, clear the internal.
    if (!snap.val()) {
        dbPlayer1Name = "";
    }
    else {
        // If we set a name - set the internal and see if it's us.  If it is, connect to the game.
        dbPlayer1Name = snap.val();
        if (dbPlayer1Name == myScreenName) {
            myPlayerNumber = 1;
            myPlayerObject = dbRefPlayer1Connection.push(myScreenName);
            myPlayerObject.onDisconnect().remove();
            dbRefPlayer1Choice.set("");
            setPlayerDisplay(1);
        }
    }
});

// Someone has been selected as player 2, or they have left and the value should be cleared.
dbRefPlayer2Name.on("value",function(snap) {
    //console.log("dbRefPlayer2Name",snap.val());
    // If there's already a player 2 - just return.
    if (dbPlayer2Object) {
        return;
    }

    // If we've cleared a name, clear the internal.
    if (!snap.val()) {
        dbPlayer2Name = "";
    }
    else {
        // If we set a name - set the internal and see if it's us.  If it is, connect to the game.
        dbPlayer2Name = snap.val();
        if (dbPlayer2Name == myScreenName) {
            myPlayerNumber = 2;
            myPlayerObject = dbRefPlayer2Connection.push(myScreenName);
            myPlayerObject.onDisconnect().remove();
            // Set my choice to nothing.
            dbRefPlayer2Choice.set("");
            setPlayerDisplay(2);
        }
    }
});

// Player 1 connection changed.
dbRefPlayer1Connection.on("value",function(snap) {
    //console.log("dbRefPlayer1Connection",snap.val());
    if (!snap.val()) {
        // Player has disconnected!!!
        if (dbPlayer1Object) {
            dbPlayer1Object = null;
            addSystemMessage("Player 1 disconnected");
            dbRefPlayer1Name.set("");
            dbRefRoundStarted.set("false");
        }        
    }
    else {
        dbPlayer1Object = snap.val();
        addSystemMessage("Player 1 connected: " + Object.values(snap.val())[0]);
        // If I'm already connected - start the next round..
        if (myPlayerNumber == 2 && dbPlayer2Object) {
            startNextRound();
        }
    }
});

// Player 2 connection changed.
dbRefPlayer2Connection.on("value",function(snap) {
    //console.log("dbRefPlayer1Connection",snap.val());
    if (!snap.val()) {
        // Player has disconnected!!!
        if (dbPlayer1Object) {
            dbPlayer2Object = null;
            addSystemMessage("Player 2 disconnected");
            dbRefPlayer2Name.set("");
            dbRefRoundStarted.set("false");
        }
    }
    else {
        dbPlayer2Object = snap.val();
        addSystemMessage("Player 2 connected: " + Object.values(snap.val())[0]);
        // If I'm already connected - start the next round..
        if (myPlayerNumber == 1 && dbPlayer1Object) {
            startNextRound();
        }
    }
});

// Player 1's choice has changed.  2 cases - reset to blank, or made.
dbRefPlayer1Choice.on("value",function(snap) {
    //console.log("dbRefPlayer1Choice",snap.val());
    //console.log("Player number",myPlayerNumber);
    if (!snap.val()) {
        // Reset.
        dbPlayer1Choice = "";
    }
    else {
        dbPlayer1Choice = snap.val();
        if (myPlayerNumber == 1 && dbPlayer2Choice) {
            // Player 2 has already made a choice - so it's the end of the round.
            // If I'm player 1, then make this the end of the round.
            endCurrentRound();
        }
    }

    if (myPlayerNumber == 0) {
        //  If I'm a spectator I get to see the choice the player has made even
        //  before the end of the round.   Or see the reset...
        displayThrow(1,dbPlayer1Choice);
    }     
});

// Player 2's choice has changed.  2 cases - reset to blank, or made.
dbRefPlayer2Choice.on("value",function(snap) {
    //console.log("dbRefPlayer1Choice",snap.val());
    //console.log("Player number",myPlayerNumber);
    if (!snap.val()) {
        // Reset.
        dbPlayer2Choice = "";
    }
    else {
        dbPlayer2Choice = snap.val();
        if (myPlayerNumber == 2 && dbPlayer1Choice) {
            // Player 1 has already made a choice - so it's the end of the round.
            // If I'm player 2, then make this the end of the round.
            endCurrentRound();
        }
    }

    if (myPlayerNumber == 0) {
        //  If I'm a spectator I get to see the choice the player has made even
        //  before the end of the round.   Or see the reset...
        displayThrow(2,dbPlayer2Choice);
    }     
});

function setPlayerChoice(choice) {
    //console.log("setPlayerChoice",choice);
    //console.log("Player number",myPlayerNumber);
    if (myPlayerNumber == 1) {
        dbRefPlayer1Choice.set(choice);
    }
    else if (myPlayerNumber == 2) {
        dbRefPlayer2Choice.set(choice);
    }
}

function selectReplacementPlayer() {
    if (myPlayerObject) {
        myPlayerObject.remove();
        setSpectatorDisplay();
        endGame(myPlayerNumber);
    }
}