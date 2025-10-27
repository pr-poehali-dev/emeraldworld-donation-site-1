import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DonationTier {
  id: string;
  name: string;
  price: number;
  icon: string;
  features: string[];
  oldPrice?: number;
  discount?: number;
}

const donationTiers: DonationTier[] = [
  {
    id: 'king',
    name: 'Король',
    price: 59,
    oldPrice: 99,
    discount: 40,
    icon: 'Crown',
    features: ['Приватная зона', 'Уникальный префикс', 'Доступ к VIP командам']
  },
  {
    id: 'demon',
    name: 'Демон',
    price: 69,
    icon: 'Flame',
    features: ['Огненные эффекты', 'Демонический скин', 'Особые способности']
  },
  {
    id: 'jester',
    name: 'Шут',
    price: 45,
    icon: 'Drama',
    features: ['/fly - полёт', '/kit pvp - боевой набор', '/setwarp 5 - установка точек телепортации']
  },
  {
    id: 'duke',
    name: 'Герцог',
    price: 90,
    oldPrice: 100,
    discount: 10,
    icon: 'Castle',
    features: ['Все функции донатов Шут и Воин', 'Дополнительные привилегии', 'Особый статус на сервере']
  },
  {
    id: 'warrior',
    name: 'Воин',
    price: 15,
    icon: 'Sword',
    features: ['Боевые бонусы', 'Усиленное оружие', 'Доступ к арене']
  }
];

const newsItems = [
  {
    date: '10 октября 2025',
    title: 'Обновление сервера до версии 1.21.10',
    description: 'Новые биомы, мобы и возможности для исследования!'
  },
  {
    date: '5 октября 2025',
    title: 'Турнир PvP',
    description: 'Соревнуйтесь за звание лучшего бойца сервера и получите призы!'
  },
  {
    date: '1 октября 2025',
    title: 'Новый донат-пакет "Герцог"',
    description: 'Специальные привилегии для любителей приключений'
  }
];

const faqItems = [
  {
    question: 'Как зайти на сервер?',
    answer: 'Используйте IP адрес: pvpgrand.aternos.me в Minecraft клиенте'
  },
  {
    question: 'Какая версия Minecraft поддерживается?',
    answer: 'Сервер работает на версии 1.14.1'
  },
  {
    question: 'Как получить донат после оплаты?',
    answer: 'Привилегии активируются автоматически в течение 5 минут после покупки'
  },
  {
    question: 'Можно ли вернуть донат?',
    answer: 'Возврат возможен в течение 24 часов, если привилегии не были использованы'
  }
];

const recentPurchases = [
  { username: 'Steve_Pro', tier: 'Король', time: '2 минуты назад' },
  { username: 'Alex_228', tier: 'Демон', time: '5 минут назад' },
  { username: 'Herobrine', tier: 'Изумруд', time: '12 минут назад' },
  { username: 'Notch_Fan', tier: 'Дьявол', time: '18 минут назад' },
  { username: 'CreeperKing', tier: 'Король', time: '25 минут назад' }
];

export default function Index() {
  const [selectedDonation, setSelectedDonation] = useState<DonationTier | null>(null);
  const [username, setUsername] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHostingDialogOpen, setIsHostingDialogOpen] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverVersion, setServerVersion] = useState('1.20.1');
  const [serverIp, setServerIp] = useState('');
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!username.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите ваш ник',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDonation) return;

    const botUsername = 'EmeraldworldBot';
    const serverName = 'Pvpgrand';
    const orderData = `${serverName}_${selectedDonation.id}_${username.trim()}_${selectedDonation.price}`;
    const telegramUrl = `https://t.me/${botUsername}?start=${encodeURIComponent(orderData)}`;
    
    window.open(telegramUrl, '_blank');
    
    toast({
      title: 'Переход в Telegram',
      description: 'Завершите оплату в Telegram боте'
    });
    
    setIsDialogOpen(false);
    setUsername('');
    setSelectedDonation(null);
  };

  const handlePurchaseOld = async () => {
    if (!username.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите ваш ник',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDonation) return;

    setIsProcessing(true);

    try {
      const response = await fetch('https://functions.poehali.dev/da8b0bfe-1e90-42ee-ac51-e8e25a4eca5e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          donation_name: selectedDonation.name,
          price: selectedDonation.price,
          return_url: window.location.origin
        })
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        await fetch('https://functions.poehali.dev/8528e965-2bc1-4cf3-9250-ff413c696847', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            donation_name: selectedDonation.name,
            price: selectedDonation.price
          })
        });

        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать платёж. Попробуйте позже.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при создании платежа',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreateServer = async () => {
    if (!serverName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название сервера',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingServer(true);
    
    try {
      const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
      localStorage.setItem('userId', userId);

      const response = await fetch('https://functions.poehali.dev/d87fe1d9-863c-4e8d-aad0-24c39fe29d1e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          serverName: serverName,
          serverVersion: serverVersion,
          serverIp: serverIp || 'localhost'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: '🎉 Сервер создан!',
          description: 'Перенаправляем в панель управления...',
          duration: 3000
        });
        
        setIsHostingDialogOpen(false);
        setServerName('');
        setServerIp('');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        throw new Error(data.error || 'Ошибка создания сервера');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать сервер',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingServer(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 to-blue-900 border-b border-purple-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Icon name="Gamepad2" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pvpgrand</h1>
              <p className="text-xs text-gray-300">Minecraft Server</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('donations')} className="text-gray-200 hover:text-white transition-colors">
              Донаты
            </button>
            <button onClick={() => scrollToSection('news')} className="text-gray-200 hover:text-white transition-colors">
              Новости
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-200 hover:text-white transition-colors">
              FAQ
            </button>
            <Dialog open={isHostingDialogOpen} onOpenChange={setIsHostingDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-0">
                  <Icon name="Server" size={18} className="mr-2" />
                  Создать свой сервер
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Создать Minecraft сервер</DialogTitle>
                  <DialogDescription>
                    Создайте свой собственный Minecraft сервер с хостингом донатов
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-name">Название сервера</Label>
                    <Input
                      id="server-name"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="MyAwesomeServer"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-ip">IP адрес сервера (опционально)</Label>
                    <Input
                      id="server-ip"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      placeholder="play.myserver.com"
                      className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-400">
                      Оставьте пустым, если хотите использовать тестовый режим
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="server-version">Версия Minecraft</Label>
                    <Input
                      id="server-version"
                      value={serverVersion}
                      onChange={(e) => setServerVersion(e.target.value)}
                      placeholder="1.20.1"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsHostingDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleCreateServer}
                    disabled={isCreatingServer}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isCreatingServer ? 'Создаём...' : 'Создать сервер'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 mb-6">
            <Icon name="Zap" size={16} />
            <span className="text-sm">Версия 1.14.1</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            Pvpgrand
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Лучший PvP сервер Minecraft. Присоединяйся к тысячам игроков!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-lg font-mono text-lg hover:scale-105 transition-transform cursor-pointer">
              <Icon name="Copy" size={20} className="inline mr-2" />
              pvpgrand.aternos.me
            </div>
          </div>
          <div className="flex flex-wrap gap-8 justify-center text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">1000+</div>
              <div className="text-gray-400">Игроков</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-gray-400">Онлайн</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">50ms</div>
              <div className="text-gray-400">Пинг</div>
            </div>
          </div>
        </div>
      </section>

      <section id="donations" className="py-20 bg-gradient-to-b from-black to-purple-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Донаты</h2>
            <p className="text-gray-400">Выберите привилегии для игры на сервере</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {donationTiers.map((tier) => (
              <Card key={tier.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Icon name={tier.icon} size={32} />
                  </div>
                  <CardTitle className="text-center text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-center">
                    {tier.discount && (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-gray-500 line-through">{tier.oldPrice}₽</span>
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">-{tier.discount}%</span>
                      </div>
                    )}
                    <div className="text-3xl font-bold text-white">{tier.price}₽</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icon name="Check" size={18} className="text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => {
                      setSelectedDonation(tier);
                      setIsDialogOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Купить
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Icon name="ShoppingBag" size={24} />
              Последние покупки
            </h3>
            <Icon name="TrendingUp" size={20} className="text-green-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentPurchases.map((purchase, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="User" size={16} className="text-purple-400" />
                  <span className="font-semibold text-sm">{purchase.username}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">купил {purchase.tier}</div>
                <div className="text-xs text-gray-500">{purchase.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="news" className="py-20 bg-gradient-to-b from-purple-900/10 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Новости</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {newsItems.map((item, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Icon name="Calendar" size={16} />
                    {item.date}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-gradient-to-b from-black to-purple-900/10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">FAQ</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:text-purple-400">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-purple-900 to-blue-900 border-t border-purple-500/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Gamepad2" size={24} />
            <span className="font-bold text-xl">Pvpgrand</span>
          </div>
          <Separator className="my-4 bg-purple-500/30" />
          <p className="text-gray-400 text-sm">© 2025 Pvpgrand. Все права защищены.</p>
        </div>
      </footer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl">Покупка {selectedDonation?.name}</DialogTitle>
            <DialogDescription>
              Введите ваш игровой ник для активации доната
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Игровой ник</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Steve_Pro"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            {selectedDonation && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Донат:</span>
                  <span className="font-bold">{selectedDonation.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Стоимость:</span>
                  <span className="font-bold text-purple-400">{selectedDonation.price}₽</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isProcessing ? 'Обработка...' : 'Перейти к оплате'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
