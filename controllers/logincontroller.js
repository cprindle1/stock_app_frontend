var express = require('express');
var router = express.Router();


router.post('/', function(req, res) {
  res.json('good');


});

// create new record
router.post('/register', function(req, res) {

});

module.exports = router;
