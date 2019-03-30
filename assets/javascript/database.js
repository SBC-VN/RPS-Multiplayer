
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

// Keep check if we are connected.
var dbIsConnected = database.ref(".info/connected");

// We will have a list of users that are connected.
// Each user keeps their own connection information handy.
var dbRefUsersList = database.ref("/users");
var dbConnectionObject = null;
var isPlayerRegistered = false;
var dbPlayerName = null;
var playerNumber = 0;

// One user is chosen to be the only one allowed to maintain the 
// 'critical section' tables - such as who is chosen to play next, etc.
var dbRefSuperUser = database.ref("/super-user");
var dbSuperUser = null;

// We will also have a queue of players hanging out in the lobby waiting to play.
// Each user is allowed to wait once - and will keep track of that.
var dbRefWaitList = database.ref("/wait-list");
var dbWaitListObject = null;

// Chat messages will be broadcast through the database.  Only the
// last chat will be stored - all the other messages will be local.
var dbRefMessages = database.ref("/messages");

//  Commonly used references.
var dbRefPlayer1 = database.ref("/player1");
var dbPlayer1 = null;

var dbRefPlayer2 = database.ref("/player2");
var dbPlayer2 = null;

var dbRefGameRound = database.ref("/round");
var dbGameRound = 0;
var dbRefPlayer1Start = database.ref("/player1-start");
var dbPlayer1Ready=false;
var dbRefPlayer2Start = database.ref("/player2-start");
var dbPlayer1Ready=false;

var dbRefPlayer1Choice = database.ref("/player1-choice");
var dbPlayer1Choice = null;
var dbRefPlayer2Choice = database.ref("/player2-choice");
var dbPlayer2Choice = null;

var playCheckRunning = false;

// Register the user's connection to the database.  
// Will attach a player name to it later.
dbIsConnected.on("value", function(snap) {
    if (snap.val()) {
        dbConnectionObject = dbRefUsersList.push("temp-name");
        dbConnectionObject.onDisconnect().remove();
    }
});

// The player queue will kindof function like the user list.
//  If a player disconnects, they will automatically be removed from the queue.
//  When a player gets into a game, they will remove their own record in the queue.
function dbAddPlayerToQueue() {
    if (isPlayerRegistered) {
        dbWaitListObject = dbRefWaitList.push(dbConnectionObject.key);
        dbWaitListObject.onDisconnect().remove();
    }
}

//
//  Super user concept: to eliminate the possibility of multiple users trying to update
//  'critical section' items (such as players) - we will designate some user as
//  'super user' and that will be the only user allowed to access those critial sections.
//
dbRefSuperUser.on("value", function(snap) {
    if (snap.val()) {
        dbSuperUser = snap.val();
        if (dbSuperUser == dbPlayerName) {
            if (!playCheckRunning) {
                setTimeout(playCheck,30000);
            }
        }
    }
    else if (isPlayerRegistered) {
        // If there's no super user, make the current user it..
        dbRefSuperUser.set(dbPlayerName);
    }
});

function playCheck() {
    if (dbPlayerName == dbSuperUser) {
        if (dbPlayer1 == null && 
            dbPlayer2 == null) {
            console.log("PlayCheck Initiate Game");
            initateNewGame();
            setTimeout(playCheck,30000);
        }
        else {
            setTimeout(playCheck,60000);
        }
    }
}

// When a user leaves, need to clean up things.  
//   So, if they were playing - that's a 'rage quit' game over right there.
//   Or they may just be the 'senior user' in which case we'll need to pick someone else.
//
dbRefUsersList.on("value", function(snap) {
    if (snap.val()) {
        dbUserList = Object.values(snap.val());
        console.log(dbUserList);
        
        if (dbSuperUser == null || !dbUserList.includes(dbSuperUser)) {
            // Uh oh... senior user went away... Set first user as senior user
            
            if (dbUserList.length > 0) {
                dbRefSuperUser.set(dbUserList[0]);                
            }
            else if (dbPlayerName) {
                dbRefSuperUser.set(dbPlayerName);
            }
            else {
                console.log("No super user can be set");
                return;
            }
        }

        if (dbPlayer1 && !dbUserList.includes(dbPlayer1)) {
            // Player 1 left...
            dbRefMessages.set("[] Player 1 left game.");
            dbRefPlayer1.set("");
        }

        if (dbPlayer2 && !dbUserList.includes(dbPlayer2)) {
            // Player 1 left...
            dbRefMessages.set("[] Player 2 left game.");
            dbRefPlayer2.set("");
        }
    }
    else {
        // If the array in the forest changes, does it make a sound?
        dbUserList = [];
    }

    if (dbUserList.length < 2) {
        dbRefPlayer1.set("");
        dbRefPlayer1Choice.set("");
        dbRefPlayer2.set("");
        dbRefPlayer2Choice.set("");
    }
});

// Monitors the wait queue to start a game if there are two players waiting and no
// game in progress.  
// Only the super user will commence the game.
//
dbRefWaitList.on("value",function(snap) {    
    if (dbPlayerName == dbSuperUser && 
        dbPlayer1 == null && 
        dbPlayer2 == null) {
        if (snap.val() && Object.values(snap.val()).length >= 2) {
            initateNewGame();
        }
    }
});


// Adds the chat message to the chat display from the database..
dbRefMessages.on("value",function(snap) {
    $("#chat-display").append($("<div>").text(snap.val()));
});

// When player 1 is selected/changed updates the on-screen information.
dbRefPlayer1.on("value",function(snap) {
    if (snap.val())
    {
        dbPlayer1 = snap.val();
        if (dbPlayer1 === dbPlayerName) {
            playerNumber = 1;
            setPlayerDisplay(1);
            return;
        }
        else {
            var playerSection = $("#player-1-section");
            var playerName = playerSection.find("#player-name");
            playerName.text(dbPlayer1);
        }
    }
});

// When player 2 is selected/changed updates the on-screen information.
dbRefPlayer2.on("value",function(snap) {
    if (snap.val())
    {
        dbPlayer2 = snap.val();
        if (dbPlayer2 === dbPlayerName) {
            playerNumber = 2;
            setPlayerDisplay(2);
            return;
        }
        else {
            var $playerSection = $("#player-2-section");
            var $playerName = $playerSection.find("#player-name");
            $playerName.text(dbPlayer2);
        }
    }
});

// When player 1 updates their choice in the database it will show this in the lobby.
dbRefPlayer1Choice.on("value",function(snap) {
    console.log("Player1 choice",snap.val());
    if (!snap.val()) {
        dbPlayer1Choice = "";
    }
    else
    {
        dbPlayer1Choice = snap.val();

        if (playerNumber != 1)
        {
            var playerSection = $("#player-1-section");
            var playerChoiceImage = playerSection.find("#player-choice-img");        
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
            }
        }
        console.log("Player1 choice",dbPlayer1Choice);
        console.log("Player2 choice",dbPlayer2Choice);
        checkThrows();
    }
});

// When player 2 updates their choice in the database it will show this in the lobby.
dbRefPlayer2Choice.on("value",function(snap) {
    console.log("Player2 choice",snap.val());
    if (!snap.val()) {
        dbPlayer2Choice = "";
    }
    else
    {
        dbPlayer2Choice = snap.val();

        if (playerNumber != 2)
        {
            var playerSection = $("#player-2-section");
            var playerChoiceImage = playerSection.find("#player-choice-img");

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
            }
        }
        console.log("Player1 choice",dbPlayer1Choice);
        console.log("Player2 choice",dbPlayer2Choice);
        checkThrows();
    }
});