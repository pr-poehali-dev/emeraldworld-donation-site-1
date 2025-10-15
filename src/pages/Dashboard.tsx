import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Server {
  serverId: string;
  serverName: string;
  version: string;
  status: 'running' | 'stopped' | 'starting';
  ip: string;
  port: number;
  maxPlayers: number;
  onlinePlayers: number;
  createdAt: string;
  plugins: string[];
}

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://functions.poehali.dev/97ba201c-8175-49fe-9619-40c98f6f1764', {
        method: 'GET',
        headers: {
          'X-User-Id': userId
        }
      });

      const data = await response.json();
      if (response.ok && data.servers) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('Error loading servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerAction = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    setServers(prev => prev.map(server => 
      server.serverId === serverId 
        ? { ...server, status: action === 'stop' ? 'stopped' : 'starting' as any }
        : server
    ));

    try {
      const response = await fetch('https://functions.poehali.dev/97ba201c-8175-49fe-9619-40c98f6f1764', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serverId: serverId,
          action: action
        })
      });

      const data = await response.json();
      if (response.ok) {
        setServers(prev => prev.map(server => 
          server.serverId === serverId 
            ? { ...server, status: data.newStatus as any }
            : server
        ));
        
        toast({
          title: 'Успешно!',
          description: `Сервер ${action === 'stop' ? 'остановлен' : action === 'restart' ? 'перезапущен' : 'запущен'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить действие',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/97ba201c-8175-49fe-9619-40c98f6f1764?serverId=${serverId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const newServers = servers.filter(s => s.serverId !== serverId);
        setServers(newServers);
        
        toast({
          title: 'Сервер удалён',
          description: 'Сервер успешно удалён',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сервер',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Скопировано!',
        description: 'IP адрес скопирован в буфер обмена',
      });
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: 'Скопировано!',
          description: 'IP адрес скопирован в буфер обмена',
        });
      } catch (execErr) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось скопировать. Попробуйте вручную.',
          variant: 'destructive'
        });
      }
      document.body.removeChild(textArea);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-emerald-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="minecraft-text text-emerald-500 text-xl hover:text-emerald-400 transition-colors">
              EMERALDWORLD
            </a>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                <Icon name="Server" size={14} className="mr-1" />
                {servers.length} серверов
              </Badge>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-950">
                На главную
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="minecraft-text text-4xl text-emerald-400 mb-2">МОИ СЕРВЕРА</h1>
          <p className="text-gray-400">Управляйте своими Minecraft серверами</p>
        </div>

        {servers.length === 0 ? (
          <Card className="bg-gradient-to-b from-emerald-950/30 to-black border-emerald-700 text-center py-12">
            <CardContent>
              <Icon name="ServerOff" className="mx-auto text-emerald-600 mb-4" size={64} />
              <h3 className="text-xl text-emerald-400 mb-2">У вас пока нет серверов</h3>
              <p className="text-gray-400 mb-6">Создайте свой первый Minecraft сервер</p>
              <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700">
                <Icon name="Plus" className="mr-2" size={18} />
                Создать сервер
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {servers.map((server) => (
              <Card key={server.serverId} className="bg-gradient-to-br from-emerald-950/50 to-black border-emerald-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-emerald-400 text-xl mb-2">{server.serverName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge 
                          variant={server.status === 'running' ? 'default' : 'secondary'}
                          className={server.status === 'running' ? 'bg-green-600' : server.status === 'starting' ? 'bg-yellow-600' : 'bg-gray-600'}
                        >
                          {server.status === 'running' ? '🟢 Запущен' : server.status === 'starting' ? '🟡 Запускается' : '🔴 Остановлен'}
                        </Badge>
                        <span className="text-gray-400">v{server.version}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-emerald-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">IP адрес:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${server.ip}:${server.port}`)}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Копировать
                      </Button>
                    </div>
                    <p className="font-mono text-emerald-300 text-lg">{server.ip}:{server.port}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-800/50">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Icon name="Users" size={14} />
                        Онлайн
                      </div>
                      <p className="text-emerald-400 text-xl font-bold">{server.onlinePlayers}/{server.maxPlayers}</p>
                    </div>
                    <div className="bg-emerald-950/30 rounded-lg p-3 border border-emerald-800/50">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Icon name="Package" size={14} />
                        Плагины
                      </div>
                      <p className="text-emerald-400 text-xl font-bold">{server.plugins.length}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {server.status === 'running' ? (
                      <>
                        <Button
                          onClick={() => handleServerAction(server.serverId, 'stop')}
                          variant="outline"
                          className="flex-1 border-red-600 text-red-400 hover:bg-red-950"
                          size="sm"
                        >
                          <Icon name="Square" size={14} className="mr-1" />
                          Остановить
                        </Button>
                        <Button
                          onClick={() => handleServerAction(server.serverId, 'restart')}
                          variant="outline"
                          className="flex-1 border-yellow-600 text-yellow-400 hover:bg-yellow-950"
                          size="sm"
                        >
                          <Icon name="RefreshCw" size={14} className="mr-1" />
                          Перезапуск
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleServerAction(server.serverId, 'start')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        <Icon name="Play" size={14} className="mr-1" />
                        Запустить
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteServer(server.serverId)}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                      size="sm"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">Установленные плагины:</p>
                    <div className="flex flex-wrap gap-1">
                      {server.plugins.map((plugin, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-emerald-950/50 text-emerald-400 border-emerald-800 text-xs">
                          {plugin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}