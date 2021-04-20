```javascript
const FFJDB = require('database.js');
let database = new FFJDB(<file>[, force]); //"File" is a String to a path. "Force", default: false, indicates if subdirectories should be created when necessary and if relative paths should be resolved to the node-working directory.

var object = ['Hello', 'world', '!'];

databse.set("test", {"cool": object}); // sets key (String) to any value. You can access "sub-objects" by adding a ".".
database.get("test.cool")[0]; // gets value with cooresponding to key.
database.unset("test"); // unsets key.
```

When first accessing a database it tries to load the requested file into cache, behaving according to the value of "force".
After this every manipulation is done on the cached object which, when updated, is also written back to the file asynchronous.
