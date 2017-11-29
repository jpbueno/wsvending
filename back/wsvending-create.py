__author__ = 'JP Santana - jpsant@amazon.com'

import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
client = boto3.client('workspaces')

# --- Main handler ---

def lambda_handler(event, context):
    logger.info(event)

    error = []
    msg = []
    bundleid = event['currentIntent']['slots']['bundle']
    directoryid = event['currentIntent']['slots']['directory']
    username = event['currentIntent']['slots']['username']
    runningmode = event['currentIntent']['slots']['runningmode']

    response = client.create_workspaces(
    Workspaces=[
        {
            'DirectoryId': directoryid,
            'UserName': username,
            'BundleId': bundleid,
            # 'VolumeEncryptionKey': 'string',
            # 'UserVolumeEncryptionEnabled': True|False,
            # 'RootVolumeEncryptionEnabled': True|False,
            'WorkspaceProperties': {
                'RunningMode': runningmode,
                # 'RunningModeAutoStopTimeoutInMinutes': 60
            },
            'Tags': [
                {
                    'Key': 'Name',
                    'Value': username+'-workspace',
                },
                {
                    'Key': 'DirectoryId',
                    'Value': directoryid,
                }
            ]
        },
    ]
)
    if not response['FailedRequests']:
        msg = 'Your WorksSpace is being provisioned.'
    else:
        error = response['FailedRequests']
        for l in error:
            msg.append(str(l['ErrorMessage']))
            msg = msg[0]


    answer = {}
    answer["dialogAction"] = {}
    answer["dialogAction"]["type"] = "ElicitIntent"
    answer["dialogAction"]["message"] = {}
    answer["dialogAction"]["message"]["contentType"] = "PlainText"
    answer["dialogAction"]["message"]["content"] = msg

    return answer
