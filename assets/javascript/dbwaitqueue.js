// We will have a queue of players hanging out in the lobby waiting to play.
// Each user is allowed to wait once - and will keep track of that.
// This code file contains all the stuff needed to make that happen.
var dbWaitQueue = null;

var dbRefWaitList = database.ref("/wait-list");
var MyDbWaitListObject = null;

// The player queue will kindof function like the user list.
//  If a player disconnects, they will automatically be removed from the queue.
//  When a player gets into a game, they will remove their own record in the queue.
function dbAddMeToQueue() {
    if (isUserRegistered && !MyDbWaitListObject) {
        MyDbWaitListObject = dbRefWaitList.push(myScreenName);
        MyDbWaitListObject.onDisconnect().remove();
    }
}

// Monitors the wait queue to start a game if there are two players waiting and no
// game in progress.  
dbRefWaitList.on("value",function(snap) {
    if (!snap.val()) {
        dbWaitQueue = null;
    }
    else {
        dbWaitQueue = snap.val();
        // If there are enough players waiting and a game isn't started, start one.
        if (!dbGameStarted && Object.values(dbWaitQueue).length >= 2) {
            startNewGame();
        }
    }
});