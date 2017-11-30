if (!window.AudioContext) {
  if (!window.webkitAudioContext) {
      alert("Your browser does not support any AudioContext and cannot play back this audio.");
  }
  window.AudioContext = window.webkitAudioContext;
}
context = new AudioContext();

var enterEvent = jQuery.Event("keypress", {
  which: 13
});

  // set the focus to the input box
  document.getElementById("wisdom").focus();

  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = 'us-east-1'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  // Provide your Pool Id here
    IdentityPoolId: 'us-east-1:10cd8934-3f6b-48e5-9ee7-b53c636509cb',
  });

  var lexruntime = new AWS.LexRuntime();
  var lexUserId = 'chatbot-demo' + Date.now();
  var sessionAttributes = {};

  function pushChat() {

    // if there is text to be sent...
    var wisdomText = document.getElementById('wisdom');
    if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

      // disable input to show we're sending it
      var wisdom = wisdomText.value.trim();
      wisdomText.value = '...';
      wisdomText.locked = true;

      // send it to the Lex runtime
      var params = {
        botAlias: '$LATEST',
        botName: 'WorkSpacesVending',
        inputText: wisdom,
        userId: lexUserId,
        sessionAttributes: sessionAttributes
      };
      showRequest(wisdom);
      lexruntime.postText(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
          showError('Error:  ' + err.message + ' (see console for details)')
        }
        if (data) {
          // capture the sessionAttributes for the next cycle
          sessionAttributes = data.sessionAttributes;
          // show response and/or error/dialog status
          showResponse(data);
        }
        // re-enable input
        wisdomText.value = '';
        wisdomText.locked = false;
      });
    }
    // we always cancel form submission
    return false;
  }

  function showRequest(daText) {

    var conversationDiv = document.getElementById('divConversation');
    var requestPara = document.createElement("P");
    requestPara.className = 'userRequest';
    requestPara.appendChild(document.createTextNode(daText));
    conversationDiv.appendChild(requestPara);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  function showError(daText) {

    var conversationDiv = document.getElementById('divConversation');
    var errorPara = document.createElement("P");
    errorPara.className = 'lexError';
    errorPara.appendChild(document.createTextNode(daText));
    conversationDiv.appendChild(errorPara);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  function showResponse(lexResponse) {
  console.log(lexResponse)
    var conversationDiv = document.getElementById('divConversation');
    var responsePara = document.createElement("P");
    responsePara.className = 'lexResponse';
    if (lexResponse.message) {
      responsePara.appendChild(document.createTextNode(lexResponse.message));
      responsePara.appendChild(document.createElement('br'));
    }
    if (lexResponse.dialogState === 'ReadyForFulfillment') {
      responsePara.appendChild(document.createTextNode(
        'Ready for fulfillment'));
      // TODO:  show slot values
    }
    conversationDiv.appendChild(responsePara);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
    var polly = new AWS.Polly();
    var params = {
    OutputFormat: "mp3", 
    Text: lexResponse.message,
    TextType: "text", 
    VoiceId: "Matthew"
    };
    
    polly.synthesizeSpeech(params, function(err, data) {
    
    if (err){
      // an error occured
      console.log(err, err.stack);
    }
    else {
    
      var uInt8Array = new Uint8Array(data.AudioStream);
      var arrayBuffer = uInt8Array.buffer;
      var blob = new Blob([arrayBuffer]);
    
      var audio = $('audio');
      var url = URL.createObjectURL(blob);
      audio[0].src = url;
      audio[0].play();
    }
  });
  }

  function startDictation () {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      recognition = new webkitSpeechRecognition();

      recognition.continuous     = false;
      recognition.interimResults = false;

      recognition.lang = "en-US";

      if (recognition)
        recognition.start();

      recognition.onresult = function(e) {
        var textoRec = e.results[0][0].transcript;

        console.log(textoRec);
        jQuery("#wisdom").val(textoRec);
        pushChat();
      };
      recognition.onerror = function(e) {
        recognition.stop();
      }
    }
  }