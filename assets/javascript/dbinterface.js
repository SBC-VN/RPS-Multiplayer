//  Functions that are called by the game directly.   As opposed to things
//  that are driven by events in the database...


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

        if (!dbSuperUser || dbSuperUser === "temp-name") {
            // If there is no senior user - set this user as the senior.
              dbRefSuperUser.set(dbPlayerName);
        } 
        else if (dbPlayerName == dbSuperUser && !playCheckRunning) {
            setTimeout(playCheck,30000);
        }
        displayLobby(playerType);
    });
}

// Function to add a message to chat.
function addChatMessage(message) {
    msgText = "[" + dbPlayerName + "] " + message;
    dbRefMessages.set(msgText);
}

// When a player makes their choice.
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
    console.log("initiateNewGame");
    if (dbPlayerName == dbSuperUser)
    {
        console.log("initiateNewGame",dbPlayerName);
        dbRefGameRound.set(1);
        dbRefPlayer1Choice.set("");
        dbRefPlayer2Choice.set("");

        dbRefWaitList.once("value",function(snap) {
            if (snap.val()) {
                var waitValues = Object.values(snap.val());
                if (waitValues.length < 2) {
                    return;
                }

                var user1Key = waitValues[0];
                var user2Key = waitValues[1];

                database.ref("/users/" + user1Key).once("value",function(snap) {
                    if (snap.val()) {
                        var playerName = snap.val();
                        dbRefPlayer1.set(playerName);                      
                    }
                });

                database.ref("/users/" + user2Key).once("value",function(snap) {
                    if (snap.val()) {
                        var playerName = snap.val();
                        dbRefPlayer2.set(playerName);                      
                    }
                });
            }
        });
    }
}

function checkThrows() {
    // Convert relative (playerThrowChoice) to absolute (player 1/2)
    console.log("Check throw");
    console.log("Player 1",dbPlayer1Choice);
    console.log("Player 2",dbPlayer2Choice);
    // If one of the players hasn't made a choice yet - need to wait.
    if (dbPlayer1Choice && dbPlayer2Choice) {
        // The matrix determines the winner...     
        var winner = gameMatrix[gameChoices.indexOf(dbPlayer1Choice)][gameChoices.indexOf(dbPlayer2Choice)];
        if (winner === 0) {
            startRound("reset");
        }
        else {
            endRound(winner);
        }
    }
}