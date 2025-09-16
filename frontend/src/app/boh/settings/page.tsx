'use client';

import { useState } from 'react';
import { Settings, Save, Bell, Clock, Users, ChefHat } from 'lucide-react';

export default function BohSettingsPage() {
  const [settings, setSettings] = useState({
    // Уведомления
    soundEnabled: true,
    notificationVolume: 70,
    newOrderSound: true,
    orderReadySound: true,
    
    // Таймеры
    defaultPrepTime: 15,
    warningTime: 5,
    autoCompleteTime: 30,
    
    // Интерфейс
    autoRefresh: true,
    refreshInterval: 5,
    showTableNumbers: true,
    showOrderTime: true,
    
    // Кухня
    maxConcurrentOrders: 10,
    autoAssignChef: false,
    requireConfirmation: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Здесь будет API вызов для сохранения настроек
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Показать уведомление об успешном сохранении
  };

  const SettingCard = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="h-6 w-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Настройки BOH</h1>
          </div>
          <p className="text-gray-300">Настройте параметры работы кухни и уведомлений</p>
        </div>

        <div className="space-y-6">
          {/* Уведомления */}
          <SettingCard title="Уведомления" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Включить звук</label>
                  <p className="text-sm text-gray-400">Звуковые уведомления для новых заказов</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Громкость уведомлений: {settings.notificationVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.notificationVolume}
                  onChange={(e) => handleSettingChange('notificationVolume', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Звук нового заказа</label>
                  <p className="text-sm text-gray-400">Уведомление при поступлении нового заказа</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.newOrderSound}
                  onChange={(e) => handleSettingChange('newOrderSound', e.target.checked)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Звук готового заказа</label>
                  <p className="text-sm text-gray-400">Уведомление когда заказ готов к подаче</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.orderReadySound}
                  onChange={(e) => handleSettingChange('orderReadySound', e.target.checked)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
              </div>
            </div>
          </SettingCard>

          {/* Таймеры */}
          <SettingCard title="Таймеры" icon={Clock}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Время приготовления по умолчанию (минуты)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.defaultPrepTime}
                  onChange={(e) => handleSettingChange('defaultPrepTime', parseInt(e.target.value))}
                  className="border border-gray-600 rounded-md px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Время предупреждения (минуты)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.warningTime}
                  onChange={(e) => handleSettingChange('warningTime', parseInt(e.target.value))}
                  className="border border-gray-600 rounded-md px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Автозавершение заказа (минуты)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.autoCompleteTime}
                  onChange={(e) => handleSettingChange('autoCompleteTime', parseInt(e.target.value))}
                  className="border border-gray-600 rounded-md px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>
            </div>
          </SettingCard>

          {/* Интерфейс */}
          <SettingCard title="Интерфейс" icon={Users}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Автообновление</label>
                  <p className="text-sm text-gray-400">Автоматически обновлять данные</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Интервал обновления (секунды)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                  className="border border-gray-600 rounded-md px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Показывать номера столов</label>
                  <p className="text-sm text-gray-400">Отображать номера столов в списке заказов</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showTableNumbers}
                  onChange={(e) => handleSettingChange('showTableNumbers', e.target.checked)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Показывать время заказа</label>
                  <p className="text-sm text-gray-400">Отображать время поступления заказа</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showOrderTime}
                  onChange={(e) => handleSettingChange('showOrderTime', e.target.checked)}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
              </div>
            </div>
          </SettingCard>

          {/* Кухня */}
          <SettingCard title="Кухня" icon={ChefHat}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимум одновременных заказов
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxConcurrentOrders}
                  onChange={(e) => handleSettingChange('maxConcurrentOrders', parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Автоназначение повара</label>
                  <p className="text-sm text-gray-500">Автоматически назначать повара на заказы</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAssignChef}
                  onChange={(e) => handleSettingChange('autoAssignChef', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Требовать подтверждение</label>
                  <p className="text-sm text-gray-500">Требовать подтверждение перед завершением заказа</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireConfirmation}
                  onChange={(e) => handleSettingChange('requireConfirmation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </SettingCard>
        </div>

        {/* Кнопка сохранения */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </div>
  );
}
