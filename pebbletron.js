// Welcome to PebbleJS!
//
// This is where you write your app.

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');
var WindowStack = require('ui/windowstack');

var myfirstwebview = function(){
  Pebble.openURL('https://api.lockitron.com/oauth/authorize?client_id=58892dfb782b1e9afebae1b945772c23f323d257de2d1c977c120643d71cfc82&response_type=token&redirect_uri=pebblejs://close');
};

Pebble.addEventListener('showConfiguration', myfirstwebview); 

var accessToken = localStorage.getItem("accessToken");

Pebble.addEventListener("webviewclosed",
  function(e) {
    if (e.response === 'CANCELLED') { return; }
    console.log("Configuration window returned: " + e.response);
    accessToken = e.response.split("&")[0];
    console.log("hey look it's an accessToken: " + accessToken + "zero");
    localStorage.setItem("accessToken", accessToken);
  }
);

var lockitronUrl = 'https://api.lockitron.com/v2/locks';
var lockList = [];
var favLocks = [];

// menu setup functions

var loadState = function() {
  console.log('Loading State!'); 
  var savedFavLocks = localStorage.getItem("favLocks");
  if (savedFavLocks !== null) {
    favLocks = JSON.parse(savedFavLocks);
  }
};

var saveState = function() {
  localStorage.setItem("favLocks", JSON.stringify(favLocks));
};  

var deleteState = function() {
  lockList = [];
  localStorage.removeItem("accessToken");
  localStorage.removeItem("savedFavLocks");
  while (WindowStack.top()) {
    WindowStack.pop(); 
  }
};

// get list of locks
var requestLocks = function() {
  console.log('requesting locks!');
  var url = lockitronUrl + "?" + accessToken;
  console.log("requesting locks url: " + url);
  
  ajax({ url: url, type: 'json', method: 'get'}, function(data) {
    lockList = [];
    console.log("data.length " + data.length);
    for (var i = 0, ii = data.length; i < ii; ++i) {
      lockList[i] = {
        name: data[i].name,
        id: data[i].id,
        state: data[i].state,
      };
    console.log("lock name: " + lockList[i].name + " lock id: " + lockList[i].id);
    }
  }, function(error) {
    console.log('The ajax request failed: ' + JSON.stringify(error));
    var card = new UI.Card({ 
      title: 'Error',
      body: JSON.stringify(error),
      scrollable: true
    });
    card.show();  
  }
  );
};

// Control locks
var controlLock = function(lock, action, menu, numberInList) {
  var url = lockitronUrl + '/' + lock.id + '?' + accessToken + '&state=' + action;
  console.log("trying to " + action + " lock: " + lock.name);
  ajax({ url: url, type: 'json', method: 'put'}, function(data) {
    console.log("data.state: " + data.state);
    menu.item(0, numberInList, { title: lock.name, subtitle: data.state + "ed"});
    Vibe.vibrate('short'); 
  }, function(error) {
    console.log('The ajax request failed: ' + JSON.stringify(error));
    Vibe.vibrate('long');
    var card = new UI.Card({ 
      title: error.status,
      body: error.message,
      scrollable: true
    });
    card.show();  
  }
  );
};


                
// starting pebble.js                

loadState();

if (accessToken === null) {
  var card = new UI.Card({ 
    title: 'Error',
     body: "Please log-in to your Lockitron account: MyPebble->Pebbletron->Settings",
     scrollable: true
    });
  card.show();  
}
else {
  console.log("accessToken found, opening mainMenu");
  
  var mainMenu = new UI.Menu({ sections: [{ title: 'Locks'}, { title: 'Menu'} ]});
  
  for (var i = 0, ii = favLocks.length; i < ii; ++i) {
    mainMenu.item(0, i, {title: favLocks[i].name, subtitle: favLocks[i].state + "ed"});
  }
  mainMenu.items(1, [ { title: 'All Locks'}, { title: 'Settings'} ]);
  mainMenu.show();
 
  requestLocks();

  mainMenu.on('select', function(e) {
    console.log("Menu section clicked: " + e.section + " item: " + e.item);
    console.log("e: " + JSON.stringify(e));
    if (e.section == '0') {
      controlLock ( favLocks[e.item], 'toggle', mainMenu, e.item);     
    }
    if (e.section == '1') {
      if (e.item == '0') {
        console.log('throwing up allLocks');
        var allLocksMenu = new UI.Menu({ sections: [{ items: [] }] });
        for (var y = 0, yy = lockList.length; y < yy; ++y) {
        console.log( "title: " + lockList[y].name);
          allLocksMenu.item(0, y, {title: lockList[y].name, subtitle: lockList[y].state + "ed"});
        }
        allLocksMenu.show();
        allLocksMenu.on('select', function(e) {
          controlLock( lockList[e.item], 'toggle', allLocksMenu, e.item);
          console.log( 'Toggled lock: ' + lockList[e.item].name);        
        });
      }
    
      if (e.item == '1') {
        console.log( "opening Settings");
        var settingsMenu = new UI.Menu();
        settingsMenu.items(0, [ { title: 'Select Favourites'}, { title: 'Delete Favourites'}, { title: 'Delete Settings'} ]);
        settingsMenu.show();
        settingsMenu.on('select', function(e) {
          if (e.item == '0') {
            console.log('throwing up favourites');
            
            var favMenu = new UI.Menu({ sections: [{ items: [] }] });
            for (var i = 0, ii = lockList.length; i < ii; ++i) {
            console.log( "title: " + lockList[i].name);
              favMenu.item(0, i, {title: lockList[i].name});
            }
            favMenu.show();
            favMenu.on('select', function(e) {
              favLocks.push(lockList[e.item]);
              console.log( 'adding new lock to favLocks: ' + lockList[e.item].name);
              saveState();
            });
          }
          if (e.item == '1') {
            favLocks = [];
            saveState();
          }
          if (e.item == '2') {
            deleteState();
          }
        });
      }
    }     
  });
}              

Accel.init();
Accel.on('tap', function(e) {
  console.log('Tap event on axis: ' + e.axis + ' and direction: ' + e.direction);
  if (e.axis === 'x'){
    controlLock( favLocks[0], 'unlock', mainMenu, 0);
  }
  if (e.axis === 'y'){
    controlLock( favLocks[0], 'lock', mainMenu, 0);
  }
  
  if (e.axis === 'z' && e.direction > 0 ){
    controlLock( favLocks[0], 'unlock', mainMenu, 0);
  }
  if (e.axis === 'z' && e.direction < 0 ){
    controlLock( favLocks[0], 'lock', mainMenu, 0);
  } 
});
   

