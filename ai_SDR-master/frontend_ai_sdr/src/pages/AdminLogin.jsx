import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, Typography, message } from 'antd';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaRocket,
  FaShieldAlt,
  FaChartLine
} from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setServerError("");
      await axiosInstance.post('/admin/login', values);
      message.success('Login successful');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (error) {
      setServerError(error?.response?.data?.message || "An error occurred");
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-red-200 rounded-full opacity-20" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRocket className="text-3xl text-white" />
          </div>
          <Title level={2} className="text-gray-900 mb-2">
            Welcome Back
          </Title>
          <Text className="text-gray-600">
            Sign in to your admin dashboard
          </Text>
        </div>

        {/* Error Message */}
        <div className='h-12 mb-4'>
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-center text-sm font-medium">
              {serverError}
            </div>
          )}
        </div>

        {/* Login Form */}
        <Form
          name="admin_login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="space-y-6"
        >
          {/* Email Field */}
          <div>
            <Form.Item
              label={<span className="text-gray-700 font-medium flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Email Address
              </span>}
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input
                placeholder="Enter your email"
                className="h-12 bg-gray-50 text-gray-900 border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300"
                prefix={<FaUser className="text-gray-400 mr-2" />}
              />
            </Form.Item>
          </div>

          {/* Password Field */}
          <div>
            <Form.Item
              label={<span className="text-gray-700 font-medium flex items-center gap-2">
                <FaLock className="text-blue-600" />
                Password
              </span>}
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                placeholder="Enter your password"
                className="h-12 bg-gray-50 text-gray-900 border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300"
                prefix={<FaLock className="text-gray-400 mr-2" />}
                iconRender={(visible) => (
                  <div>
                    {visible ? <FaEye /> : <FaEyeSlash />}
                  </div>
                )}
              />
            </Form.Item>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <Form.Item name="remember" valuePropName="checked" className="mb-0">
              <Checkbox className="text-gray-600">
                Remember me
              </Checkbox>
            </Form.Item>
          </div>

          {/* Submit Button */}
          <div>
            <Form.Item className="mb-0">
              <div>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-red-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-red-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl border-0"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <Text className="text-gray-500">
           SaarathiLead
          </Text>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-blue-600" />
            </div>
            <span className="font-medium">Secure & Reliable</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-green-600" />
            </div>
            <span className="font-medium">Advanced Analytics</span>
          </div>
        </div>
      </div>

      {/* Right side feature highlights */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="font-medium">AI-Powered</span>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaRocket className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="font-medium">Real-time Updates</span>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
