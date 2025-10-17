import json
import random
import string
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Creates Minecraft server configuration for local hosting
    Args: event with httpMethod, body containing serverName, serverVersion, serverIp
    Returns: Server config with download instructions for Radmin VPN setup
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
        server_ip = body_data.get('serverIp', 'localhost')
        
        server_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        
        # Определяем ссылку на скачивание сервера в зависимости от версии
        version_downloads = {
            '1.20.1': 'https://api.papermc.io/v2/projects/paper/versions/1.20.1/builds/196/downloads/paper-1.20.1-196.jar',
            '1.19.4': 'https://api.papermc.io/v2/projects/paper/versions/1.19.4/builds/550/downloads/paper-1.19.4-550.jar',
            '1.18.2': 'https://api.papermc.io/v2/projects/paper/versions/1.18.2/builds/388/downloads/paper-1.18.2-388.jar',
            '1.16.5': 'https://api.papermc.io/v2/projects/paper/versions/1.16.5/builds/794/downloads/paper-1.16.5-794.jar',
            '1.12.2': 'https://api.papermc.io/v2/projects/paper/versions/1.12.2/builds/1620/downloads/paper-1.12.2-1620.jar'
        }
        
        server_details = {
            'serverId': server_id,
            'serverName': server_name,
            'version': server_version,
            'status': 'created',
            'ip': server_ip,
            'port': 25565,
            'maxPlayers': 20,
            'onlinePlayers': 0,
            'createdAt': '2025-10-15T10:30:00Z',
            'plugins': ['EssentialsX', 'WorldEdit', 'CoreProtect', 'Vault', 'LuckPerms'],
            'downloadUrl': version_downloads.get(server_version, version_downloads['1.20.1']),
            'message': 'Конфигурация сервера создана! Скачайте файлы для запуска.'
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