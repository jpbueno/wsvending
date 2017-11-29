__author__ = 'JP Santana - jpsant@amazon.com'

import boto3
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
client = boto3.client('workspaces')

# --- Main handler ---

def lambda_handler(event, context):
    logger.info(event)

    directoryid = event['currentIntent']['slots']['directory']
    username = event['currentIntent']['slots']['username']
    userid = ''
    state = ''
    runningmode = ''
    ipaddress = ''

    response = client.describe_workspaces(
            DirectoryId= directoryid,
            UserName=username
            )

    print response

    if not response['Workspaces']:
        msg = 'Sorry! There is no WorkSpace created for this user.'

    else:
        msg = ""
        workspaces = response['Workspaces']
        for l in workspaces:
            userid = l["UserName"]
            state = l["State"]
            runningmode = l["WorkspaceProperties"]["RunningMode"]
            if runningmode == "ALWAYS_ON":
                runningmode = "always on"
            else:
                runningmode = "auto stop"
            ipaddress = l["IpAddress"]
        msg = "Just found it! The userid is {}, it is {}, the running mode is {} and the IP address was set to {}".format(
        userid,
        state,
        runningmode,
        ipaddress)

    answer = {}
    answer["dialogAction"] = {}
    answer["dialogAction"]["type"] = "ElicitIntent"
    answer["dialogAction"]["message"] = {}
    answer["dialogAction"]["message"]["contentType"] = "PlainText"
    answer["dialogAction"]["message"]["content"] = msg

    print msg
    return answer
