import React, { useState } from 'react';
import SideNavDash from '../components/SideNavDash';
import axiosInstance from '../api/axiosInstance';
import { Form, Input, Button, Typography, Alert, Card, message } from 'antd';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUserPlus, 
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminRegister = () => {
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      setBtnLoading(true);
      setError('');
      const payload = { ...values, role: 'admin' };
      await axiosInstance.post('/admin/register', payload);
      form.resetFields();
      message.success('Admin registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      setError(error?.response?.data?.message || 'An error occurred');
      message.error('Registration failed. Please try again.');
    } finally {
      setBtnLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const requirements = [
    'Minimum 8 characters',
    'At least one uppercase letter',
    'At least one number',
    'At least one special character'
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <SideNavDash />
      <motion.div 
        className="flex-1 flex justify-center items-center p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-full max-w-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="border-0 shadow-2xl rounded-3xl overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            {/* Header Section */}
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center"
              variants={itemVariants}
            >
              <motion.div
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <FaUserPlus className="text-3xl" />
              </motion.div>
              <Title level={2} className="text-white mb-2">
                Add New Admin
              </Title>
              <Text className="text-blue-100 text-lg">
                Create a new administrator account for your team
              </Text>
            </motion.div>

            {/* Form Section */}
            <div className="p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    closable
                    className="mb-6"
                    action={
                      <Button size="small" danger onClick={() => setError('')}>
                        Dismiss
                      </Button>
                    }
                  />
                </motion.div>
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                className="space-y-6"
              >
                {/* Name Field */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Full Name
                      </span>
                    }
                    name="name"
                    rules={[{ required: true, message: 'Please enter the full name' }]}
                  >
                    <Input 
                      placeholder="Enter full name" 
                      size="large" 
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      prefix={<FaUser className="text-gray-400 mr-2" />}
                    />
                  </Form.Item>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <FaEnvelope className="text-blue-600" />
                        Email Address
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email address' },
                      { type: 'email', message: 'Please enter a valid email format' },
                    ]}
                  >
                    <Input 
                      placeholder="Enter email address" 
                      size="large" 
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      prefix={<FaEnvelope className="text-gray-400 mr-2" />}
                    />
                  </Form.Item>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <FaLock className="text-blue-600" />
                        Password
                      </span>
                    }
                    name="password"
                    rules={[
                      { required: true, message: 'Please enter password' },
                      { min: 8, message: 'Password must be at least 8 characters' }
                    ]}
                  >
                    <Input.Password 
                      placeholder="Enter secure password" 
                      size="large" 
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      prefix={<FaLock className="text-gray-400 mr-2" />}
                    />
                  </Form.Item>
                </motion.div>

                {/* Password Requirements */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FaShieldAlt className="text-blue-600" />
                    <Text className="font-medium text-gray-700">Password Requirements</Text>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {requirements.map((req, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FaCheckCircle className="text-green-500 text-xs" />
                        {req}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Form.Item className="mb-0">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={btnLoading}
                        size="large"
                        block
                        className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {btnLoading ? 'Creating Account...' : 'Create Admin Account'}
                      </Button>
                    </motion.div>
                  </Form.Item>
                </motion.div>
              </Form>

              {/* Additional Info */}
              <motion.div 
                variants={itemVariants}
                className="mt-8 text-center text-gray-500"
              >
                <Text className="text-sm">
                  The new admin will receive an email confirmation and can start using the platform immediately.
                </Text>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminRegister;
