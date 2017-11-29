import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
client = boto3.client('cloudformation')

# --- Main handler ---

def lambda_handler(event, context):
    logger.info(event)

    bundleid = event['currentIntent']['slots']['bundle']
    directoryid = event['currentIntent']['slots']['directory']
    username = event['currentIntent']['slots']['username']

    response = client.create_stack(
    StackName= username,
    TemplateURL='https://s3.amazonaws.com/workspaces-jp/workspaces2.json',
    Parameters=[
        {
            'ParameterKey': 'BundleId',
            'ParameterValue': bundleid,
        },
        {
            'ParameterKey': 'DirectoryId',
            'ParameterValue': directoryid,
        },
        {
            'ParameterKey': 'UserName',
            'ParameterValue': username,
        }
    ],
)
    msg = 'Your Amazon WorkSpace is being provisioned!'

    answer = {}
    answer["dialogAction"] = {}
    answer["dialogAction"]["type"] = "ElicitIntent"
    answer["dialogAction"]["message"] = {}
    answer["dialogAction"]["message"]["contentType"] = "PlainText"
    answer["dialogAction"]["message"]["content"] = msg

    return answer
