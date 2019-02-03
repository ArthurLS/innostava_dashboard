/* routes.js */
/* Handles HTTP requests */
var express = require('express');
var router = express.Router();
var path = require('path');

var fs = require('fs');
/* GET home page. */

router.get('/json/:day/:interval',function(req,res){
	var day = req.params.day;
	var interval = req.params.interval;
	console.log("File asked: db_sum"+interval+"/"+day+".json");

	var filePath = "../db_sum"+interval+"/"+day+".json";
	fs.readFile(filePath, (err, data) => {
	    if (err) res.send("Date asked not available");
	    else res.send(data);
	});
});

router.get('/esm',function(req,res){
	console.log("Esm Responses asked");

	var filePath = "public/esm_responses.json";
	fs.readFile(filePath, (err, data) => {
	    if (err) res.send("File asked not available");
	    else res.send(data);
	});
});


// Request not handled
router.use(function(req, res, next) {
	res.status(404).send("Sorry, that route doesn't exist. Have a nice day though :)");
});

module.exports = router;
