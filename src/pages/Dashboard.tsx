import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const availablePlugins = [
  { name: 'EssentialsX', description: 'Основные команды и функции' },
  { name: 'WorldEdit', description: 'Редактирование мира' },
  { name: 'CoreProtect', description: 'Защита от гриферов' },
  { name: 'Vault', description: 'Экономика сервера' },
  { name: 'LuckPerms', description: 'Управление правами' },
  { name: 'WorldGuard', description: 'Защита регионов' },
  { name: 'Citizens', description: 'NPC персонажи' },
  { name: 'mcMMO', description: 'RPG навыки' },
  { name: 'Multiverse', description: 'Множество миров' },
  { name: 'ChestShop', description: 'Магазины игроков' }
];

export default function Dashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [newIp, setNewIp] = useState('');
  const [pluginsServer, setPluginsServer] = useState<Server | null>(null);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
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

  const handleUpdateIp = async () => {
    if (!editingServer || !newIp) return;

    try {
      const response = await fetch('https://functions.poehali.dev/97ba201c-8175-49fe-9619-40c98f6f1764', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serverId: editingServer.serverId,
          newIp: newIp
        })
      });

      const data = await response.json();
      if (response.ok) {
        setServers(prev => prev.map(server => 
          server.serverId === editingServer.serverId
            ? { ...server, ip: newIp }
            : server
        ));
        
        toast({
          title: 'IP обновлён!',
          description: `Новый адрес: ${newIp}:${editingServer.port}`,
        });
        
        setEditingServer(null);
        setNewIp('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить IP',
        variant: 'destructive'
      });
    }
  };

  const handleOpenPluginsMenu = (server: Server) => {
    setPluginsServer(server);
    setSelectedPlugins(server.plugins);
  };

  const handleTogglePlugin = (pluginName: string) => {
    setSelectedPlugins(prev => 
      prev.includes(pluginName)
        ? prev.filter(p => p !== pluginName)
        : [...prev, pluginName]
    );
  };

  const handleSavePlugins = async () => {
    if (!pluginsServer) return;

    setServers(prev => prev.map(server => 
      server.serverId === pluginsServer.serverId
        ? { ...server, plugins: selectedPlugins }
        : server
    ));
    
    toast({
      title: 'Плагины обновлены!',
      description: `Установлено плагинов: ${selectedPlugins.length}`,
    });
    
    setPluginsServer(null);
    setSelectedPlugins([]);
  };

  const handlePlayServer = async (server: Server) => {
    if (server.status !== 'running') {
      toast({
        title: 'Запуск сервера...',
        description: 'Пожалуйста, подождите',
      });
      await handleServerAction(server.serverId, 'start');
      
      setTimeout(() => {
        copyToClipboard(`${server.ip}:${server.port}`);
        toast({
          title: 'Сервер запущен!',
          description: 'IP скопирован. Открой Minecraft и подключись!',
          duration: 10000
        });
      }, 2000);
    } else {
      copyToClipboard(`${server.ip}:${server.port}`);
      toast({
        title: 'Готово к игре!',
        description: 'IP скопирован. Открой Minecraft и подключись!',
        duration: 10000
      });
    }
  };

  const handleDownloadServer = (server: Server) => {
    const serverProperties = `#Minecraft server properties
server-port=${server.port}
max-players=${server.maxPlayers}
motd=${server.serverName}
gamemode=survival
difficulty=normal
pvp=true
online-mode=true
white-list=false
spawn-protection=16
level-name=world
view-distance=10
enable-command-block=false
`;

    const eulaTxt = `#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
eula=true
`;

    const startBat = `@echo off
title ${server.serverName}
java -Xmx2048M -Xms1024M -jar server.jar nogui
pause
`;

    const startSh = `#!/bin/bash
java -Xmx2048M -Xms1024M -jar server.jar nogui
`;

    const readmeTxt = `=== ${server.serverName} ===

Инструкция по запуску:

1. Скачайте server.jar для версии ${server.version} с официального сайта Minecraft
2. Поместите server.jar в эту папку

Windows:
- Убедитесь что установлена Java 17+
- Запустите start.bat

Linux/Mac:
- Сделайте start.sh исполняемым: chmod +x start.sh
- Запустите: ./start.sh

После первого запуска:
- Сервер создаст мир
- IP для подключения: ${server.ip}:${server.port}
- Чтобы друзья могли подключиться, откройте порт ${server.port}

Настройки сервера в файле server.properties
Плагины установите в папку plugins/
`;

    const zip = `PK\x03\x04server.properties${serverProperties}eula.txt${eulaTxt}start.bat${startBat}start.sh${startSh}README.txt${readmeTxt}`;
    
    const blob = new Blob([
      `server.properties:\n${serverProperties}\n\n`,
      `eula.txt:\n${eulaTxt}\n\n`,
      `start.bat:\n${startBat}\n\n`,
      `start.sh:\n${startSh}\n\n`,
      `README.txt:\n${readmeTxt}`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${server.serverName.replace(/\s+/g, '_')}_config.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Конфиги скачаны!',
      description: 'Следуйте инструкциям в README.txt',
      duration: 5000
    });
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
                  <Button
                    onClick={() => handlePlayServer(server)}
                    disabled={server.status === 'starting'}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-6 text-lg"
                  >
                    {server.status === 'starting' ? (
                      <>
                        <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                        Запуск...
                      </>
                    ) : server.status === 'running' ? (
                      <>
                        <Icon name="Gamepad2" className="mr-2" size={20} />
                        🎮 ИГРАТЬ СЕЙЧАС
                      </>
                    ) : (
                      <>
                        <Icon name="Play" className="mr-2" size={20} />
                        ЗАПУСТИТЬ И ИГРАТЬ
                      </>
                    )}
                  </Button>

                  <div className="bg-black/50 rounded-lg p-4 border border-emerald-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">IP адрес:</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingServer(server);
                            setNewIp(server.ip);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Icon name="Edit" size={14} className="mr-1" />
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${server.ip}:${server.port}`)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <Icon name="Copy" size={14} className="mr-1" />
                          Копировать
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadServer(server)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <Icon name="Download" size={14} className="mr-1" />
                          Скачать
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-emerald-300 text-lg">{server.ip}:{server.port}</p>
                  </div>

                  {server.status === 'running' && (
                    <div className="bg-green-950/30 border border-green-700 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Icon name="Info" size={16} className="text-green-400 mt-0.5" />
                        <div>
                          <p className="text-green-400 text-sm font-semibold mb-1">Как подключиться:</p>
                          <ol className="text-xs text-gray-300 space-y-1">
                            <li>1. Нажми кнопку "ИГРАТЬ СЕЙЧАС" (IP скопируется)</li>
                            <li>2. Открой Minecraft {server.version}</li>
                            <li>3. Сетевая игра → Прямое подключение</li>
                            <li>4. Вставь IP и нажми "Подключиться"</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}

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
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Установленные плагины:</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenPluginsMenu(server)}
                        className="text-emerald-400 hover:text-emerald-300 h-6"
                      >
                        <Icon name="Settings" size={14} className="mr-1" />
                        Управление
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {server.plugins.length > 0 ? (
                        server.plugins.map((plugin, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-emerald-950/50 text-emerald-400 border-emerald-800 text-xs">
                            {plugin}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-gray-600">Плагины не установлены</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingServer} onOpenChange={() => {
        setEditingServer(null);
        setNewIp('');
      }}>
        <DialogContent className="bg-gradient-to-br from-emerald-950 to-black border-emerald-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Изменить IP адрес</DialogTitle>
            <DialogDescription className="text-gray-400">
              Введите новый IP адрес для сервера {editingServer?.serverName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ip" className="text-emerald-300">Новый IP адрес</Label>
              <Input
                id="ip"
                placeholder="Например: 192.168.1.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="bg-black border-emerald-700 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500">
                Порт останется прежним: {editingServer?.port}
              </p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Текущий адрес:</p>
              <p className="font-mono text-emerald-300">{editingServer?.ip}:{editingServer?.port}</p>
            </div>
            <div className="bg-blue-950/30 border border-blue-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Новый адрес будет:</p>
              <p className="font-mono text-blue-300">{newIp || '___'}:{editingServer?.port}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingServer(null);
                setNewIp('');
              }}
              className="border-gray-600 text-gray-400"
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdateIp}
              disabled={!newIp || newIp === editingServer?.ip}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pluginsServer} onOpenChange={() => {
        setPluginsServer(null);
        setSelectedPlugins([]);
      }}>
        <DialogContent className="bg-gradient-to-br from-emerald-950 to-black border-emerald-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-2">
              <Icon name="Package" size={24} />
              Управление плагинами
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {pluginsServer?.serverName} - Выберите плагины для установки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-emerald-950/30 border border-emerald-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">Выбрано плагинов: <span className="text-emerald-400 font-bold">{selectedPlugins.length}</span></p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {availablePlugins.map((plugin) => {
                const isSelected = selectedPlugins.includes(plugin.name);
                return (
                  <div
                    key={plugin.name}
                    onClick={() => handleTogglePlugin(plugin.name)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-600'
                        : 'bg-black/50 border-emerald-900 hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-600'
                          }`}>
                            {isSelected && <Icon name="Check" size={14} className="text-white" />}
                          </div>
                          <h4 className="text-emerald-300 font-semibold">{plugin.name}</h4>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 ml-7">{plugin.description}</p>
                      </div>
                      {isSelected && (
                        <Badge className="bg-emerald-600 text-white ml-2">
                          Установлен
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPluginsServer(null);
                setSelectedPlugins([]);
              }}
              className="border-gray-600 text-gray-400"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSavePlugins}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Установить плагины ({selectedPlugins.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}