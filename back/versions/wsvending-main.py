__author__ = 'JP Santana - jpsant@amazon.com'

import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

client = boto3.client('lex-runtime')

# --- Main handler ---

def lambda_handler(event, context):
    logger.info(event)

    print event

    message = event['BundleId']

    response = client.post_text(
        botName= 'WorkSpacesVending',
        botAlias= 'workspacesvending',
        userId= message,
        inputText= message
    )

    print response
    return response
