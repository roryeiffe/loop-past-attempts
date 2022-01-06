from random import choice
import random
import os
import pathlib
import sys

#This function takes in input from the user
#and returns a list of all usernames. No duplicates
#allowed and a maximum of 9 players per game
#also make sure no names conflict withi existing
#files
def add_users():
    #forbidden_names contains the list of all text files
    #in order to avoid conflicts
    path = pathlib.Path('forbidden_names.txt')
    if not path.exists():
        print("Error, can't open file!!!")
        sys.exit()
    f = open("forbidden_names.txt", "r")
    forbidden_names = f.readlines()
    people = []
    while True:
        name = input("Enter name (type \"play\" to start): ")
        if name == "play":
            if len(people) < 3:
                print("Error, need 3 or more people to play!!!")
                continue;
            break
        if name in people:
            print("Name already taken")
            continue;
        if name + "\n" in forbidden_names:
            print("Invalid name")
            continue
        people.append(name)
        if len(people) >= 10:
            break
    return people
#This function picks a random person
#and makes them out of the loop. It reveals 
#the answer to the others. Once in a hundred games, 
#makes everyone out of the loop
def assign_roles(players, answer):
    seed = random.randint(0,100)
    wild_card = False
    if seed == 69:
        wild_card = True
    out_player = choice(players)
    for player in players:
        filen = player + ".txt"
        f = open(filen, "w")
        if wild_card:
            f.write("You are out of the loop!\n")
        else:
            if player == out_player:
                f.write("You are out of the loop!\n")
            else:
                f.write(answer)
    return out_player
                
#To conserve space, delete the "answer files"
def erase_names(players):
    for player in players:
        filen = player + ".txt"
        os.remove(filen)
    

#This function takes in a list of people and returns
#a mapping of asker to askee in the form of a list of
#tuples
def make_pairs(people):
    askers = people.copy()
    askees = people.copy()
    pairs = []
    for i in range(len(people)):
        asker = choice(askers)
        askers.remove(asker)
        askee = choice(askees)
        askees.remove(askee)
        pairs.append( (asker, askee) )
    return pairs

#Makes sure that none of the pairs contains duplicates
#(ex: Rory ask Rory)
def check_pair(pairs):
    for pair in pairs:
        if pair[0] == pair[1]:
            return False
    return True

#This function randomly selects as many questions as their are current players
#and returns a list of them
def get_questions(cat, n):
    filen = cat + "_questions.txt"
    path = pathlib.Path(filen)
    if not path.exists():   
        print("Error, can't open file!!!")
        sys.exit()   
    f = open(filen, "r")
    questions = f.readlines()
    result = []
    i = 0
    while i < n:
        current_question = choice(questions)
        if current_question not in result:
            result.append(current_question)
            i += 1
    return result

#This function takes the category and returns a group of n randomly selected
#answers
def get_answers(cat):
    n = 5
    filen = cat + ".txt"
    path = pathlib.Path(filen)
    if not path.exists():   
        print("Error, can't open file!!!")
        sys.exit()
    f = open(filen, "r")
    answers = f.readlines()
    result = []
    i = 0
    while i < n:
        current_answer = choice(answers)
        if current_answer not in result:
            result.append(current_answer)
            i += 1
    return result   

def joke_names(L):
    i = 0
    while i < len(L):
        if (L[i].lower() == "roquie") :
            L[i] = "T-Bone"
        elif L[i].lower() == "jack":
            L[i] = "Big Head"
        elif L[i].lower() == "will":
            L[i] = "little dick"
        elif L[i].lower() == "kevin":
            L[i] = "Mclovin"
        i += 1
    return L
    
players = add_users()
print("\nThere are {} people playing:".format(len(players)))

players = joke_names(players)

for person in players:
    print(person)

pairs = make_pairs(players)
while not check_pair(pairs):
    pairs = make_pairs(players)


#Pick the category:
mode = input("Which category:\n\tplayers\n\tfood\n\tlocations\n\tanimals\n\titems\n\tlocations\n=>  ")

#Get questions and potential answers:
if mode == "players":
    answers = players.copy()
else:
    answers = get_answers(mode)  
answer = choice(answers)
out_player = assign_roles(players, answer)
questions = get_questions(mode, len(players))

reveal_answers = input("Would you like to see the answers ahead of time? (y/n): ")
if(reveal_answers == "y"):
    for item in answers:
        print(item)

for i in range(len(questions)):
    print("{} ask {}: {}".format(pairs[i][0],pairs[i][1], questions[i]), end = "")
    advance = input()
    
print("Dicsussion time!!!")

print("Answer:",answer)
print(out_player, "was out of the loop!")

erase_names(players)


