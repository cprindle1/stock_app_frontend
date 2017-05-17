var express = require('express');
var app = express();
var port = 8000;
// var port = process.env.PORT || 3001;

// =============== MIDDLEWARE ===================
app.use(express.static('public'));


var loginController = require('./controllers/logincontroller.js');
app.use('/login', loginController);


// =============== LISTENER =====================
app.listen(port, function() {
      console.log('listening on port: ' + port);
