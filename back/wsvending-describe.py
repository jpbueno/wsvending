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

    response = client.describe_workspaces(
            DirectoryId= directoryid,
            UserName=username
            )

    print response

    if not response['Workspaces']:
         msg = 'There are no WorkSpaces created in the specified AWS region.'

    else:
        msg = ""
        workspaces = response['Workspaces']
        for l in workspaces:
            msg += "User Name: %s, \n" % l["UserName"]
            msg += "State: %s, \n" % l["State"]
            msg += "Running Mode: %s, \n" % l["WorkspaceProperties"]["RunningMode"]
            msg += "Workspace ID: %s, \n" % l["WorkspaceId"]
            msg += "IP Address: %s\n" % l["IpAddress"]
        #     username.append(str(l['UserName']))

    # msg = 'There are Amazon WorkSpaces created for the following users: {}'.format((", ".join(username)))
    # msg = json.dumps(workspaces, indent=4, sort_keys=True)

    answer = {}
    answer["dialogAction"] = {}
    answer["dialogAction"]["type"] = "ElicitIntent"
    answer["dialogAction"]["message"] = {}
    answer["dialogAction"]["message"]["contentType"] = "PlainText"
    answer["dialogAction"]["message"]["content"] = msg

    print msg
    return answer
