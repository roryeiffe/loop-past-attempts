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

//define these constants, because they will be used for the entire game
//array of player objects and counter used to iterate through 
let players;
let player_counter;
//name/index of player who is out of the loop.
let out_of_loop;
let out_of_loop_index;
//strings denoting the answer and category respectively
let answer;
let category;
//array of questions and counter to iterate through:
let questions;
let question_counter;
//bank will store the list of answer for the round:
let bank;
//input_names will store the strings that will be displayed
let input_names = [];


//This function checks the list of names and
//returns an error message if there are more than
//3 people or if there are duplicate names
function check_names(names){
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

//Initializes the "answer" member variable of the player 
//object to either the answer or "You are out of the loop!"
function init_players(answer, out_of_loop){
		for(let i = 0; i < players.length; i ++){
			console.log(out_of_loop_index);
			if(i == out_of_loop_index){
				players[i].answer = "You are out of the loop!";
				players[i].inloop = false;
			} 
			else players[i].answer = answer;
		}
}

//Takes a list of items and trims them of white space.
function remove_white_space(L){
	for(let i = 0; i < L.length; i ++) L[i] = L[i].trim();
	return L;
}

//Takes a big list of something (questions/answers) and returns 
// a small subset to be used as the choices
function get_subset(L, number){
	let subset = [];
	while(subset.length < number){
		let index = Math.floor(Math.random()*L.length)
		let choice = L[index];
		if(choice != "") subset.push(choice);
		L[index] = "";
	}
	return subset;
}

//This function takes in a category and picks a random answer,
//as well as randomly choosing a player who is out of the loop
//It then updates players accordingly by assigning either the
//answer or the phrase "Out of the Loop" to the answer field.
function get_answers(category){
	//Retrieve player names from the array of players
	if(category == "players"){
		bank = [];
		for(let i = 0; i < players.length; i ++){
			bank.push(players[i].name);
		}
		answer = bank[Math.floor(Math.random()*bank.length)];
		out_of_loop_index = Math.floor(Math.random()*players.length);
    	out_of_loop = players[out_of_loop_index].name;
    	init_players(answer,out_of_loop);
	}
	//Otherwise, read in answers from text files:
	else{
		path = "resources/" + category + ".txt";
		x = fs.readFile(path, (err, data) => {
    	if (err) throw err;  
    		let answers = remove_white_space(data.toString().split("\r"));
			bank = get_subset(answers, 6);
			answer = bank[Math.floor(Math.random()*bank.length)];
			out_of_loop_index = Math.floor(Math.random()*players.length);
    		out_of_loop = players[out_of_loop_index].name;
    		init_players(answer,out_of_loop);
		})
	}
	
	
}

//this function returns an array of questions to be asked,
//its size is dependent on how many players there are:
function get_questions(){
	path = "resources/" + category + "_questions.txt";
	x = fs.readFile(path, (err, data) => { 
    if (err) throw err;  
    	let all_questions = remove_white_space(data.toString().split("\r"));
    	questions = get_subset(all_questions, players.length);
    	let pairs = get_pairs();
    	while(!check_pairs(pairs)) pairs = get_pairs();
    	for(let i = 0; i < questions.length; i ++){
    		questions[i] = pairs[i].first + " ask " + pairs[i].second + ": " + questions[i];
    	}
	})
}

//Randomly creates pairs of askers to askees. Returns a list of pair objects where
//the first item is the name of the asker and the second item is the name of the askee:
function get_pairs(){
	let askers = [];
	let askees = [];
	//Fill up askers and askees with random, unique numbers from 0 to number of players
	while(askers.length < players.length){
		let rand_num = Math.floor(Math.random() * Math.floor(players.length));
		if (!askers.includes(rand_num)) askers.push(rand_num);
	}
	while(askees.length < players.length){
		let rand_num = Math.floor(Math.random() * Math.floor(players.length));
		if (!askees.includes(rand_num)) askees.push(rand_num);
	}
	let pairs = [];
	//Then, make pairs
	for(let i = 0; i < players.length; i ++){
		var pair = {
			"first": players[askers[i]].name,
			"second": players[askees[i]].name
		};
		pairs.push(pair);
	}
	return pairs;
}

//returns true if there does not exist a pair of the same name repeating:
//eg: Rory ask Rory
function check_pairs (pairs){
	for(let i = 0; i < pairs.length; i ++){
		if(pairs[i].first == pairs[i].second) return false;
	}
	return true;
}

function wait(x){
	let sum = 0;
	for(let i = 0; i < x*1000000; i ++){
		sum += i;
	}
}

//Based on votes, assign points:
function assign_scores(){
	//keeps track of how many inner loopers correctly guessed
	//who was out of the loop.
	let numright = 0;
	for(let i = 0; i < players.length; i ++){
		if(players[i].inloop){
			//Couts how many inner loops guessed correctly
			if(players[i].vote == out_of_loop){
				players[i].current_score += 25;
				numright ++;
			}
		}
		else{
			//If out of loop gets it right
			if(players[i].vote == answer){
				players[i].current_score += 100;
			}
		}
	}
	//Loop through and award inner loops for guessing correctly:
	if(numright > (players.length/2)){
		for(let i = 0; i < players.length; i ++){
			if(players[i].inloop) players[i].current_score += 100;
		}
	}
	//Reward out of looper for getting caught.
	else{
		players[out_of_loop_index].current_score += 50;
	}
}

function return_output(){ 
	string = "";
	for(let i = 0; i< players.length; i ++ ){
		players[i].total += players[i].current_score;
		string += players[i].name + " got " + players[i].current_score + 
		" this round for a total of " + players[i].total + "         ";
	}
	return string;
}

function reset_round(){
	for(let i = 0; i < players.size; i ++){
		players[i].current_score = 0;
		players[i].vote = "";
		players[i].answer = "";
		players[i].inloop = true;
	}
	player_counter = 0;
	bank = [];
	question_counter = 0;
}

//Start by going to index:
app.get('/', function (req, res) {
  res.redirect("views/index.html");
})

//Gets the names from the form
app.post('/name', async (req, res) => {
	input_names.push(req.body.name1);
	input_names.push(req.body.name2);
	input_names.push(req.body.name3);
	input_names.push(req.body.name4);
	input_names.push(req.body.name5);
	input_names.push(req.body.name6);
	input_names.push(req.body.name7);
	input_names.push(req.body.name8);

	// input_names = ["rory","will","jack","","","","",""];

	//Filters blank submission spots
	players = [];
	for(let i = 0; i < input_names.length; i ++){
		if(input_names[i] != ""){
			var player = {
				name: input_names[i],
				answer: "",
				vote: "",
				current_score:0,
				total:0,
				inloop:true
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

app.post('/transition', async(req,res) => {
	reset_round();
	res.redirect('views/category.html');
})

//Pick category
app.post('/pickCat', async(req, res) => {
	//fetch value from drop down menu
	category = req.body.selectpicker;
	//Initiazlie global reveal counter which
	//iterates through list of answers and
	//prints them
	get_answers(category);
	console.log(bank);
	get_questions();
	player_counter = 0;
	//Transition page allows answers to be initialized before
	//we try to access them:
	res.redirect("views/transition.html");
})

//Reveal the answer until all players are notified, then move on to question time
app.post('/reveal', async(req, res) =>{
	if(player_counter < players.length){
		res.render('reveal', { name : players[player_counter].name, answer: players[player_counter].answer});
		player_counter ++;
	}
	else{
		question_counter = 1;
		wait(10);
		//Display the first question:
		res.render('question', { title: "Question time:", question: questions[0]});
	}
})

//Display questions for players to ask each other
app.post('/question', async(req, res)=> {
	//Display all the questions:
	if(question_counter < questions.length){
		res.render('question', {title: "Question time:", question: questions[question_counter]});
		question_counter ++;
	}
	//Then redirect to voting:
	else{
		res.redirect("views/vote.html");	
	}
})

//Initialize voting by rendering first voting page (We have to render before we can select from choices)
app.post('/vote_player_init', async(req,res)=>{
	player_counter = 0;
	//Render the voting page with all of the player names:
	res.render("vote_player", {name:players[0].name,
		option0:input_names[0],option1:input_names[1],option2:input_names[2],
		option3:input_names[3],option4:input_names[4],option5:input_names[5],
		option6:input_names[6],option7:input_names[7]});
})

//Vote for who is out of the loop:
app.post('/vote_player', async(req,res)=>{
	//pick from pre-rendered page
	let index = req.body.selectpicker;
	if(index != null && index < players.length){
		//Then, update list of players
		vote = players[index].name;
		players[player_counter].vote = vote;
		//Update player counter for next time, but only
		//if they picked a valid (non-empty) option:
		if(vote != "" && vote != players[player_counter].name) player_counter++;
	}
	//since the rendering is a little funky (having to render before and then voting in the next iteration), we loop one less time then expected:
	if (player_counter < players.length){
		console.log(player_counter);
		res.render("vote_player", {name:players[player_counter].name,
			option0:input_names[0],option1:input_names[1],option2:input_names[2],
			option3:input_names[3],option4:input_names[4],option5:input_names[5],
			option6:input_names[6],option7:input_names[7]});
		wait(10);
	}
	else{
		//Render the voting page for the out of the looper to pick:
		res.render('vote_answer', {name: players[out_of_loop_index].name, option0:bank[0], option1:bank[1], option2:bank[2], 
			option3:bank[3], option4:bank[4], option5:bank[5],});
	}
	console.log(input_names);
	
})

app.post('/vote_answer', async(req,res)=>{
	//pick the index
	let index = req.body.selectpicker;
	players[out_of_loop_index].vote = bank[index];
	assign_scores();
	s = return_output();
	res.render("results", {output:s});
	console.log(players);
})

app.get('/',function(req,res){ 
	res.set({ 
		'Access-control-Allow-Origin': '*'
		}); 
	return res.redirect('views/category.html');
	}).listen(3000,'0.0.0.0', function(){
		console.log("Listening to port " + 3000);
}) 
