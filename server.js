// =============== DEPENDENCIES ================
var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

// =============== MIDDLEWARE ===================
app.use(express.static('public'));

// ============== CONTROLLERS ===================
// var loginController = require('./controllers/logincontroller.js');
// app.use('/login', loginController);

// =============== LISTENER =====================
app.listen(port, function() {
  console.log('listening on port: ' + port);
});
