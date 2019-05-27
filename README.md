# GOT-Challenge-Alexa
This repo is to demonstrate multi model Alexa voice based quiz game. 

# Brief Demonstrating Skill: 
  **Demo Video:** [YouTube Link](https://youtu.be/Oeerhp8nsz8)
  
HBO TV Show Game of Thrones is along and plot-heavy series, so people won’t remember most of the details about their favorite characters or houses. Most of the time we spend more time on Internet searching event details or watching the previous season to recall events happened earlier.

We are building an Alexa skill “GOT challenge”, which is unique way of remembering your favourite characters and events the form of multi-level voice first game.

In each level, first user will be provided with an overview of the specific character or house and test their knowledge by asking set 4 questions.  
* If they answer correctly, they fetch 25 coins. they can use clues to guess the answer. for each clue 10 coins will be deducted from 25.
*	They need to score at least 50 coins to proceed to next level. 
*	If they score 60 you get 1 badge, for 80 they get 2 badges and for all answers at first guess they fetch 3 badges along with advancing to next level.

### Main Features:
*	It is Multi-modal Voice first game which supports both screen based and screen less devices.
*	Recognize the users who use the skill a lot with personalized custom messages.
*	Exploring the GOT characters or houses using simple voice commands.
*	Store all the user progress using sessions and storing in dynamo DB.
*	Creating interest among users by creating the game in multiple levels, giving badges for users who answer faster and correctly and creating leader boards.


![alt Architecture](https://github.com/Roy-Abhinaba/GOT-Challenge-Alexa/blob/master/Images/Architecture.PNG) 


# Sample Conversation:
 
    User: Alexa, Launch g. o. t. challenge
    Alexa: {Greetings} + Say Play to start the game or Rules to know the rules.
    User: Rules
    Alexa: {Tells rules} + Shall we start the game?
    User: Yes
    Alexa: {Brief introduction about the house/event} + {Askes question}
    User: Clue
    Alexa: {Tells clue}
    User: {Tells right answer}
    Alexa: Thats correct answer.

# License :
This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/Roy-Abhinaba/GOT-Challenge-Alexa/blob/master/LICENSE) file for details.
