import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Menu, Avatar, Button, Typography, Divider, Badge } from 'antd';
import { motion } from 'framer-motion';
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
    DashboardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    NodeIndexOutlined,
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
    const [meetingCount, setMeetingCount] = useState(0);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/profile');
            setProfile(response.data?.admin || {});
        } catch {
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const fetchMeetingCount = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/meetings');
            setMeetingCount(response.data?.total || 0);
        } catch {
            setMeetingCount(0);
        }
    }, []);

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
        const interval = setInterval(fetchMeetingCount, 30000);
        return () => clearInterval(interval);
    }, [fetchProfile, fetchMeetingCount]);

    const menuItems = [
        { key: '/admin/dashboard', label: 'Dashboard', icon: <HomeOutlined /> },
        { key: '/admin/settings', label: 'Settings', icon: <SettingOutlined /> },
        { key: '/admin/all', label: 'All Admins', icon: <UserOutlined /> },
        { key: '/admin/register', label: 'Add Admin', icon: <UserAddOutlined /> },
        { key: '/lead/upload', label: 'Upload Lead', icon: <UploadOutlined /> },
        { key: '/lead/add', label: 'Add Lead', icon: <PlusOutlined /> },
        { key: '/lead/search', label: 'Search Lead', icon: <SearchOutlined /> },
        { key: '/lead/meeting/all', label: 'All Meetings', icon: <ContactsOutlined />, badge: meetingCount > 0 ? meetingCount : null },
        { key: '/edit/workflow', label: 'Edit Workflow', icon: <NodeIndexOutlined />, badge: meetingCount > 0 ? meetingCount : null },
    ];

    if (loading) return <Loader />;

    return (
        <>
            <Sider
                width={isCollapsed ? 80 : 280}
                collapsed={isCollapsed}
                style={{
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
                    padding: '20px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '4px 0px 20px rgba(0,0,0,0.05)',
                    overflow: 'auto',
                    zIndex: 1000,
                }}
                className="custom-scrollbar"
            >
                {/* Header */}
                <div className={`${isCollapsed ? 'px-2' : 'px-6'} mb-8`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <DashboardOutlined className="text-2xl text-white" />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <Text className="text-gray-900 text-lg font-bold">SaarathiLead</Text>
                                <Text className="text-gray-500 text-sm block">Admin Console</Text>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center">
                        <NotificationCenter />
                    </div>
                </div>

                {/* Menu */}
                <div className="flex-1 px-3">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        onClick={({ key }) => navigate(key)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#333'
                        }}
                        items={menuItems.map((item) => ({
                            key: item.key,
                            icon: item.icon,
                            label: (
                                <div className="flex items-center justify-between w-full">
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <Badge count={item.badge} size="small" style={{ backgroundColor: '#3b82f6' }} />
                                    )}
                                </div>
                            )
                        }))}
                    />
                </div>

                {/* Profile */}
                <div className={`${isCollapsed ? 'px-2' : 'px-6'}`}>
                    <Divider style={{ borderColor: '#ddd', margin: '20px 0' }} />
                    <div className={`bg-gray-100 rounded-xl ${isCollapsed ? 'p-2' : 'p-4'} mb-4`}>
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-3`}>
                            <Avatar
                                size={isCollapsed ? 40 : 50}
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#3b82f6' }}
                            />
                            {!isCollapsed && (
                                <div>
                                    <Text className="font-semibold block">
                                        {profile?.name || 'Admin Name'}
                                    </Text>
                                    <Text type="secondary" className="text-sm block">
                                        {profile?.email || 'admin@example.com'}
                                    </Text>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Last login: Today</span>
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        style={{
                            width: '100%',
                            height: '44px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        }}
                        onClick={logoutAdmin}
                    >
                        Sign Out
                    </Button>
                </div>
            </Sider>

            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
                style={{ marginLeft: isCollapsed ? 80 : 280 }}
            >
                {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            {/* Main Content */}
            <div
                style={{
                    marginLeft: isCollapsed ? 80 : 280,
                    padding: '20px',
                    minHeight: '100vh',
                    background: '#f8fafc',
                    transition: 'margin-left 0.3s ease'
                }}
            >
                {/* Dashboard content */}
            </div>
        </>
    );
};

export default SideNavDash;
