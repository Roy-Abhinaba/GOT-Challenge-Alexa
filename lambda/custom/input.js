module.exports = Object.freeze({

    SKILL_NAME : "G.O.T. challenge",
    ddbTableName : 'got-challenge',

    imagePath : 'https://s3.amazonaws.com/alexa-skills-content/got-challenge/display-images/{A}_img_{W}x{H}.png',
    backgroundImagePath : 'https://s3.amazonaws.com/alexa-skills-content/got-challenge/display-images/{A}_bg_{W}x{H}.png',


    MAIN_MESSAGE : "Say Play to start the game or Rules to know the rules.",
    REPROMPT : "What you want to do?",

    FALLBACK_MESSAGE_DURING_GAME : 'The Game of Thrones challenge Game skill can\'t help you with that. Try guessing the answer for the question asked. Or Ask for clue. ',
    FALLBACK_REPROMPT_DURING_GAME : 'Try guessing the answer for the question asked. Or Ask for clue.',
    FALLBACK_MESSAGE_OUTSIDE_GAME : 'The Game of Thrones challenge Game skill can\'t help you with that.  It will come up with a topic, gives brief information, then asks set of questions. You can try Play to start the game or Rules to know the rules. What you want to do?',
    FALLBACK_REPROMPT_OUTSIDE_GAME : "Say Play to start the game or Rules to know the rules",

    GAME_RULES : [
        "Alright, let me guide you through the basics of the game.",
        "HBO TV Show Game of Thrones is based on long and plot-heavy novel  named A Song of Ice and Fire  by George R.R. Martin. G.O.T.  Challenge is a multi-level fun quiz game to find out, how well do you know your trivia.",
        "Each level contains 4 questions. Evry level you will get a overview of a Topic. Then you'll be asked to answer the questions related to the Topic.",
        "Each correct answer will get 25 coins. Each level has two clues or hints and you can use them as per your need.",
        "Each clue will reduce 10 coins. You need to score at least 50 coins to proceed for the next level. if you score 60 you get 1 badge, for 80 you get 2 badges and for all answers at first guess you fetch 3 badges along with advancing to next level.",      
    ],
	
    GAME_RULES_REPROMPT : "Shall we start the game?",

    GAME_PLAY_REPROMPT : [
      "Please answer to the question.",
      "Say clue if you do not know the answer."
    ],

    INPUT_DATA : [
        {
          "Battle": "House of Targaryen",
          "Description": [
            "Targaryen's ruled the seven kingdoms of westeros prior to the king Robert Baratheon." ,
            "The only family of dragonlords survived the doom of valyria as they left valyrian freehold twelve years before the doom.",
            "They ruled for more than a century at Dragonstone, until Aegon and his sister-wives, Visenya and Rhaenys, began the first of  Wars of Conquest.",
            "They built the Aegon fort in the new capital city of King's Landing.",
            "The dynasty ended with the death of last Targaryen king during Robert's Rebellion"
          ],
          "Subquestion": [
            {
                "Question": "Who killed the last Targaryen King by stabbing him in the back?", 
                "Answer": "Jamie Lannister", 
                "Clues": [
                    "He was also known as The Kingslayer.",
                    "He was the brother of Cersie and Tyrion Lannister."
                ]
            },
            {
              "Question": "What is the sigil or symbol of House Targaryen?",
              "Answer": "3 headed dragon",
              "Clues": [
                "It is a mythical creature.",
                "It has three heads and breathes fire."
              ]
            },
            {
              "Question": "What is the real name of last Targaryen king?",
              "Answer": "Aerys",
              "Clues": [
                "He was known as Mad King.",
                "Father of Daenerys Targaryen."
              ]
            },
            {
              "Question": "Which Targaryen was killed by Robert Baratheon in battle of the Trident? ",
              "Answer": "Rhaegar Targaryen",
              "Clues": [
                "He is the first born on the King Aerys the second.",
                "Elder Brother of Price Viserys and Princess Daenerys."
              ]
            }
          ]
        }
      ]
});
