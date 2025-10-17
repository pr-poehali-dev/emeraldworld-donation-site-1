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
            user_id = event.get('headers', {}).get('x-user-id', 'anonymous')
            
            server_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            server_port = random.randint(25565, 30000)
            subdomain = f'{server_id}'
            
            cur.execute('''
                INSERT INTO minecraft_servers 
                (server_id, user_id, server_name, version, status, subdomain, port, max_players, online_players, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (server_id, user_id, server_name, server_version, 'starting', subdomain, server_port, 20, 0, datetime.now()))
            
            conn.commit()
            
            server_details = {
                'serverId': server_id,
                'serverName': server_name,
                'version': server_version,
                'status': 'running',
                'ip': f'{subdomain}.emeraldworld.host',
                'port': server_port,
                'maxPlayers': 20,
                'onlinePlayers': 0,
                'createdAt': datetime.now().isoformat(),
                'plugins': ['EssentialsX', 'WorldEdit', 'CoreProtect'],
                'message': 'Сервер создан! Запуск займёт 1-2 минуты.'
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
                    'ip': f'{row[4]}.emeraldworld.host',
                    'port': row[5],
                    'maxPlayers': row[6],
                    'onlinePlayers': row[7],
                    'createdAt': row[8].isoformat() if row[8] else None,
                    'plugins': ['EssentialsX', 'WorldEdit', 'CoreProtect']
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