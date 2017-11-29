import logging
import os
import boto3
import json
from urllib import request, parse

logger = logging.getLogger()
logger.setLevel(logging.INFO)

PAGE_ACCESS_TOKEN = os.environ['PAGE_ACCESS_TOKEN']
BOT_NAME = os.environ['BOT_NAME']
BOT_ALIAS = os.environ['BOT_ALIAS']
BOT_REGION = os.environ['BOT_REGION']

lex = boto3.client('lex-runtime', region_name=BOT_REGION)

def lambda_handler(event, context):
    logger.info( 'Handling new message: {}'.format( event )  )

    if event['object'] == 'page':
        for entry in event['entry']:
            pageID = entry['id']
            timeOfEvent = entry['time']


            for event in entry['messaging']:
                if event['message']:
                    facebook = True
                    if event.get('target') is not None and event[ 'target'] == 'web':
                        facebook = False
                    return received_message(event, facebook)
                elif event['postback']:
                    return received_postback(event)
                else:
                    logger.info( 'Webook received unknown event: ' + event )

    return ""

def received_message(event, facebook=True):
    logger.info( 'received_message: {}'.format( event ) )

    message = event['message']['text'].lower().translate(accents)
    sender_id = event['sender']['id']
    recipient_id = event['recipient']['id']
    timestamp = event['timestamp']
    lex_resp = lex.post_text(
        botName=BOT_NAME,
        botAlias=BOT_ALIAS,
        userId=event['sender']['id'],
        inputText=message
    )
    logger.info( 'lex response: {}'.format( lex_resp ) )
    state = lex_resp['dialogState']

    resp_msg = ""
    if state == 'ReadyForFulfillment':
        if facebook:
            send_text_message(sender_id, 'Ok. Agora falta construir a resposta :)' )
        else:
            resp_msg = 'Ok. Agora falta construir a resposta :)'
    else:
        if facebook:
            send_text_message(sender_id, lex_resp['message'])
        else:
            resp_msg = lex_resp['message']

    resp_msg = {
        'recipient': {
           'id': recipient_id
        },
        'message': {
          'text': resp_msg
        }
    }
    return json.dumps(resp_msg)


def received_postback(event):
    logger.info( 'received_postback: {}'.format( event .format( event )) )


def call_send_api(message_data):
    url = "https://graph.facebook.com/v2.6/me/messages?access_token=%s" % PAGE_ACCESS_TOKEN

    data = json.dumps(message_data).encode('utf-8')
    req =  request.Request(url, data=data, headers={'Content-type':'application/json'})
    fb_resp = request.urlopen(req)

    if fb_resp.getcode() == 200:
        body = json.loads( fb_resp.read().decode('utf-8') )
        logger.info("Facebook Response Body: {}".format( body ) )
        recipient_id = body['recipient_id']
        message_id = body['message_id']
        logger.info("Successfully sent generic message with id {} to recipient {}".format( message_id, recipient_id ) )
    else:
        message = "Unable to send message: Code({}) Reason({}) Text({})".format( fb_resp.getcode(), fb_resp.info(), fb_resp )
        logger.error(message )
        raise Exception(message)

def send_text_message(recipient_id, message_text):
    length = len(message_text)
    while length > 0:
        if length > 640:
            end_idx = message_text[0:min(640,length)].rfind(' ' )
            message = message_text[0:end_idx]
            message_text = message_text[end_idx:length]
        else:
            message = message_text
            message_text = ""

        length = len(message_text)

        call_send_api({
            'recipient': {
               'id': recipient_id
            },
            'message': {
              'text': message
            }
        })
