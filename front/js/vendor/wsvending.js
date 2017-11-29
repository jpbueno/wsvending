// links
// http://eloquentjavascript.net/09_regexp.html
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
var nlp = window.nlp_compromise
var messageCounter = 1

var messages = [],      // array that hold the record of each string in chat
  lastUserMessage = '', // keeps track of the most recent input string from the user
  botMessage = '',      // var keeps track of what the chatbot is going to say
  botName = 'WorkSpacesVending',   // name of the chatbot
  talking = false       // when false the speach function doesn't work

//
//
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// edit this function to change what the chatbot says
function chatbotResponse () {
  botMessage = lastUserMessage
  /*
  botMessage = "E agora! Quem poderÃ¡ nos defender?"; //the default message

  if (lastUserMessage === 'hi') {
    botMessage = 'Howdy!';
  }

  if (lastUserMessage === 'name') {
    botMessage = 'My name is ' + botName;
  } */
}
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
//
//
//
// this runs each time enter is pressed.
// It controls the overall input and output
function newEntry () {
  // if the message from the user isn't empty then run
  if (document.getElementById('chatbox').value !== '') {
    // pulls the value from the chatbox ands sets it to lastUserMessage
    lastUserMessage = document.getElementById('chatbox').value

    // sets the chat box to be clear
    document.getElementById('chatbox').value = ''

    // adds the value of the chatbox to the array messages
    // messages.splice(0, 0, '<b><font color="#0000FF">VocÃª</font></b>: ' + lastUserMessage)
    messages.push('<b><font color="#0000FF">VocÃª</font></b>: ' + lastUserMessage)

    // Speech(lastUserMessage);  //says what the user typed outloud
    // sets the variable botMessage in response to lastUserMessage
    // chatbotResponse();
    sendToMestre(lastUserMessage)
  }
}

function sendToMestre (text) {
  var message = {
    'object': 'page',
    'entry': [
      {
        'id': '129244127',
        'time': Math.floor(Date.now() / 1000),
        'messaging': [
          {
            'target': 'web',
            'sender': {
              'id': '123'
            },
            'recipient': {
              'id': '666'
            },
            'timestamp': Math.floor(Date.now() / 1000),
            'message': {
              'seq': messageCounter++,
              'text': text
            }
          }
        ]
      }
    ]
  }

  jQuery.ajax({
    type: 'POST',
    url: 'https://i5i0x2dm3d.execute-api.us-east-1.amazonaws.com/prod',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      lastUserMessage = data.message.text
      lastUserMessage = lastUserMessage.replace(/\n/g, '</br>')
      lastUserMessage = lastUserMessage.replace(/\*([^\*]+)\*/g, '<b>$1</b>')

      chatbotResponse()
      // add the chatbot's name and message to the array messages
      // messages.splice(0, 0, '<b><font color="#FF0000">' + botName + '</font></b>: ' + botMessage)
      messages.push('<b><font color="#FF0000">' + botName + '</font></b>: ' + botMessage)
       // says the message using the text to speech function written below
      Speech(botMessage)
       // outputs the last few array elements of messages to html
      var dialogue = ''
      for (var i = 1; i < 15; i++) {
        if (messages[messages.length - i]) {
          dialogue = (messages[messages.length - i] + '</br>' + dialogue)
        }
      }
      $('#chatlog1').html(dialogue)
      $('#chatlog1').emoticonize()
      $('#chatlog1').animate({scrollTop: $('#chatlog1').prop('scrollHeight')}, 1000)
    },
    dataType: 'json'
  })
}

// text to Speech
// https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API
function Speech (say) {
  if ('speechSynthesis' in window && talking) {
    var utterance = new SpeechSynthesisUtterance(say)
    utterance.lang = 'pt-BR'
    // msg.voice = voices[10]; // Note: some voices don't support altering params
    // msg.voiceURI = 'native';
    // utterance.volume = 1; // 0 to 1
    // utterance.rate = 0.1; // 0.1 to 10
    // utterance.pitch = 1; //0 to 2
    // utterance.text = 'Hello World';
    // utterance.lang = 'en-US';
    speechSynthesis.speak(utterance)
  }
}

// runs the keypress() function when a key is pressed
document.onkeypress = keyPress
// if the key pressed is 'enter' runs the function newEntry()
function keyPress (e) {
  var x = e || window.event
  var key = (x.keyCode || x.which)
  if (key === 13 || key === 3) {
    // runs this function when enter is pressed
    newEntry()
  }
  if (key === 38) {
    console.log('hi')
      // document.getElementById("chatbox").value = lastUserMessage;
  }
}

// clears the placeholder text ion the chatbox
// this function is set to run when the users brings focus to the chatbox, by clicking on it
function placeHolder () {
  document.getElementById('chatbox').placeholder = ''
}
