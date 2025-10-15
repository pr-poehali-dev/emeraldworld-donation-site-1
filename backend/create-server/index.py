import json
import random
import string
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Creates a new Minecraft server instance for users
    Args: event with httpMethod, body containing serverName and serverVersion
    Returns: Server details including IP, port, and connection info
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        server_name = body_data.get('serverName', 'My Server')
        server_version = body_data.get('serverVersion', '1.20.1')
        
        server_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        server_port = random.randint(25565, 30000)
        
        server_details = {
            'serverId': server_id,
            'serverName': server_name,
            'version': server_version,
            'status': 'running',
            'ip': f'{server_id}.emeraldworld.host',
            'port': server_port,
            'maxPlayers': 20,
            'onlinePlayers': 0,
            'createdAt': '2025-10-15T10:30:00Z',
            'plugins': ['EssentialsX', 'WorldEdit', 'CoreProtect'],
            'message': 'Сервер успешно создан и запущен!'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(server_details)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
