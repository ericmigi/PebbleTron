// Welcome to PebbleJS!
//
// This is where you write your app.

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');


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
var fav1 = {name: '', id: '', list: '1', state: '',};
var fav2 = {name: '', id: '', list: '2', state: '',};


// menu setup functions

var loadState = function() {
  console.log('Loading State!'); 
  var savedFav1 = localStorage.getItem("fav1");
  if (savedFav1 !== null) {
    fav1 = JSON.parse(savedFav1);
  }
  var savedFav2 = localStorage.getItem("fav2");
  if (savedFav2 !== null) {
    fav2 = JSON.parse(savedFav2);
  }                
};

var saveState = function() {
  localStorage.setItem("fav1", JSON.stringify(fav1));
  localStorage.setItem("fav2", JSON.stringify(fav2));
};  

var deleteState = function() {
  lockList = [];
  fav1 = {name: '', id: '',};
  fav2 = {name: '', id: '',};
  localStorage.clear();
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
  });
};

// Control locks
var controlLock = function(lock, action) {
  var url = lockitronUrl + '/' + lock.id + '?' + accessToken + '&state=' + action;
  console.log("control lock url: " + lock.name);
  ajax({ url: url, type: 'json', method: 'put'}, function(data) {
    console.log("data.state: " + data.state);
    if(lock.list == '1'){
      fav1.state = data.state;
      menu.item(0,0, {title: fav1.name, subtitle: fav1.state + "ed" });
    }
    if(lock.list == '2'){
      fav2.state = data.state;
      menu.item(0,1, {title: fav2.name, subtitle: fav2.state + "ed" });
    }
    
  });
};


                
// starting pebble.js                

console.log("accessToken = " + accessToken);
console.log("fav1 = " + fav1.name);
console.log("fav2 = " + fav2.name);
loadState();
console.log("accessToken = " + accessToken);
console.log("fav1 = " + fav1.name);
console.log("fav2 = " + fav2.name);

var menu = new UI.Menu();
menu.items(0, [ { title: fav1.name, subtitle: fav2.state + "ed" }, { title: fav2.name, subtitle: fav2.state + "ed" }, { title: 'Getting Locklist' }, { title: 'toggle favourite' }, {title: 'Delete locks'}, {title: 'print locklist'}, {title: 'select fav1'},{title: 'select fav2'} ]);
menu.show();


menu.on('select', function(e) {
  console.log("Menu item clicked: " + e.item);
  if (e.item == '0') {
    console.log( "favourite lock: " + fav1.name + ' id: ' + fav1.id);
    controlLock( fav1, 'toggle');
  }  
  if (e.item == '1') {
    console.log( "favourite lock: " + fav2.name + ' id: ' + fav2.id);
    controlLock( fav2, 'toggle');
  }  
  if (e.item == '2') {
    requestLocks();
  }
  if (e.item == '3') {
    console.log( "favourite lock: " + fav1.name + ' id: ' + fav1.id);
    controlLock( fav1, 'toggle');
  }
  if (e.item == '4') {
    deleteState();
  }
  if (e.item == '5') {
    for (var i = 0, ii = lockList.length; i < ii; ++i) {
      lockList[i] = {
        name: lockList[i].name,
        id: lockList[i].id,
      };
    console.log("lock name: " + lockList[i].name + " lock id: " + lockList[i].id);
    }
  }
  if (e.item == '6') {
    console.log('throwing up fMenu');
    
   var fMenu = new UI.Menu({ sections: [{ items: [] }] });
    for (var y = 0, yy = lockList.length; y < yy; ++y) {
    console.log( "title: " + lockList[y].name);
      fMenu.item(0, y, {title: lockList[y].name});
    }
    fMenu.show();
    fMenu.on('select', function(e) {
      fav1.name = lockList[e.item].name;
      fav1.id = lockList[e.item].id;
      fav1.state = lockList[e.item].state;
      console.log( 'fav1 lock: ' + fav1.name);
      
      fMenu.hide();
      saveState();
    });
  }
  if (e.item == '7') {
    console.log('throwing up f2Menu');
    
   var f2Menu = new UI.Menu({ sections: [{ items: [] }] });
    for (var y = 0, yy = lockList.length; y < yy; ++y) {
    console.log( "title: " + lockList[y].name);
      f2Menu.item(0, y, {title: lockList[y].name});
    }
    f2Menu.show();
    f2Menu.on('select', function(e) {
      fav2.name = lockList[e.item].name;
      fav2.id = lockList[e.item].id;
      fav2.state = lockList[e.item].state;
      console.log( 'fav2 lock: ' + fav2.name);
      
      f2Menu.hide();
      saveState();
    });
  }
         
});

var Accel = require('ui/accel');
Accel.init();
Accel.on('tap', function(e) {
  console.log('Tap event on axis: ' + e.axis + ' and direction: ' + e.direction);
  if (e.axis === 'x'){
    controlLock( fav1, 'unlock');
  }
  if (e.axis === 'y'){
    controlLock( fav1, 'lock');
  }
  
  if (e.axis === 'z' && e.direction > 0 ){
    controlLock( fav1, 'unlock');
  }
  if (e.axis === 'z' && e.direction < 0 ){
    controlLock( fav1, 'lock');
  } 
});
   

