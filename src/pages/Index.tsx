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
}

const donationTiers: DonationTier[] = [
  {
    id: 'king',
    name: 'Король',
    price: 99,
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
    id: 'emerald',
    name: 'Изумруд',
    price: 49,
    icon: 'Gem',
    features: ['Изумрудная броня', 'Бонус ресурсов', 'Доступ к изумрудному миру']
  },
  {
    id: 'devil',
    name: 'Дьявол',
    price: 29,
    icon: 'Skull',
    features: ['Тёмная аура', 'Ускоренный опыт', 'Особый инвентарь']
  },
  {
    id: 'test',
    name: 'Тестовый донат',
    price: 30,
    icon: 'TestTube',
    features: ['Тестовые привилегии', 'Для проверки системы']
  }
];

const newsItems = [
  {
    date: '10 октября 2025',
    title: 'Обновление сервера до версии 1.20',
    description: 'Новые биомы, мобы и возможности для исследования!'
  },
  {
    date: '5 октября 2025',
    title: 'Турнир PvP',
    description: 'Соревнуйтесь за звание лучшего бойца сервера и получите призы!'
  },
  {
    date: '1 октября 2025',
    title: 'Новый донат-пакет "Изумруд"',
    description: 'Специальные привилегии для любителей приключений'
  }
];

const faqItems = [
  {
    question: 'Как зайти на сервер?',
    answer: 'Используйте IP адрес: emeraldworld.aternos.me в Minecraft клиенте'
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

export default function Index() {
  const [selectedDonation, setSelectedDonation] = useState<DonationTier | null>(null);
  const [username, setUsername] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

    // Открываем Telegram бот с параметрами заказа
    const botUsername = 'EmeraldworldBot';
    const orderData = `${selectedDonation.id}_${username.trim()}_${selectedDonation.price}`;
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

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-emerald-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button onClick={() => scrollToSection('hero')} className="minecraft-text text-emerald-500 text-xl hover:text-emerald-400 transition-colors">
                EMERALDWORLD
              </button>
              <div className="hidden md:flex space-x-6">
                <button onClick={() => scrollToSection('hero')} className="hover:text-emerald-400 transition-colors">Главная</button>
                <button onClick={() => scrollToSection('donations')} className="hover:text-emerald-400 transition-colors">Донаты</button>
                <button onClick={() => scrollToSection('rules')} className="hover:text-emerald-400 transition-colors">Правила</button>
                <button onClick={() => scrollToSection('news')} className="hover:text-emerald-400 transition-colors">Новости</button>
                <button onClick={() => scrollToSection('faq')} className="hover:text-emerald-400 transition-colors">Вопросы и ответы</button>
                <button onClick={() => scrollToSection('contacts')} className="hover:text-emerald-400 transition-colors">Контакты</button>
              </div>
            </div>
            <Button onClick={() => scrollToSection('donations')} className="bg-emerald-600 hover:bg-emerald-700">
              Купить донат
            </Button>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-black to-black"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="minecraft-text text-5xl md:text-6xl font-black mb-4 animate-fade-in">
            <span className="text-black bg-clip-text" style={{
              WebkitTextStroke: '3px #059669',
              paintOrder: 'stroke fill'
            }}>EMERALD</span>
            <span className="text-black bg-clip-text" style={{
              WebkitTextStroke: '3px #059669',
              paintOrder: 'stroke fill'
            }}>WORLD</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-400 mb-6 animate-fade-in font-semibold">
            Лучший Minecraft сервер с уникальными возможностями
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
            <Button onClick={() => scrollToSection('donations')} className="bg-emerald-600 hover:bg-emerald-700 px-6">
              <Icon name="Gem" className="mr-2" size={18} />
              Донаты
            </Button>
            <Button variant="outline" onClick={() => scrollToSection('rules')} className="border-emerald-600 text-emerald-400 hover:bg-emerald-950 px-6">
              Правила сервера
            </Button>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border border-emerald-700 rounded">
            <Icon name="Server" className="text-emerald-400" size={18} />
            <span className="text-emerald-400 font-semibold text-sm">IP: emeraldworld.aternos.me</span>
          </div>
        </div>
      </section>

      <section id="donations" className="py-12 bg-gradient-to-b from-black to-emerald-950/20">
        <div className="container mx-auto px-4">
          <h2 className="minecraft-text text-3xl md:text-4xl text-center mb-3 text-emerald-400">ДОНАТЫ</h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">
            Поддержите сервер и получите уникальные привилегии
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {donationTiers.map((tier) => (
              <Card key={tier.id} className="bg-gradient-to-b from-emerald-950/50 to-black border-emerald-700 hover:border-emerald-500 transition-all hover:scale-105">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Icon name={tier.icon as any} size={24} className="text-white" />
                  </div>
                  <CardTitle className="minecraft-text text-xl text-emerald-400">{tier.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-white mt-2">{tier.price}₽</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Icon name="Check" size={14} className="text-emerald-400 mt-1 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Dialog open={isDialogOpen && selectedDonation?.id === tier.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedDonation(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setSelectedDonation(tier)}
                      >
                        Купить
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border-emerald-700">
                      <DialogHeader>
                        <DialogTitle className="minecraft-text text-emerald-400">Покупка доната {tier.name}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Стоимость: {tier.price}₽
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-emerald-400">Ваш игровой ник</Label>
                          <Input
                            id="username"
                            placeholder="Steve"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-emerald-950/30 border-emerald-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-400">Выбранный донат</Label>
                          <div className="p-3 bg-emerald-950/30 border border-emerald-700 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center">
                                <Icon name={tier.icon as any} size={20} className="text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{tier.name}</p>
                                <p className="text-sm text-gray-400">{tier.price}₽</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handlePurchase} 
                        disabled={isProcessing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isProcessing ? 'Обработка...' : 'Перейти к оплате'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="rules" className="py-12 bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="minecraft-text text-3xl md:text-4xl text-center mb-8 text-emerald-400">ПРАВИЛА</h2>
          
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                  <Icon name="Shield" size={20} />
                  1. Уважение к игрокам
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                Запрещены оскорбления, угрозы и любые формы дискриминации. Будьте вежливы и дружелюбны.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                  <Icon name="Ban" size={20} />
                  2. Читы и моды
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                Использование читов, X-Ray и других запрещенных модификаций карается перманентным баном.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                  <Icon name="Home" size={20} />
                  3. Гриферство
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                Разрушение чужих построек без разрешения строго запрещено. Используйте приват для защиты территории.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                  <Icon name="MessageSquare" size={20} />
                  4. Спам и реклама
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                Запрещен спам в чате и реклама сторонних серверов. За нарушение - мут или бан.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                  <Icon name="Bug" size={20} />
                  5. Баги и эксплойты
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                Использование багов для получения преимущества запрещено. Обо всех найденных багах сообщайте администрации.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="news" className="py-12 bg-gradient-to-b from-black to-emerald-950/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="minecraft-text text-3xl md:text-4xl text-center mb-8 text-emerald-400">НОВОСТИ</h2>
          
          <div className="space-y-6">
            {newsItems.map((item, idx) => (
              <Card key={idx} className="bg-gradient-to-r from-emerald-950/50 to-black border-emerald-700 hover:border-emerald-500 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-emerald-400 mb-2 text-base">{item.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">{item.description}</CardDescription>
                    </div>
                    <div className="text-xs text-emerald-500 whitespace-nowrap">
                      <Icon name="Calendar" size={12} className="inline mr-1" />
                      {item.date}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="minecraft-text text-3xl md:text-4xl text-center mb-8 text-emerald-400">ВОПРОСЫ И ОТВЕТЫ</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-emerald-700 rounded-lg px-6 bg-emerald-950/30">
                <AccordionTrigger className="text-emerald-400 hover:text-emerald-300 text-sm">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-sm">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contacts" className="py-12 bg-gradient-to-b from-black to-emerald-950/20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="minecraft-text text-3xl md:text-4xl mb-8 text-emerald-400">КОНТАКТЫ</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-b from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <div className="mx-auto w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-2">
                  <Icon name="Mail" size={20} />
                </div>
                <CardTitle className="text-emerald-400 text-base">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">support@emeraldworld.ru</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <div className="mx-auto w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-2">
                  <Icon name="MessageCircle" size={20} />
                </div>
                <CardTitle className="text-emerald-400 text-base">Discord</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">discord.gg/emeraldworld</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-emerald-950/50 to-black border-emerald-700">
              <CardHeader>
                <div className="mx-auto w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-2">
                  <Icon name="Send" size={20} />
                </div>
                <CardTitle className="text-emerald-400 text-base">Telegram</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">@emeraldworld</p>
              </CardContent>
            </Card>
          </div>

          <Separator className="bg-emerald-700 my-8" />

          <p className="text-gray-400 text-sm">
            © 2025 EmeraldWorld. Все права защищены.
          </p>
        </div>
      </section>
    </div>
  );
}