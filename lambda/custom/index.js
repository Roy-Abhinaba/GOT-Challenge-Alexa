/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter'); 

const input = require('./input');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.session.new ||
      handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    let attributesManager = handlerInput.attributesManager;
    let responseBuilder = handlerInput.responseBuilder;

    let attributes = await attributesManager.getPersistentAttributes() || {};
    if (Object.keys(attributes).length === 0) {
      attributes.gamesPlayed = 0;
      attributes.endedSessionCount = 0;
      attributes.badge = 0;
      attributes.level = 1;
      attributes.score = 0;
      attributes.question = 0;
      attributes.questionCount = 0;
      attributes.clueCount=0;
      attributes.gameState = 'ENDED';
    }
    attributesManager.setSessionAttributes(attributes);

    let repromptArr = [];
    repromptArr.push(input.MAIN_MESSAGE);
    repromptArr.push(input.REPROMPT);
    let reprompt = await convertArrayToSpeech(repromptArr);

    let speechArr = []; 
    if(attributes.gamesPlayed > 0){
      speechArr.push('Welcome back to '+input.SKILL_NAME+' game.');
      speechArr.push(`You have played ${attributes.gamesPlayed.toString()} times and currently your in Level ${attributes.level.toString()} with ${attributes.badge.toString()} badges`);
    }else{
      speechArr.push('Welcome to '+input.SKILL_NAME+' game.');
    }
    let speechOutput = await convertArrayToSpeech(speechArr)+' '+reprompt;
    let textOutput = await convertArrayToText(speechArr)+"<br/>"+await convertArrayToText(repromptArr);

    if (supportsDisplay(handlerInput)) {
      textOutput = "<div align='center'>"+textOutput+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }

    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const RulesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RulesIntent';
  },
  async handle(handlerInput) {
    let attributesManager = handlerInput.attributesManager;
    let responseBuilder = handlerInput.responseBuilder;
    let attributes = await attributesManager.getSessionAttributes();

    let repromptArr = [];
    repromptArr.push(input.GAME_RULES_REPROMPT);
    let reprompt = await convertArrayToSpeech(repromptArr);
    let speechText = await convertArrayToSpeech(input.GAME_RULES)+reprompt;
    let textOutput = await convertArrayToText(input.GAME_RULES)+'<br/>'+await convertArrayToText(repromptArr);
    
    attributes.gameState = 'RULES';
    attributesManager.setSessionAttributes(attributes);

    if (supportsDisplay(handlerInput)) {
      textOutput = "<div align='center'>"+textOutput+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }

    return responseBuilder
      .speak(speechText)
      .reprompt(reprompt)
      .getResponse();
  },
};

const PlayIntentHandler = {
  canHandle(handlerInput) {
    let startGame = false;

    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&  
        (sessionAttributes.gameState === 'RULES' || sessionAttributes.gameState === 'CLUES')) {
      startGame = true;
    }

    return request.type === 'IntentRequest' && 
      (request.intent.name === 'PlayIntent' || 
        (startGame && request.intent.name === 'AMAZON.YesIntent'));
  },
  async handle(handlerInput) {
    let { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
    let sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.gameState = 'PLAY';

    let level = sessionAttributes.level;
    let speechText = '';
    let textOutput = '';
    let reprompt = '';
    let speechArr = [];

    if(level>input.INPUT_DATA.length){
      speechArr.push("You have completed all the levels.");
      speechArr.push("We will update with new levels soon.");
      speechArr.push("Please check after some time.");
      speechText = await convertArrayToSpeech(speechArr);
      textOutput = await convertArrayToText(speechArr);
      
      sessionAttributes.questionCount = 0;
      sessionAttributes.clueCount=0;
      sessionAttributes.endedSessionCount += 1;
      sessionAttributes.gameState = 'ENDED';
      attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();

      if (supportsDisplay(handlerInput)) {
        textOutput = "<div align='center'>"+textOutput+"</div>";
        let image = new Alexa.ImageHelper()
          .addImageInstance(getLargeImage("LaunchRequest"))
          .getImage();
        let bgImage = new Alexa.ImageHelper()
          .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
          .getImage();
        const title = input.SKILL_NAME;
        const bodyTemplate = 'BodyTemplate3';
        const primaryText = new Alexa.RichTextContentHelper()
          .withPrimaryText(textOutput)
          .getTextContent();
        responseBuilder.addRenderTemplateDirective({
          type: bodyTemplate,
          backButton: 'hidden',
          backgroundImage: bgImage,
          image,
          title,
          textContent: primaryText,
        });
      }
      return responseBuilder
        .speak(speechText)
        .getResponse();
    }else{
      let battle = input.INPUT_DATA[level-1];
      if(sessionAttributes.gameState === 'ENDED' || sessionAttributes.gameState === 'CLUES' || (sessionAttributes.questionCount == 0)){
        let question = 0; 
        speechArr.push(`Your Level ${level.toString()} is about ${battle.Battle}`);
        speechArr.push(`Lets now have overview about ${battle.Battle}`);
        speechText = await convertArrayToSpeech(speechArr)+await convertArrayToSpeech(battle.Description);
        textOutput = await convertArrayToText(speechArr)+await convertArrayToText(battle.Description);
        
        speechArr = []
        speechArr.push("Hope you got the overview of this topic");
        speechArr.push(`Now let me test your knowledge on ${battle.Battle}`);
        speechArr.push(`You can ask me for clue if you feel difficult to answer the question`);
        speechArr.push(`Here is your question. ${battle.Subquestion[question].Question}`);
        
        speechText = speechText + await convertArrayToSpeech(speechArr);
        textOutput = textOutput + await convertArrayToText(speechArr);
        reprompt = await convertArrayToSpeech(input.GAME_PLAY_REPROMPT);
        
        sessionAttributes.question = question;
        sessionAttributes.questionCount = 1;
        sessionAttributes.clueCount=0;
        sessionAttributes.score=0;
      } else {
        let question = sessionAttributes.question;
        if(requestEnvelope.request.intent.slots && 'answer' in requestEnvelope.request.intent.slots){
          let answer = requestEnvelope.request.intent.slots.answer.value;
          if(answer.toLowerCase() === battle.Subquestion[question].Answer.toLowerCase()){
            sessionAttributes.score += (25-(10*sessionAttributes.clueCount));
            sessionAttributes.clueCount=0;
            speechArr.push("Thats correct answer.");
            let questionCount = sessionAttributes.questionCount;
  
            if(questionCount <= 4){
              let question = Math.floor(Math.random() * (battle.Subquestion.length - 0) + 0);
      
              speechArr.push("Lets move to next question.");
              speechArr.push(`Here is your question. ${battle.Subquestion[question].Question}`);
        
              sessionAttributes.question = question;
              sessionAttributes.questionCount += 1;
            }else{
              speechArr.push("and completed your 4 questions");
              speechArr.push("your score is "+sessionAttributes.score);
      
              if(sessionAttributes.score > 50){
                level += 1;
                let badge = (Math.floor((sessionAttributes.score/20)-2));
                sessionAttributes.badge += badge;
                
                speechArr.push("You have moved to "+level+" level.");
                speechArr.push("and You have won "+badge+ " badge, your total badge is "+sessionAttributes.badge);
                speechArr.push("Do you want to play level "+level+"?");
      
                sessionAttributes.level = level;
              }else{
                speechArr.push("Do you want to play again ?");
              }
              sessionAttributes.gamesPlayed += 1;
              sessionAttributes.gameState = 'CLUES';
              sessionAttributes.questionCount = 0;
            }
          } else {
            speechArr.push("Oh oh. "+answer+" is wrong answer");
            speechArr = speechArr.concat(await getClue(attributesManager, sessionAttributes));
          }
        }else{
          speechArr.push("Alright, lets come back.");
          speechArr.push(`Here is your question. ${battle.Subquestion[question].Question}`);
        }
        
        speechText = await convertArrayToSpeech(speechArr);
        textOutput = await convertArrayToText(speechArr);
        reprompt = speechText;
      }
    }
    attributesManager.setSessionAttributes(sessionAttributes);
    
    if (supportsDisplay(handlerInput)) {
      textOutput = "<div align='center'>"+textOutput+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }
    return responseBuilder
      .speak(speechText)
      .reprompt(reprompt)
      .getResponse();
  },
};

const CluesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CluesIntent';
  },
  async handle(handlerInput) {
    let { attributesManager, responseBuilder } = handlerInput;
    let sessionAttributes = attributesManager.getSessionAttributes();
    let speechText;
    let textOutput;
    if(sessionAttributes.gameState === 'PLAY' || sessionAttributes.gameState === 'CLUES'){
      let speechArr = await getClue(attributesManager, sessionAttributes);
      speechText = await convertArrayToSpeech(speechArr);
      textOutput = await convertArrayToText(speechArr);
    }else{
      speechText = 'Please play the game to get the clue';
      textOutput = speechText;
    }
    
    if (supportsDisplay(handlerInput)) {
      textOutput = "<div align='center'>"+textOutput+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }
    return responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  async handle(handlerInput) {
    let responseBuilder = handlerInput.responseBuilder;
    let repromptArr = [];
    repromptArr.push("You can "+input.MAIN_MESSAGE);
    repromptArr.push(input.REPROMPT);
    let reprompt = await convertArrayToSpeech(repromptArr);

    let speechArr = [];
    speechArr.push("please "+input.MAIN_MESSAGE);
    speechArr.push(input.REPROMPT);
    let speechOutput = await convertArrayToSpeech(speechArr);
    let textOutput = await convertArrayToText(speechArr);
    
    if (supportsDisplay(handlerInput)) {
      textOutput = "<div align='center'>"+textOutput+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }
    return responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    let endGame = false;

    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState && 
        (sessionAttributes.gameState === 'RULES'|| sessionAttributes.gameState === 'CLUES')) {
      endGame = true;
    }

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent') ||
        (endGame && request.intent.name === 'AMAZON.NoIntent');
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.questionCount = 0;
    sessionAttributes.endedSessionCount += 1;
    sessionAttributes.gameState = 'ENDED';
    attributesManager.setPersistentAttributes(sessionAttributes);
    await attributesManager.savePersistentAttributes();

    let speechArr = [];
    speechArr.push("Ok Thanks for Playing G.O.T challenge.");
    speechArr.push("see you next time!");
    let speechOutput = await convertArrayToSpeech(speechArr);
    let textOutput = await convertArrayToText(speechArr);

    if (supportsDisplay(handlerInput)) {
      textOutput = "<div align='center'>"+textOutput+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }
    return responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const responseBuilder = handlerInput.responseBuilder;
    console.log(`Error handled: ${error.message}`);

    if (supportsDisplay(handlerInput)) {
      let textOutput = "<div align='center'>Sorry, I can\'t understand the command. Please say again.</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }
    return responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Please say again.')
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    // handle fallback intent, yes and no when playing a game
    // for yes and no, will only get here if and not caught by the normal intent handler
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.FallbackIntent' ||
        request.intent.name === 'RulesIntent' ||
        request.intent.name === 'PlayIntent' ||
        request.intent.name === 'CluesIntent');
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
      sessionAttributes.gameState === 'PLAY') {
      
        if (supportsDisplay(handlerInput)) {
          let textOutput = "<div align='center'>"+input.FALLBACK_MESSAGE_DURING_GAME+"</div>";
          let image = new Alexa.ImageHelper()
            .addImageInstance(getLargeImage("LaunchRequest"))
            .getImage();
          let bgImage = new Alexa.ImageHelper()
            .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
            .getImage();
          const title = input.SKILL_NAME;
          const bodyTemplate = 'BodyTemplate3';
          const primaryText = new Alexa.RichTextContentHelper()
            .withPrimaryText(textOutput)
            .getTextContent();
          responseBuilder.addRenderTemplateDirective({
            type: bodyTemplate,
            backButton: 'hidden',
            backgroundImage: bgImage,
            image,
            title,
            textContent: primaryText,
          });
        }
      return handlerInput.responseBuilder
        .speak(input.FALLBACK_MESSAGE_DURING_GAME)
        .reprompt(input.FALLBACK_REPROMPT_DURING_GAME)
        .getResponse();
    }
    if (supportsDisplay(handlerInput)) {
      let textOutput = "<div align='center'>"+input.FALLBACK_MESSAGE_OUTSIDE_GAME+"</div>";
      let image = new Alexa.ImageHelper()
        .addImageInstance(getLargeImage("LaunchRequest"))
        .getImage();
      let bgImage = new Alexa.ImageHelper()
        .addImageInstance(getBackgroundImage(800, 1200, "LaunchRequest"))
        .getImage();
      const title = input.SKILL_NAME;
      const bodyTemplate = 'BodyTemplate3';
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText(textOutput)
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: bodyTemplate,
        backButton: 'hidden',
        backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
    }
    return handlerInput.responseBuilder
      .speak(input.FALLBACK_MESSAGE_OUTSIDE_GAME)
      .reprompt(input.FALLBACK_REPROMPT_OUTSIDE_GAME)
      .getResponse();
  },
};

function supportsDisplay(handlerInput) {
  const hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
  return hasDisplay;
}

async function getClue(attributesManager, sessionAttributes){
  let level = sessionAttributes.level;
  let battle = input.INPUT_DATA[level-1];
  let question = sessionAttributes.question;
  let clueCount = sessionAttributes.clueCount;
  
  let speechArr = [];

  if(clueCount<2){
    speechArr.push("your clue is");
    speechArr.push(battle.Subquestion[question].Clues[clueCount]);
    sessionAttributes.clueCount += 1; 
  } else{
    sessionAttributes.clueCount=0;
    let questionCount = sessionAttributes.questionCount;
    speechArr.push("You have left with 0 clues.");

    if(questionCount < 4){
      let question = Math.floor(Math.random() * (battle.Subquestion.length - 0) + 0);

      speechArr.push("Lets move to next question.");
      speechArr.push(`Here is your question. ${battle.Subquestion[question].Question}`);

      sessionAttributes.question = question;
      sessionAttributes.questionCount += 1;
    }else{
      speechArr.push("and completed your 4 questions");
      speechArr.push("your score is "+sessionAttributes.score);

      if(sessionAttributes.score > 50){
        level += 1;
        let badge = (Math.floor((sessionAttributes.score/20)-2));
        sessionAttributes.badge += badge;
        
        speechArr.push("You have moved to "+level);
        speechArr.push("and You have won "+badge+ " badge, your total badge is "+sessionAttributes.badge);
        speechArr.push("Do you want to play level "+level+"?");

        sessionAttributes.level = level;
      }else{
        speechArr.push("Do you want to play again ?");
      }
      sessionAttributes.gamesPlayed += 1;
      sessionAttributes.questionCount = 0;
    } 
  }
  sessionAttributes.gameState = 'CLUES';
  attributesManager.setSessionAttributes(sessionAttributes);
  return speechArr;
}

async function convertArrayToSpeech(textArray){
  let speechOutput = '';
  for (var i = 0; i < textArray.length;i++){
    speechOutput = speechOutput + textArray[i]+" <break time=\"1s\"/> ";
  }
  return speechOutput;
}

async function convertArrayToText(textArray){
  let textOutput = '';
  for (var i = 0; i < textArray.length;i++){
    textOutput = textOutput + textArray[i]+"<br/>";
  }
  return textOutput;
}

function getPersistenceAdapter(tableName) {
  // Determines persistence adapter to be used based on environment
  // Note: tableName is only used for DynamoDB Persistence Adapter
  if (process.env.S3_PERSISTENCE_BUCKET) {
    // in Alexa Hosted Environment
    // eslint-disable-next-line global-require
    const s3Adapter = require('ask-sdk-s3-persistence-adapter');
    return new s3Adapter.S3PersistenceAdapter({
      bucketName: process.env.S3_PERSISTENCE_BUCKET,
    });
  }

  // Not in Alexa Hosted Environment
  return new ddbAdapter.DynamoDbPersistenceAdapter({
    tableName: tableName,
    createTable: true,
  });
}

function getLargeImage(intentName) {
  return getImageUrl(800, 1200, intentName);
}

function getImageUrl(height, width, intentName) {
  let imagePath = input.imagePath;
  return imagePath.replace('{H}', height)
    .replace('{W}', width)
    .replace('{A}', intentName);
}

function getBackgroundImage(height, width, intentName) {
  let backgroundImagePath = input.backgroundImagePath;
  return backgroundImagePath.replace('{H}', height)
    .replace('{W}', width)
    .replace('{A}', intentName);
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .withPersistenceAdapter(getPersistenceAdapter(input.ddbTableName))
  .addRequestHandlers(
    LaunchRequestHandler,
    RulesIntentHandler,
    PlayIntentHandler,
    CluesIntentHandler,
    FallbackHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();