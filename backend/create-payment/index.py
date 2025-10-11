import json
import os
import uuid
import base64
from typing import Dict, Any
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create YooKassa payment for donation purchase
    Args: event with httpMethod, body containing username, donation_name, price, return_url
          context with request_id
    Returns: HTTP response with payment confirmation URL
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    username: str = body_data.get('username', '')
    donation_name: str = body_data.get('donation_name', '')
    price: int = body_data.get('price', 0)
    return_url: str = body_data.get('return_url', 'https://emeraldworld.ru')
    
    if not username or not donation_name or price <= 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request data'})
        }
    
    shop_id = os.environ.get('YUKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YUKASSA_SECRET_KEY', '')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Payment system not configured'})
        }
    
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {
            'value': f'{price}.00',
            'currency': 'RUB'
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': return_url
        },
        'capture': True,
        'description': f'Донат {donation_name} для игрока {username}',
        'metadata': {
            'username': username,
            'donation_name': donation_name
        }
    }
    
    credentials = base64.b64encode(f'{shop_id}:{secret_key}'.encode()).decode()
    
    yukassa_url = 'https://api.yookassa.ru/v3/payments'
    
    headers = {
        'Authorization': f'Basic {credentials}',
        'Idempotence-Key': idempotence_key,
        'Content-Type': 'application/json'
    }
    
    encoded_data = json.dumps(payment_data).encode('utf-8')
    req = urllib.request.Request(yukassa_url, data=encoded_data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            payment_response = json.loads(response.read().decode('utf-8'))
            
            confirmation_url = payment_response.get('confirmation', {}).get('confirmation_url', '')
            
            if confirmation_url:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'payment_url': confirmation_url,
                        'payment_id': payment_response.get('id')
                    })
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Payment creation failed', 'details': payment_response})
                }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': e.code,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YooKassa API error', 'details': error_body})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
