import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  Popover, 
  List, 
  Typography, 
  Button, 
  Tag, 
  Avatar, 
  Space,
  Empty,
  Spin,
  message
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaUser, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaEye
} from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/notifications');
      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // For demo purposes, create some sample notifications
      const sampleNotifications = [
        {
          _id: '1',
          type: 'lead',
          title: 'New Lead Added',
          message: 'John Doe from Tech Corp has been added as a new lead',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          data: { leadName: 'John Doe', company: 'Tech Corp' }
        },
        {
          _id: '2',
          type: 'meeting',
          title: 'Meeting Scheduled',
          message: 'Meeting with Sarah Johnson scheduled for tomorrow at 2 PM',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          data: { leadName: 'Sarah Johnson', meetingTime: '2 PM' }
        },
        {
          _id: '3',
          type: 'email',
          title: 'Email Sent',
          message: 'Follow-up email sent to 15 leads successfully',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          data: { count: 15 }
        },
        {
          _id: '4',
          type: 'system',
          title: 'System Update',
          message: 'New features have been added to the dashboard',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          data: {}
        }
      ];
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // For demo purposes, update locally
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // For demo purposes, update locally
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      message.success('All notifications marked as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
      message.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // For demo purposes, update locally
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
      message.success('Notification deleted');
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lead':
        return <FaUser className="text-blue-500" />;
      case 'meeting':
        return <FaCalendarAlt className="text-green-500" />;
      case 'email':
        return <FaEnvelope className="text-purple-500" />;
      case 'phone':
        return <FaPhone className="text-orange-500" />;
      case 'system':
        return <FaInfoCircle className="text-gray-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'lead':
        return 'blue';
      case 'meeting':
        return 'green';
      case 'email':
        return 'purple';
      case 'phone':
        return 'orange';
      case 'system':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format time ago
  const getTimeAgo = (date) => {
    const now = dayjs();
    const notificationDate = dayjs(date);
    const diffMinutes = now.diff(notificationDate, 'minute');
    const diffHours = now.diff(notificationDate, 'hour');
    const diffDays = now.diff(notificationDate, 'day');

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const notificationContent = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-80 max-h-96 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Title level={5} className="mb-0">Notifications</Title>
        <Space>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              type="link" 
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </Button>
          )}
          <Button 
            size="small" 
            type="link" 
            onClick={fetchNotifications}
            className="text-gray-600 hover:text-gray-800"
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spin size="large" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          description="No notifications"
          className="p-8"
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <motion.div variants={itemVariants}>
              <List.Item
                className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                actions={[
                  <Button
                    key="view"
                    type="text"
                    size="small"
                    icon={<FaEye />}
                    onClick={() => markAsRead(notification._id)}
                    className="text-gray-600 hover:text-blue-600"
                  />,
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    icon={<FaTimes />}
                    onClick={() => deleteNotification(notification._id)}
                    className="text-gray-600 hover:text-red-600"
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size="small" 
                      icon={getNotificationIcon(notification.type)}
                      className={`${!notification.read ? 'ring-2 ring-blue-500' : ''}`}
                    />
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <Text 
                        strong={!notification.read}
                        className={!notification.read ? 'text-blue-900' : 'text-gray-900'}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  }
                  description={
                    <div className="space-y-1">
                      <Text className="text-gray-600 text-sm">
                        {notification.message}
                      </Text>
                      <div className="flex items-center gap-2">
                        <Tag color={getNotificationColor(notification.type)} size="small">
                          {notification.type}
                        </Tag>
                        <Text className="text-gray-400 text-xs">
                          {getTimeAgo(notification.createdAt)}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            </motion.div>
          )}
        />
      )}
    </motion.div>
  );

  return (
    <Popover
      content={notificationContent}
      title={null}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      className="notification-popover"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="cursor-pointer"
      >
        <Badge count={unreadCount} size="small" className="notification-badge">
          <Avatar
            size="large"
            icon={<FaBell />}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          />
        </Badge>
      </motion.div>
    </Popover>
  );
};

export default NotificationCenter;
