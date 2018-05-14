'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');
const appID = require('./appID');

const APP_ID = appID;

const SKILL_NAME = 'Good Quotes';
const GET_FACT_MESSAGE = "Here's your quote: ";
const HELP_MESSAGE = 'You can say tell me a quote. Or you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const getRandomQuote = (query, search) => {
    return new Promise(resolve => {
        
    let minSearch = search.toLowerCase().replace(/\s/g, '+');
    
    let options = {
      host: 'goodquotesapi.herokuapp.com',
      method: 'GET',
      path: `/${query}/${minSearch}`
    }

    let req = https.request(options, res => {
        res.setEncoding('utf8');
        let returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
          let quoteData = JSON.parse(returnData);
          let quoteIndex = Math.floor(Math.random() * quoteData.quotes.length);
          let randomQuote = quoteData.quotes[quoteIndex];

          resolve(randomQuote);
        });

    });
    req.end();
    });
}

const phraseBuild = (q, a, p) => !p ? `${q} by ${a}` : `${q} by ${a} from ${p}`;


const handlers = {
    // 'LaunchRequest': function () {
    //     this.emit('GetQuoteIntent');
    // },
    'GetTagQuoteIntent': function () {
        
        let intentReq = this.event.request.intent.slots.tag.value; 
        
        getRandomQuote('tag', intentReq)
        .then(data => {
            
            let outputQuote = phraseBuild(data.quote, data.author, data.publication);

            this.emit(':tell', outputQuote);
            
        });

    },
    'GetAuthorQuoteIntent': function () {
        
        let intentReq = this.event.request.intent.slots.author.value; 
        
        getRandomQuote('author', intentReq)
        .then(data => {
            
            let outputQuote = phraseBuild(data.quote, data.author, data.publication);

            this.emit(':tell', outputQuote);
            
        });

    },
    'GetTitleQuoteIntent': function () {
        
        let intentReq = this.event.request.intent.slots.title.value; 
        
        getRandomQuote('title', intentReq)
        .then(data => {
            
            let outputQuote = phraseBuild(data.quote, data.author, data.publication);

            this.emit(':tell', outputQuote);
            
        });

    },
    'GetQuoteIntent': function () {
        
        getRandomQuote()
        .then(data => {
            
            let outputQuote = `${data.quote} by ${data.author}`;

            this.emit(':tell', outputQuote);
            
        });

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
