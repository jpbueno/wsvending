var sampleData = [];
var selectedSampleData = [];
var modelId = [];

function predict( ) {
    startLoading( );
    var params = {
      MLModelId: modelId, /* required */
      PredictEndpoint: 'https://realtime.machinelearning.us-east-1.amazonaws.com', /* required */
      Record: selectedSampleData
    };
    var ml = new AWS.MachineLearning( );
    ml.predict( params, function( err, data ) {
        if ( err ) {
            console.log( err );
        } else {
            console.log( data );
            $( "#prediction" ).text( JSON.stringify( data.Prediction, null, 3 ) );
        } // else
        stopLoading( );
    });
}

function loadMLSample( ) {
    startLoading( );
    var sampleId = $( "#samples" ).val( );
    $( "#prediction" ).text( "Press the green button..." );
    if ( sampleId > 0 ) {
        var data = sampleData[sampleId-1]
        let payload = '{';
        for ( let i=0; i < data.length; ++i ) {
            let keys = Object.keys( data[i] );
            payload += '"' + keys[0] + '": "' + data[i][keys[0]] + '"';
            if ( i < data.length-1 ) {
                payload += ',';
            } // if
        } // for
        payload += '}';
        selectedSampleData = JSON.parse( payload );
        $( "#payload" ).text( JSON.stringify( selectedSampleData, null, 3 ) );
        $( "#mldemoPredict" ).show( );
        stopLoading( );
    }
}

function loadMLSamples( ) {
    startLoading( );

    var datasetId = $( "#datasets" ).val( );
    if ( datasetId > 0 ) {
        $.getJSON( "https://spock.cloud/js/mlsamples/kaggleDataset" + datasetId + ".json", function( data ) {
            var select = $( '<select></select>' )
                .attr( 'id', 'samples' )
                .attr( 'onChange', 'loadMLSample( );' );
            $( "#samplesSelect" ).remove( );
            $( "#mldemoPredict" ).hide( );
            $( "#mldemo" ).append( $( '<div></div>' ).attr( 'id', 'samplesSelect' ) );
            $( "#samplesSelect" ).append( select );
            modelId = data.modelId;
            select.append( $( '<option></option>' )
                .attr( 'value', '0' ).html( ':: Selecione uma sample' ) );

            $.each( data.samples, function( index, value ) {
                select.append( $( '<option></option>' )
                    .attr( 'value', index+1 ).html( value.name ) );
                sampleData[index] = value.data;
            });

            stopLoading( );
        });
    } // if
}

function loadApplication( application ) {
    switch( application ) {
        case 'mldemo': {

            var select = $( '<select></select>' )
                .attr( 'id', 'datasets' )
                .attr( 'onChange', 'loadMLSamples( );' );

            select.append( $( '<option></option>' )
                .attr( 'value', '0' ).html( ':: Selecione um dataset' ) );
            select.append( $( '<option></option>' )
                .attr( 'value', '1' ).html( ':: Kaggle dataset 1' ) );
            select.append( $( '<option></option>' )
                .attr( 'value', '2' ).html( ':: Kaggle dataset 2' ) );

            $( "#mldemo" ).append( select );
        } break;
    }
}
function showPanel( panel ) {
    $( "#login" ).hide( );
    $( "#application" ).hide( );
    switch ( panel ) {
        case 'application': {
            $( "#application" ).show( );
            loadApplication( 'mldemo' );
        } break;
        case 'login': {
            $( "#login" ).show( );
        } break;
    } // if
}
function evaluateUserSession( ) {
    var user = getCurrentUser( );
    if ( user != null ) {
        user.getSession((err, session ) => {
            if (err) {
                console.log( 'Rejected session' );
                showPanel( 'login' );
            } else {
                console.log( 'Accepted session');
                updateCredentials( session.getIdToken().getJwtToken() );
            } // else
        });
    } else {
        showPanel( 'login' );
    } // else
}

function getCurrentUser( ) {
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
        UserPoolId : aws_user_pools_id,
        ClientId : aws_user_pools_web_client_id
    });
    return userPool.getCurrentUser( );
}

function updateCredentials( jwtToken ) {
    var logins = {};
    var loginKey = 'cognito-idp.' + aws_cognito_region + '.amazonaws.com/' + aws_user_pools_id;
    logins[loginKey] = jwtToken;

    console.log( "Logins: " + loginKey + " "+ logins[loginKey] );
    AWS.config.update({
        credentials: new AWS.CognitoIdentityCredentials({
            'IdentityPoolId': aws_cognito_identity_pool_id,
            'Logins': logins
        })
    });

    var params = {
        IdentityPoolId: aws_cognito_identity_pool_id, /* required */
        Logins: logins
    };

    var cognitoIdentity = new AWS.CognitoIdentity( );
    cognitoIdentity.getId(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            showPanel( 'login' );
        } else  {
            console.log(data);           // successful response
            var params2 = {
                IdentityId: data.IdentityId,
                Logins: logins
            }
            cognitoIdentity.getCredentialsForIdentity( params2, function(err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    showPanel( 'login' );
                } else  {
                    AWS.config.update({
                        credentials: new AWS.Credentials({
                            accessKeyId: data.Credentials.AccessKeyId,
                            secretAccessKey: data.Credentials.SecretKey,
                            sessionToken: data.Credentials.SessionToken
                        })
                    });
                    console.log(data);           // successful response
                    showPanel( 'application' );
                    stopLoading( );
                }
            });
        }
    });
}

function login( ) {
    var username = $( '#username' ).val( );
    var password = $( '#password' ).val( );

    if ( username.length == 0 ) {
		defineMensagem( "erro", "Informe o usuario" );
		return false;
	} // if

    if ( password.length == 0 ) {
        defineMensagem( "erro", "Informe a senha" );
        return false;
    } // if

    startLoading( );
    defineMensagem( );

    var userDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
        Username: username,
        Password: password
    });
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
        UserPoolId : aws_user_pools_id,
        ClientId : aws_user_pools_web_client_id
    });
    var user = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username : username,
        Pool : userPool
    });

    user.authenticateUser(userDetails, {
        "onSuccess": (result) => {
            updateCredentials( result.getIdToken().getJwtToken() );
        },
        "onFailure": (err) => {
            defineMensagem( "erro", err );
            console.log('authentication failed');
            stopLoading( );
        }
    });

    return false;
}

function startLoading( ) {
  $("#loader").show( );
  $("#login :input").attr("disabled", true);
}
function stopLoading( ) {
  $("#loader").hide( );
  $("#login :input").attr("disabled", false);
}

function defineMensagem( tipo, mensagem ) {
   if ( tipo == "erro" ) {
	$("#img-msg-erro").show( );
	$("#img-msg-sucesso").hide( );
	$("#mensagem").addClass( "MensagemErro" );
	$("#mensagem").removeClass( "MensagemSucesso" );
   } else if ( tipo == "sucesso" ) {
	$("#img-msg-erro").hide( );
	$("#img-msg-sucesso").show( );
	$("#mensagem").removeClass( "MensagemErro" );
	$("#mensagem").addClass( "MensagemSucesso" );
   } else {
      $("#mensagem").hide( );
	return;
   } // else
   $("#texto-mensagem").text( mensagem );
   $("#mensagem").show( );
} // defineMensagem

// recupera o valor de um dado cookie
function getCookie(cname) {
   var name = cname + "=";
   var cookies = document.cookie.split(';');
   for( var i=0; i < cookies.length; ++i) {
     var c = cookies[i].replace( /\s*/g, "" );
     if (c.indexOf(name) == 0 ) return c.substring(name.length,c.length);
   } // for
   return "";
} // getCookie

function setCookie(cname, value ) {
    document.cookie=cname + "=" + value + "; Path=/;";
}
