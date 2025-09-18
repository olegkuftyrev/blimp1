'use client';

import { useState } from 'react';
import { Settings, Save, Bell, Clock, Users, ChefHat } from 'lucide-react';

export default function BohSettingsPage() {
  const [settings, setSettings] = useState({
    // Notifications
    soundEnabled: true,
    notificationVolume: 70,
    newOrderSound: true,
    orderReadySound: true,
    
    // Timers
    defaultPrepTime: 15,
    warningTime: 5,
    autoCompleteTime: 30,
    
    // Interface
    autoRefresh: true,
    refreshInterval: 5,
    showTableNumbers: true,
    showOrderTime: true,
    
    // Kitchen
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
    // Here will be API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success notification
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">BOH Settings</h1>
          </div>
          <p className="text-gray-300">Configure kitchen and notification settings</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <SettingCard title="Notifications" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Enable Sound</label>
                  <p className="text-sm text-gray-400">Sound notifications for new orders</p>
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
                  Notification Volume: {settings.notificationVolume}%
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
                  <label className="text-sm font-medium text-gray-300">New Order Sound</label>
                  <p className="text-sm text-gray-400">Notification when new order arrives</p>
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
                  <label className="text-sm font-medium text-gray-300">Ready Order Sound</label>
                  <p className="text-sm text-gray-400">Notification when order is ready to serve</p>
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

          {/* Timers */}
          <SettingCard title="Timers" icon={Clock}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Cooking Time (minutes)
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
                  Warning Time (minutes)
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
                  Auto-complete Order (minutes)
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

          {/* Interface */}
          <SettingCard title="Interface" icon={Users}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-300">Auto Refresh</label>
                  <p className="text-sm text-gray-400">Automatically refresh data</p>
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
                  Refresh Interval (seconds)
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
                  <label className="text-sm font-medium text-gray-300">Show Table Numbers</label>
                  <p className="text-sm text-gray-400">Display table numbers in order list</p>
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
                  <label className="text-sm font-medium text-gray-300">Show Order Time</label>
                  <p className="text-sm text-gray-400">Display order arrival time</p>
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

          {/* Kitchen */}
          <SettingCard title="Kitchen" icon={ChefHat}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Concurrent Orders
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
                  <label className="text-sm font-medium text-gray-700">Auto-assign Chef</label>
                  <p className="text-sm text-gray-500">Automatically assign chef to orders</p>
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
                  <label className="text-sm font-medium text-gray-700">Require Confirmation</label>
                  <p className="text-sm text-gray-500">Require confirmation before completing order</p>
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

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
