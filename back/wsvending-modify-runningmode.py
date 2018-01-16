__author__ = 'JP Santana - jpsant@amazon.com'

import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
client = boto3.client('workspaces')

# --- Main handler ---

def lambda_handler(event, context):
    logger.info(event)

    username = event['currentIntent']['slots']['username']
    directoryid = event['currentIntent']['slots']['directory']
    runningmode = event['currentIntent']['slots']['runningmode']

    response = client.describe_workspaces(
            DirectoryId= directoryid,
            UserName= username
            )

    print response

    if not response['Workspaces']:
         msg = 'A WorkSpace does not exist for the especified user.'
    else:
        workspaceid = response['Workspaces'][0]['WorkspaceId']
        current_runningmode = response['Workspaces'][0]['WorkspaceProperties']['RunningMode']
        
        if runningmode == current_runningmode:
            msg = 'The WorkSpace running mode is already {}'.format(current_runningmode)
        
        else:
            modify = client.modify_workspace_properties(
                            WorkspaceId= workspaceid,
                            WorkspaceProperties={
                                'RunningMode': runningmode
                            }
            )
            msg = 'Your Amazon WorkSpace ID {} is being changed to {} running mode!'.format(workspaceid, runningmode)

    answer = {}
    answer["dialogAction"] = {}
    answer["dialogAction"]["type"] = "ElicitIntent"
    answer["dialogAction"]["message"] = {}
    answer["dialogAction"]["message"]["contentType"] = "PlainText"
    answer["dialogAction"]["message"]["content"] = msg

    return answer
