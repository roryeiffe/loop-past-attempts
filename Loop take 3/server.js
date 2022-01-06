const express = require('express')
const bodyParser=require("body-parser");
const fs = require('fs');

//Setting up express
const app = express()
app.use(express.static(__dirname));


app.use(bodyParser.json());
app.use(express.static('pulib'));
app.use(bodyParser.urlencoded({
	extended: true
}));

app.set('views', './views');
app.set('view engine', 'pug');

//define these contants, because they will be used for the entire game
let players;
let out_of_loop;
let answer;

let player_counter;

let questions;
let question_counter;

//This function checks the list of names and
//returns an error message if there are more than
//3 people or if there are duplicate names
function check_names(names){
	console.log(names);
	if(names.length < 3) return "Must have more than 3 players!";
	for(let i = 0; i < names.length; i ++){
		for(let j = 0; j < names.length; j ++){
			if (i != j && names[i].name == names[j].name){
				return "Cannot have duplicate names!";
			} 
		}
	}
	return "Good";
}

//Takes a list of answers and trims them of white space.
function process_answers(L){
	for(let i = 0; i < L.length; i ++) L[i] = L[i].trim();
	return L;
}

//Takes a big list of answers and returns 
// a small subset to be used as the choices
function get_answer_bank(answers){
	bank = [];
	while(bank.length < 6){
		let index = Math.floor(Math.random()*answers.length)
		let choice = answers[index];
		if(choice != "") bank.push(choice);
		answers[index] = "";
	}
	return bank;
}

function init_players(answer, out_of_loop){
	console.log("the answer is: " + answer);
    	console.log(out_of_loop + " is out of the loop");
		for(let i = 0; i < players.length; i ++){
			if(players[i].name == out_of_loop) players[i].answer = "You are out of the loop!";
			else players[i].answer = answer;
		}
}

//This function takes in a category and picks a random answer,
//as well as randomly choosing a player who is out of the loop
//It then updates players accordingly by assigning either the
//answer or the phrase "Out of the Loop" to the answer field.
function get_answers(category){
	path = "resources/" + category + ".txt";
	x = fs.readFile(path, (err, data) => { 
    if (err) throw err;  
    	let answers = process_answers(data.toString().split("\r"));
    	bank = get_answer_bank(answers);
    	answer = bank[Math.floor(Math.random()*bank.length)];
    	out_of_loop = players[Math.floor(Math.random()*players.length)].name;
    	init_players(answer,out_of_loop);
    	console.log(bank + answer);
	})
}

app.get('/', function (req, res) {
  res.redirect("views/index.html");
})


app.get('/',function(req,res){ 
	res.set({ 
		'Access-control-Allow-Origin': '*'
		}); 
	return res.redirect('views/category.html');
	}).listen(3000,'0.0.0.0', function(){
		console.log("Listening to port " + 3000);
}) 

//Gets the names from the form
app.post('/name', async (req, res) => {
	var input_names = [];
	input_names.push(req.body.name1);
	input_names.push(req.body.name2);
	input_names.push(req.body.name3);
	input_names.push(req.body.name4);
	input_names.push(req.body.name5);
	input_names.push(req.body.name6);
	input_names.push(req.body.name7);
	input_names.push(req.body.name8);

	//Filters blank submission spots
	players = [];
	for(let i = 0; i < input_names.length; i ++){
		if(input_names[i] != ""){
			var player = {
				"name": input_names[i],
				"answer": ""
			};
			players.push(player);
		} 
	}
	//Checks names for duplicates
	let status = check_names(players);
	//Redirect to category selection
	if (status == "Good"){
		res.redirect('views/category.html');
	} 
	else{
		res.send(status);
	}
})

//Pick category
app.post('/pickCat', async(req, res) => {
	//fetch value from drop down menu
	category = req.body.selectpicker;
	//Initiazlie global reveal counter which
	//iterates through list of answers and
	//prints them to 
	get_answers(category);
	player_counter = 0;
	res.redirect("views/transition.html");
})

// app.post('/transition', async(req,res) => {

// })

app.post('/reveal', async(req, res) =>{
	if(player_counter < players.length){
		res.render('reveal', { name : players[player_counter].name, answer: players[player_counter].answer});
		player_counter ++;
	}
	else{
		questions = ["Yo", "Stup", "No way?"];
		question_counter = 1;
		res.render('question', { title: "ahhhhh!", question: questions[0]});
	}
})

app.post('/question', async(req, res)=> {
	if(question_counter < questions.length){
		res.render('question', {title: "ahhhh!", question: questions[question_counter]});
		question_counter ++;
	}
	else{
		res.render('index.html');
	}
})
