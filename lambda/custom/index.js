'use strict';
const Alexa = require('alexa-sdk');
const https = require('https');


const APP_ID = 'amzn1.ask.skill.6aecbfc1-1a75-41ae-9a3a-73f8fefb9770';

const SKILL_NAME = 'Good Quotes';
const HELP_MESSAGE = 'You can say, "ask good quotes for a quote <emphasis level="moderate">by</emphasis> ...author name," "ask good quotes for a quote <emphasis level="moderate">about</emphasis> ..tag name, emotion, concept, abstract idea", or "ask good quotes for a quote <emphasis level="moderate">from</emphasis> ..title or publication name," . Or you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const getRandomQuote = (query, search) => new Promise(resolve => {    
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

const phraseBuild = (q, a, p) => !p ? `${q} <break time=".5s"/> by ${a}` : `${q} <break time=".5s"/> by ${a} <break time=".3s"/> from ${p}`;

const handlers = {
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
