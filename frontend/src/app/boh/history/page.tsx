'use client';

import { useState, useEffect } from 'react';
import { History, Clock, CheckCircle, XCircle } from 'lucide-react';

interface OrderHistory {
  id: string;
  tableNumber: number;
  items: string[];
  total: number;
  status: 'completed' | 'cancelled';
  completedAt: string;
  duration: number; // в минутах
}

export default function BohHistoryPage() {
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Моковые данные для демонстрации
  useEffect(() => {
    const mockOrders: OrderHistory[] = [
      {
        id: '1',
        tableNumber: 5,
        items: ['Бургер с картошкой', 'Кока-кола'],
        total: 450,
        status: 'completed',
        completedAt: '2024-01-15T14:30:00Z',
        duration: 12
      },
      {
        id: '2',
        tableNumber: 3,
        items: ['Пицца Маргарита', 'Салат Цезарь'],
        total: 680,
        status: 'completed',
        completedAt: '2024-01-15T13:45:00Z',
        duration: 18
      },
      {
        id: '3',
        tableNumber: 7,
        items: ['Стейк', 'Вино'],
        total: 1200,
        status: 'cancelled',
        completedAt: '2024-01-15T12:20:00Z',
        duration: 5
      }
    ];
    setOrders(mockOrders);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'В процессе';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <History className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">История заказов</h1>
          </div>
          <p className="text-gray-300">Просмотр всех завершенных и отмененных заказов</p>
        </div>

        {/* Фильтры */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Фильтр по статусу */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Статус заказа
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              >
                <option value="all">Все заказы</option>
                <option value="completed">Завершенные</option>
                <option value="cancelled">Отмененные</option>
              </select>
            </div>

            {/* Фильтр по времени */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Период
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              >
                <option value="today">Сегодня</option>
                <option value="week">Эта неделя</option>
                <option value="month">Этот месяц</option>
              </select>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Завершенные</p>
                <p className="text-2xl font-bold text-white">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Отмененные</p>
                <p className="text-2xl font-bold text-white">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Среднее время</p>
                <p className="text-2xl font-bold text-white">
                  {orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.duration, 0) / orders.length) : 0} мин
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        <div className="bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              Заказы ({filteredOrders.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Заказы не найдены</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium text-white">
                            Стол #{order.tableNumber}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          {order.items.join(', ')}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span>Время: {formatDate(order.completedAt)}</span>
                          <span>Длительность: {order.duration} мин</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {order.total} ₽
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
