//Global variables:
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

function testRedir(){
	window.location.href = "C:/Users/eiffer/OneDrive/Fun Stuff/Loop take 3/views/category.html";
}


function confirmChars(){
	var input_names = [];
	input_names.push(document.getElementById("name1").value);
	input_names.push(document.getElementById("name2").value);
	input_names.push(document.getElementById("name3").value);
	input_names.push(document.getElementById("name4").value);
	input_names.push(document.getElementById("name5").value);
	input_names.push(document.getElementById("name6").value);
	input_names.push(document.getElementById("name7").value);
	input_names.push(document.getElementById("name8").value);
	input_names.push(document.getElementById("name9").value);
	input_names.push(document.getElementById("name10").value);
	input_names.push(document.getElementById("name11").value);


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
	document.write(players[0].name);
	//Checks names for duplicates
	let status = check_names(players);
	//Redirect to category selection
	if (status == "Good"){
		window.location.href = "C:/Users/eiffer/OneDrive/Fun Stuff/Loop take 3/views/category.html";
	} 
}
