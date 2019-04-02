// Holds the code that deals with the game rounds..

var dbRefGameRound = database.ref("/round");
var dbGameRound = 0;

var dbRefGameStarted = database.ref("/game-started");

var dbRefRoundStarted = database.ref("/round-started");
var dbRoundStarted=false;

var dbRefRoundComplete = database.ref("/round-complete");
var dbRoundComplete=false;

// This is a toggle...  Almost always will be false.
dbRefRoundComplete.on("value",function(snap) {
    //console.log(dbRefRoundComplete);
    //console.log("dbRefRoundComplete",snap.val());

    if (snap.val() && snap.val() == "true") {        
        dbRefRoundStarted.set("false");
        dbRefRoundComplete.set("false");
        checkThrows();
    }
    else {
        dbRoundComplete == false;
    }
});

// Used to keep things from happening that might affect a round in progress.
dbRefRoundStarted.on("value",function(snap) {
    //console.log("dbRefRoundStarted",snap.val());
    if (snap.val() && snap.val() == "true") {
        dbRoundStarted=true;
        if (myPlayerNumber == 1 || myPlayerNumber == 2) {
            startRoundTimer();
        }
    }
    else {
        dbRoundStarted = false;
    }
});

dbRefGameRound.on("value",function(snap) {
    if (snap.val()) {
        dbGameRound = parseInt(snap.val());
        if (myPlayerNumber == 1 || myPlayerNumber == 2) {
            $("#sub-header").text("Round: " + dbGameRound); 
        }
    }
    else {
        dbGameRound = 0;
    }
});

// Start the next round
function startNextRound() {
    console.log("startNextRound");
    if (dbGameRound >= 5) {
        selectReplacementPlayer();
        return;
    }

    if (!dbRoundStarted) {
        if (myPlayerNumber == 1) {
            dbGameRound++;
            dbRefGameRound.set(dbGameRound);
        }        
        dbRefRoundStarted.set("true");
        dbRefRoundComplete.set("false");
    }
    displayRound();
}

// End a round
function endCurrentRound() {
    //console.log("round ended");
    //console.log("dbRoundStarted",dbRoundStarted);
    if (dbRoundStarted) {
        console.log("Set round complete.");
        dbRefRoundComplete.set("true");
    }
}

function checkThrows() {
    //console.log("checkThrows");

    var winner = 0;

    if (dbPlayer1Choice == "?" && dbPlayer2Choice == "?") {
        // both players timed out.
        addSystemMessage("Both players timed out.  Starting new game.");
        startNewGame();
    }
    else if (dbPlayer1Choice == "?") {
        addSystemMessage("Player 1 timed out.");
        winner = 2;
    }
    else if (dbPlayer2Choice == "?") {
        addSystemMessage("Player 2 timed out.");
        winner = 1;
    }
    else {
        // The matrix determines the winner...
        //console.log("Player 1 choice",dbPlayer1Choice);
        //console.log("Player 2 choice",dbPlayer2Choice);
        //console.log("Player 1 index",gameChoices.indexOf(dbPlayer1Choice));
        //onsole.log("Player 2 index",gameChoices.indexOf(dbPlayer2Choice));
        var player1Index = gameChoices.indexOf(dbPlayer1Choice);
        var player2Index = gameChoices.indexOf(dbPlayer2Choice);
        winner = gameMatrix[player1Index][player2Index];

        //console.log("Winner",winner);
        //if (winner == 1) {
        //    console.log("Should be: ",dbPlayer1Name);
        //}
        //else {
        //    console.log("Should be: ",dbPlayer2Name);
        //}
    }

    console.log("Winner",winner);
    if (winner === 0) {
        addSystemMessage("Tie. Retrying round.");
        startNextRound("reset");
    }
    else {
         endRound(winner);
    }
}