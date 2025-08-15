import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Button, Typography, Divider, Badge } from 'antd';
import { AnimatePresence } from 'framer-motion';
import {
    UserOutlined,
    HomeOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserAddOutlined,
    UploadOutlined,
    SearchOutlined,
    PlusOutlined,
    ContactsOutlined,
    BellOutlined,
    DashboardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Loader from './Loader';
import NotificationCenter from './NotificationCenter';

const { Sider } = Layout;
const { Text } = Typography;

const SideNavDash = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notificationCount] = useState(5);
    const [meetingCount, setMeetingCount] = useState(0);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/profile');
            setProfile(response.data.admin);
        } catch (_) {
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchMeetingCount = async () => {
        try {
            const response = await axiosInstance.get('/meetings');
            setMeetingCount(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch meeting count:', error);
            // Set to 0 if API is not available yet
            setMeetingCount(0);
        }
    };

    const logoutAdmin = async () => {
        try {
            await axiosInstance.get('/admin/logout');
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchMeetingCount();
        
        // Set up real-time meeting count refresh every 30 seconds
        const interval = setInterval(() => {
            fetchMeetingCount();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [fetchProfile, fetchMeetingCount]);

    const menuItems = [
        { key: '/admin/dashboard', label: 'Dashboard', icon: <HomeOutlined />, badge: null },
        { key: '/admin/settings', label: 'Settings', icon: <SettingOutlined />, badge: null },
        { key: '/admin/all', label: 'All Admins', icon: <UserOutlined />, badge: null },
        { key: '/admin/register', label: 'Add Admin', icon: <UserAddOutlined />, badge: null },
        { key: '/lead/upload', label: 'Upload Lead', icon: <UploadOutlined />, badge: null },
        { key: '/lead/add', label: 'Add Lead', icon: <PlusOutlined />, badge: null },
        { key: '/lead/search', label: 'Search Lead', icon: <SearchOutlined />, badge: null },
        { key: '/lead/meeting/all', label: 'All Meetings', icon: <ContactsOutlined />, badge: meetingCount > 0 ? meetingCount.toString() : null },
    ];

    if (loading) return <Loader />;

    const containerVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <Sider
                    width={isCollapsed ? 80 : 280}
                    collapsed={isCollapsed}
                    style={{
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
                        padding: '20px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '4px 0px 20px rgba(0,0,0,0.15)',
                        overflow: 'auto',
                        zIndex: 1000,
                    }}
                    className="custom-scrollbar"
                >
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className={`${isCollapsed ? 'px-2' : 'px-6'} mb-8`}>
                        <motion.div
                            className="flex items-center gap-3 mb-6"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <DashboardOutlined className="text-2xl text-white" />
                            </motion.div>
                            {!isCollapsed && (
                                <div>
                                    <Text className="text-white text-lg font-bold">AI SDR</Text>
                                    <Text className="text-gray-300 text-sm block">Admin Panel</Text>
                                </div>
                            )}
                        </motion.div>

                        {/* Notifications */}
                        <div className="flex justify-center">
                            <NotificationCenter />
                        </div>
                    </motion.div>

                    {/* Navigation Menu */}
                    <motion.div variants={itemVariants} className="flex-1 px-3">
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            onClick={({ key }) => navigate(key)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'white'
                            }}
                            className="custom-menu"
                            items={menuItems.map((item, index) => ({
                                key: item.key,
                                icon: (
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                ),
                                label: (
                                    <div className="flex items-center justify-between w-full">
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <Badge count={item.badge} size="small" className="bg-blue-500" />
                                        )}
                                    </div>
                                ),
                                className: `menu-item-${index}`,
                            }))}
                        />
                    </motion.div>

                    {/* Profile Section */}
                    <motion.div variants={itemVariants} className={`${isCollapsed ? 'px-2' : 'px-6'}`}>
                        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
                        
                        <motion.div
                            className={`bg-white/10 rounded-xl ${isCollapsed ? 'p-2' : 'p-4'} mb-4`}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-3`}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Avatar
                                        size={isCollapsed ? 40 : 50}
                                        icon={<UserOutlined />}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                                    />
                                </motion.div>
                                {!isCollapsed && (
                                    <div>
                                        <Text className="text-white font-semibold block">
                                            {profile?.name || 'Admin Name'}
                                        </Text>
                                        <Text className="text-gray-300 text-sm block">
                                            {profile?.email || 'admin@example.com'}
                                        </Text>
                                    </div>
                                )}
                            </div>
                            
                            {!isCollapsed && (
                                <motion.div
                                    className="flex items-center justify-between text-xs text-gray-300"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <span>Last login: Today</span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                </motion.div>
                            )}
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="primary"
                                danger
                                icon={<LogoutOutlined />}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                }}
                                onClick={logoutAdmin}
                                className="hover:shadow-lg transition-all duration-300"
                            >
                                Sign Out
                            </Button>
                        </motion.div>
                    </motion.div>
                </Sider>
            </motion.div>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                style={{ marginLeft: isCollapsed ? 80 : 280 }}
            >
                {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </motion.button>

            {/* Main content wrapper */}
            <div 
                style={{ 
                    marginLeft: isCollapsed ? 80 : 280, 
                    padding: '20px', 
                    minHeight: '100vh', 
                    background: '#f8fafc',
                    transition: 'margin-left 0.3s ease'
                }}
            >
                {/* Dashboard content goes here */}
            </div>

            {/* Custom CSS for better styling */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .custom-menu .ant-menu-item {
                    margin: 4px 8px !important;
                    border-radius: 12px !important;
                    height: 48px !important;
                    line-height: 48px !important;
                    transition: all 0.3s ease !important;
                }
                
                .custom-menu .ant-menu-item:hover {
                    background: rgba(255,255,255,0.1) !important;
                    transform: translateX(5px) !important;
                }
                
                .custom-menu .ant-menu-item-selected {
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
                }
                
                .custom-menu .ant-menu-item .ant-menu-title-content {
                    color: white !important;
                    font-weight: 500 !important;
                }
                
                .custom-menu .ant-menu-item-selected .ant-menu-title-content {
                    color: white !important;
                    font-weight: 600 !important;
                }
                
                .custom-menu .ant-menu-item .anticon {
                    color: rgba(255,255,255,0.8) !important;
                    font-size: 16px !important;
                }
                
                .custom-menu .ant-menu-item-selected .anticon {
                    color: white !important;
                }
            `}</style>
        </>
    );
};

export default SideNavDash;
