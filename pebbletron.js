console.log('Simply.js demo!');

var myfirstwebview = function(){
  Pebble.openURL('https://api.lockitron.com/oauth/authorize?client_id=58892dfb782b1e9afebae1b945772c23f323d257de2d1c977c120643d71cfc82&response_type=token&redirect_uri=pebblejs://close');
};

Pebble.addEventListener('showConfiguration', myfirstwebview); 

var accessToken = localStorage["accessToken"];

Pebble.addEventListener("webviewclosed",
  function(e) {
    console.log("Configuration window returned: " + e.response);
    accessToken = e.response.split("&")[0];
    console.log("hey look it's an accessToken: " + accessToken + "zero");
    localStorage["accessToken"] = accessToken;
  }
);
 

var lockitronUrl = 'https://api.lockitron.com/v1/locks';
var lockIndex = 0;
var lockId = '';
var lockList = [];

// menu setup functions

var loadState = function() {
  var savedLockList = localStorage.getItem('lockList');
  if (savedLockList !== null) {
    lockList = savedLockList;
  }
  var savedLockId = localStorage.getItem('lockId');
  if (savedLockId !== null) {
    lockId = savedLockId;
    updateLockIndex();
  }
};

var updateList = function() {
  var textList = [];
  for ( var i = 0, ii = lockList.length; i < ii; ++i ) {
    textList[i] = (i === lockIndex ? '> ' : '' ) + lockList[i].name;
  }
  simply.setText({ body: textList.join('\n') }, true);
};

var saveState = function() {
  localStorage.setItem('lockList', lockList);
  localStorage.setItem('lockId', lockList[lockIndex].id);
};  

var updateLockIndex = function() {
  for ( var i = 0, ii = lockList.length; i < ii; ++i ) {
    if (lockList[i].id === lockId) {
      lockIndex = i;
      return;
    }
  }
};


// Control locks
var requestLocks = function() {
  var url = lockitronUrl + "?" + accessToken;
  simply.setText({ subtitle: 'Refreshing...'}, true);

  ajax({ url: url, type: 'json', method: 'post'}, function(data) {
    lockList = [];
    for (var i = 0, ii = data.length; i < ii; ++i) {
      lockList[i] = {
        name: data[i].lock.name,
        id: data[i].lock.id,
      };
    }
    saveState();
    updateLockIndex();
    updateList();
  });
};

var controlLock = function(lock, action) {
  var url = lockitronUrl + '/' + lock.id + '/' + action + '?' + accessToken;
  simply.setText({ subtitle: 'Refreshing...'}, true);
  ajax({ url: url, type: 'json', method: 'post'}, function(data) {
    simply.setText( { subtitle: lock.name+ " " + action + 'ed'});
  });
};

   

// Simply.js functions

simply.on('singleClick', function(e) {
  if (e.button === 'up') {
    if (--lockIndex < 0) { lockIndex = lockList.length - 1; }
    updateList();
    saveState();
  } else if (e.button === 'down') {
    if (++lockIndex >= lockList.length) { lockIndex = 0; }
    updateList();
    saveState();
  }
  
}
);

simply.on('longClick', function(e) {
  console.log(util2.format('single clicked $button!', e));
  
  if (e.button === 'down') {
    controlLock( lockList[lockIndex], 'lock');
  }
  if (e.button === 'up') {
    controlLock( lockList[lockIndex], 'unlock');
    
  }  
});


// POST to Lockitron API
// ajax({ url: url, type: 'json', method: 'post'}, success, failure)

loadState();
requestLocks();

simply.begin();
