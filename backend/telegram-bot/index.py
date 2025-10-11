import json
import os
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram бот для приёма донатов EmeraldWorld
    Args: event - Telegram webhook update
          context - execution context
    Returns: HTTP response для Telegram API
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
            'body': '',
            'isBase64Encoded': False
        }
    
    bot_token = '8491514227:AAER5to4waqchGHYD5LdC3CY1opk9d52Oeo'
    
    try:
        body_str = event.get('body', '{}')
        update = json.loads(body_str) if body_str else {}
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = update['message']
        chat_id = str(message['chat']['id'])
        text = message.get('text', '')
        
        # Обработка команды /start с параметрами заказа
        if text.startswith('/start'):
            parts = text.split(' ', 1)
            
            if len(parts) > 1:
                # Формат: /start king_PlayerNick_99
                order_data = parts[1].split('_')
                
                if len(order_data) == 3:
                    tier_id, nickname, price = order_data
                    
                    tier_names = {
                        'king': 'Король 👑',
                        'demon': 'Демон 🔥',
                        'emerald': 'Изумруд 💎',
                        'devil': 'Дьявол 💀'
                    }
                    
                    tier_name = tier_names.get(tier_id, tier_id)
                    
                    payment_message = f"""🎮 <b>Заказ на EmeraldWorld</b>

👤 Игрок: <code>{nickname}</code>
💎 Донат: {tier_name}
💰 Сумма: {price} ₽

<b>Инструкция по оплате:</b>

1️⃣ Переведите {price} ₽ на карту Сбербанка:
<code>2202 2062 4188 3953</code>

2️⃣ В комментарии к переводу укажите:
<code>{nickname}</code>

⏱ Донат будет выдан в течение 5 минут после проверки оплаты

❓ Вопросы? Напишите @admin"""
                    
                    send_message(bot_token, chat_id, payment_message)
                    
                    # Уведомление администратору
                    admin_chat_id = '8431748047'
                    admin_message = f"""🔔 <b>Новый заказ!</b>

👤 Игрок: {nickname}
💎 Донат: {tier_name}
💰 Сумма: {price} ₽

Ожидаем оплату от пользователя"""
                    send_message(bot_token, admin_chat_id, admin_message)
                    
                else:
                    send_message(bot_token, chat_id, '❌ Ошибка в данных заказа. Попробуйте снова с сайта.')
            else:
                # Обычный /start без параметров
                welcome_message = """👋 Добро пожаловать в магазин EmeraldWorld!

Для покупки доната:
1. Перейдите на сайт emeraldworld.ru
2. Выберите донат-пакет
3. Нажмите "Купить" и вернитесь сюда

💳 Оплата принимается по карте Сбербанка
⚡️ Выдача в течение 5 минут"""
                send_message(bot_token, chat_id, welcome_message)
        
        # Обработка фото (скриншот чека) - опционально
        elif 'photo' in message:
            admin_chat_id = '8431748047'
            username = message['from'].get('username', 'Unknown')
            first_name = message['from'].get('first_name', 'Игрок')
            
            # Пересылаем фото админу
            photo_id = message['photo'][-1]['file_id']
            caption = f"📸 Чек от @{username} ({first_name})"
            
            send_photo(bot_token, admin_chat_id, photo_id, caption)
            send_message(bot_token, chat_id, '✅ Чек получен! Ожидайте проверки администратора.')
        
    except Exception as e:
        # Логируем ошибку но возвращаем 200 чтобы Telegram не повторял запрос
        print(f"Error: {str(e)}")
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }


def send_message(bot_token: str, chat_id: str, text: str) -> None:
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    try:
        response = requests.post(url, json={
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }, timeout=5)
        print(f"Send message response: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending message: {str(e)}")


def send_photo(bot_token: str, chat_id: str, photo_id: str, caption: str) -> None:
    url = f'https://api.telegram.org/bot{bot_token}/sendPhoto'
    try:
        response = requests.post(url, json={
            'chat_id': chat_id,
            'photo': photo_id,
            'caption': caption
        }, timeout=5)
        print(f"Send photo response: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending photo: {str(e)}")