PebbleTron
==========

Use Pebble to control your Lockitron! Building using Pebble.JS: https://github.com/pebble/pebblejs

To build:
- go to https://cloudpebble.net
- create a new project with the Pebble.js template
- in 'Settings' for the project, check off 'Configurable'
- copy pebbletron.js into Cloudpebble app.js
- build and enjoy!

Please generate your own Lockitron app key at: https://api.lockitron.com/v2/documentation

Download this app on the Pebble appstore:
https://apps.getpebble.com/applications/5394ad79e553f6ec0a000094

06/09/2014
known bugs:
- on-boot the mainMenu may hold the wrong state of each lock
- mainMenu does not refresh after changing new favLocks
- there's an extra window for some reason when you press back to close out
