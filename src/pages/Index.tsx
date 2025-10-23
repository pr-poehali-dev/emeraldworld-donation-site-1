import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DonationTier {
  id: string;
  name: string;
  price: number;
  icon: string;
  features: string[];
  popular?: boolean;
  gradient: string;
}

const donationTiers: DonationTier[] = [
  {
    id: 'warrior',
    name: 'Воин',
    price: 15,
    icon: 'Sword',
    gradient: 'from-gray-600 to-gray-800',
    features: ['Боевые бонусы', 'Усиленное оружие', 'Доступ к арене']
  },
  {
    id: 'jester',
    name: 'Шут',
    price: 45,
    icon: 'Drama',
    gradient: 'from-purple-600 to-purple-800',
    features: ['/fly - полёт', '/kit pvp - боевой набор', '/setwarp 5 - установка точек телепортации']
  },
  {
    id: 'king',
    name: 'Король',
    price: 59,
    icon: 'Crown',
    gradient: 'from-yellow-600 to-orange-700',
    popular: true,
    features: ['Приватная зона', 'Уникальный префикс', 'Доступ к VIP командам']
  },
  {
    id: 'demon',
    name: 'Демон',
    price: 69,
    icon: 'Flame',
    gradient: 'from-red-600 to-red-800',
    features: ['Огненные эффекты', 'Демонический скин', 'Особые способности']
  },
  {
    id: 'duke',
    name: 'Герцог',
    price: 90,
    icon: 'Castle',
    gradient: 'from-blue-600 to-blue-800',
    features: ['Все функции донатов Шут и Воин', 'Дополнительные привилегии', 'Особый статус на сервере']
  }
];

export default function Index() {
  const [selectedDonation, setSelectedDonation] = useState<DonationTier | null>(null);
  const [username, setUsername] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    const serverName = 'Agerapvpclub';
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Icon name="Gamepad2" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Agerapvpclub
              </h1>
              <p className="text-xs text-gray-400">Minecraft Server</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('donations')} className="text-gray-300 hover:text-purple-400 transition-colors">
              Донаты
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-purple-400 transition-colors">
              О сервере
            </button>
            <button onClick={() => scrollToSection('stats')} className="text-gray-300 hover:text-purple-400 transition-colors">
              Статистика
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMjgsMCwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Icon name="Zap" size={16} className="text-purple-400" />
            <span className="text-sm text-purple-300">Версия 1.14.1</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
            Agerapvpclub
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Лучший PvP сервер Minecraft. Присоединяйся к тысячам игроков и докажи свою силу в битве!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform cursor-pointer">
                <Icon name="Copy" size={20} className="inline mr-2" />
                pvpgrand.aternos.me
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 justify-center text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-6 border border-purple-500/20">
              <div className="text-4xl font-bold text-purple-400 mb-2">1000+</div>
              <div className="text-gray-400 text-sm">Активных игроков</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-6 border border-purple-500/20">
              <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Работа сервера</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-6 border border-purple-500/20">
              <div className="text-4xl font-bold text-blue-400 mb-2">50ms</div>
              <div className="text-gray-400 text-sm">Средний пинг</div>
            </div>
          </div>
        </div>
      </section>

      <section id="donations" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Донаты
            </h2>
            <p className="text-gray-400 text-lg">Выберите привилегии для игры на сервере</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {donationTiers.map((tier) => (
              <div key={tier.id} className="relative group">
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      ⭐ Популярно
                    </div>
                  </div>
                )}
                
                <Card className={`h-full bg-gradient-to-br ${tier.gradient} border-0 shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden ${tier.popular ? 'ring-2 ring-yellow-500' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon name={tier.icon} size={40} className="text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-2">{tier.name}</CardTitle>
                    <div className="text-4xl font-black text-white mb-1">{tier.price}₽</div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-white/90">
                        <Icon name="Check" size={18} className="flex-shrink-0 mt-0.5 text-green-300" />
                        <span className="text-sm leading-tight">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button
                      onClick={() => {
                        setSelectedDonation(tier);
                        setIsDialogOpen(true);
                      }}
                      className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-6 text-lg shadow-xl"
                    >
                      Купить
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              О сервере
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Swords" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">PvP Режим</h3>
                <p className="text-gray-300 leading-relaxed">
                  Сражайтесь с другими игроками на специальных аренах. Улучшайте навыки и поднимайтесь в рейтинге.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Users" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Дружное комьюнити</h3>
                <p className="text-gray-300 leading-relaxed">
                  Тысячи активных игроков ежедневно. Найдите друзей и создавайте команды для совместной игры.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Shield" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Стабильность</h3>
                <p className="text-gray-300 leading-relaxed">
                  Сервер работает 24/7 без перебоев. Мощное оборудование и защита от DDoS атак.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Sparkles" size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Уникальные возможности</h3>
                <p className="text-gray-300 leading-relaxed">
                  Эксклюзивные донаты, специальные команды и привилегии для улучшения игрового опыта.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Присоединяйтесь сейчас
            </h2>
            <p className="text-gray-400 text-lg">Начните играть на Agerapvpclub уже сегодня</p>
          </div>
          
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/20">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 text-2xl font-mono bg-black/30 rounded-xl px-8 py-4">
                  <Icon name="Server" size={28} className="text-purple-400" />
                  <span className="text-white">pvpgrand.aternos.me</span>
                </div>
                <Separator className="bg-purple-500/20" />
                <div className="text-gray-300 space-y-2">
                  <p className="flex items-center justify-center gap-2">
                    <Icon name="Info" size={18} className="text-purple-400" />
                    Версия: <span className="font-bold text-white">1.14.1</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Скопируйте адрес и добавьте сервер в Minecraft
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black/40 backdrop-blur-sm border-t border-purple-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Icon name="Gamepad2" size={24} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white">Agerapvpclub</div>
                <div className="text-xs text-gray-400">Minecraft Server</div>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Правила</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Поддержка</a>
              <a href="https://t.me/Agerapvpclube" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors flex items-center gap-1">
                <Icon name="Send" size={16} />
                Telegram
              </a>
            </div>
          </div>
          
          <Separator className="my-6 bg-purple-500/20" />
          
          <div className="text-center text-sm text-gray-400">
            © 2025 Agerapvpclub. Все права защищены.
          </div>
        </div>
      </footer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Покупка {selectedDonation?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Введите ваш игровой ник для активации доната
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Игровой ник</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите ваш ник"
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            
            {selectedDonation && (
              <div className="bg-black/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Донат:</span>
                  <span className="font-bold text-white">{selectedDonation.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Стоимость:</span>
                  <span className="font-bold text-purple-300">{selectedDonation.price}₽</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="flex-1 border-purple-500/30 text-white hover:bg-white/10"
            >
              Отмена
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
            >
              Перейти к оплате
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
