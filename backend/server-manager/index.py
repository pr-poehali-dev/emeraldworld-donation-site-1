import json
import random
import string
import os
from typing import Dict, Any
import psycopg2
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manages Minecraft servers - create, start, stop, delete, update IP operations
    Args: event with httpMethod, body containing action and server details
    Returns: Server status and connection information
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            server_name = body_data.get('serverName', 'My Server')
            server_version = body_data.get('serverVersion', '1.20.1')
            server_ip = body_data.get('serverIp', 'localhost')
            user_id = event.get('headers', {}).get('x-user-id', 'anonymous')
            
            server_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            server_port = random.randint(25565, 30000)
            subdomain = server_ip if server_ip else 'localhost'
            
            cur.execute('''
                INSERT INTO minecraft_servers 
                (server_id, user_id, server_name, version, status, subdomain, port, max_players, online_players, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (server_id, user_id, server_name, server_version, 'created', subdomain, server_port, 20, 0, datetime.now()))
            
            conn.commit()
            
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
                'ip': server_ip if server_ip else 'localhost',
                'port': server_port,
                'maxPlayers': 20,
                'onlinePlayers': 0,
                'createdAt': datetime.now().isoformat(),
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
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = event.get('headers', {}).get('x-user-id', 'anonymous')
            
            cur.execute('''
                SELECT server_id, server_name, version, status, subdomain, port, 
                       max_players, online_players, created_at
                FROM minecraft_servers 
                WHERE user_id = %s
                ORDER BY created_at DESC
            ''', (user_id,))
            
            servers = []
            for row in cur.fetchall():
                servers.append({
                    'serverId': row[0],
                    'serverName': row[1],
                    'version': row[2],
                    'status': row[3],
                    'ip': row[4] if row[4] else 'localhost',
                    'port': row[5],
                    'maxPlayers': row[6],
                    'onlinePlayers': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None,
                    'plugins': ['EssentialsX', 'WorldEdit', 'CoreProtect', 'Vault', 'LuckPerms']
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'servers': servers})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            server_id = body_data.get('serverId')
            action = body_data.get('action')
            
            if action == 'start':
                new_status = 'running'
            elif action == 'stop':
                new_status = 'stopped'
            elif action == 'restart':
                new_status = 'running'
            else:
                new_status = 'stopped'
            
            cur.execute('''
                UPDATE minecraft_servers 
                SET status = %s 
                WHERE server_id = %s
            ''', (new_status, server_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'status': 'success', 'newStatus': new_status})
            }
        
        elif method == 'PATCH':
            body_data = json.loads(event.get('body', '{}'))
            server_id = body_data.get('serverId')
            new_ip = body_data.get('newIp')
            
            if not server_id or not new_ip:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'serverId и newIp обязательны'})
                }
            
            subdomain = new_ip.replace('.', '-').replace(':', '-')
            
            cur.execute('''
                UPDATE minecraft_servers 
                SET subdomain = %s 
                WHERE server_id = %s
            ''', (subdomain, server_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'status': 'updated', 'newIp': new_ip})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            server_id = query_params.get('serverId')
            
            cur.execute('DELETE FROM minecraft_servers WHERE server_id = %s', (server_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'status': 'deleted'})
            }
        
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }