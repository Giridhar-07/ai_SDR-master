import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography, Select, InputNumber, Space, Divider, Alert, Tooltip } from 'antd';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaLinkedin, 
  FaTags, 
  FaCalendarAlt,
  FaArrowLeft,
  FaSave,
  FaCheckCircle
} from 'react-icons/fa';
import SideNavDash from '../components/SideNavDash';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddLead = () => {
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);
  const [form] = Form.useForm();

  // Animation variants
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
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const onFinish = async (values) => {
    try {
      setBtnLoading(true);
      
      // Process interestedIn field
      const interests = (values.interestedIn || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const dedupedSorted = Array.from(new Set(interests))
        .sort((a, b) => a.localeCompare(b));

      const payload = { 
        ...values, 
        interestedIn: dedupedSorted,
        age: values.age || undefined,
        experience: values.experience || 0
      };

      await axiosInstance.post('/leads/import/single', payload);
      message.success('Lead added successfully!');
      
      // Show success animation
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'An error occurred while adding the lead';
      message.error(errorMessage);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SideNavDash />
      
      <motion.div 
        className="flex-1 p-6 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FaArrowLeft className="text-gray-600" />
            </motion.button>
            <div>
              <Title level={2} className="mb-1 text-gray-800">Add New Lead</Title>
              <Text className="text-gray-600">Create a new lead entry with comprehensive information</Text>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <Card 
            className="shadow-xl border-0 rounded-2xl"
            styles={{ body: { padding: '2rem' } }}
          >
            <Form 
              form={form}
              layout="vertical" 
              onFinish={onFinish} 
              requiredMark={false}
              size="large"
            >
              {/* Personal Information Section */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-6">
                  <FaUser className="text-blue-600 text-xl" />
                  <Title level={4} className="mb-0 text-gray-700">Personal Information</Title>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item 
                    name="name" 
                    label="Full Name" 
                    rules={[{ required: true, message: 'Please enter the full name' }]}
                  >
                    <Input 
                      placeholder="John Doe" 
                      prefix={<FaUser className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter the email address' },
                      { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                  >
                    <Input 
                      placeholder="john.doe@example.com" 
                      prefix={<FaEnvelope className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter the phone number' }]}
                  >
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      prefix={<FaPhone className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="age"
                    label="Age"
                    rules={[
                      { type: 'number', min: 18, max: 100, message: 'Age must be between 18 and 100' }
                    ]}
                  >
                    <InputNumber 
                      placeholder="30" 
                      className="w-full rounded-lg"
                      min={18}
                      max={100}
                    />
                  </Form.Item>
                </div>
              </motion.div>

              <Divider />

              {/* Professional Information Section */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-6">
                  <FaBriefcase className="text-green-600 text-xl" />
                  <Title level={4} className="mb-0 text-gray-700">Professional Information</Title>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item 
                    name="role" 
                    label="Job Title" 
                    rules={[{ required: true, message: 'Please enter the job title' }]}
                  >
                    <Input 
                      placeholder="Senior Developer" 
                      prefix={<FaBriefcase className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item 
                    name="company" 
                    label="Company" 
                    rules={[{ required: true, message: 'Please enter the company name' }]}
                  >
                    <Input 
                      placeholder="Tech Corp Inc." 
                      prefix={<FaBuilding className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="experience"
                    label="Years of Experience"
                    rules={[{ required: true, message: 'Please enter years of experience' }]}
                  >
                    <InputNumber 
                      placeholder="5" 
                      className="w-full rounded-lg"
                      min={0}
                      max={50}
                    />
                  </Form.Item>

                  <Form.Item
                    name="industry"
                    label="Industry"
                    rules={[{ required: true, message: 'Please select the industry' }]}
                  >
                    <Select placeholder="Select industry" className="rounded-lg">
                      <Option value="Technology">Technology</Option>
                      <Option value="Finance">Finance</Option>
                      <Option value="Healthcare">Healthcare</Option>
                      <Option value="Education">Education</Option>
                      <Option value="Retail">Retail</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: 'Please enter the location' }]}
                  >
                    <Input 
                      placeholder="New York, NY" 
                      prefix={<FaMapMarkerAlt className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="linkedIn"
                    label="LinkedIn Profile"
                    rules={[
                      { 
                        pattern: /^https?:\/\/(www\.)?linkedin\.com\/.+$/, 
                        message: 'Please enter a valid LinkedIn URL' 
                      }
                    ]}
                  >
                    <Input 
                      placeholder="https://linkedin.com/in/username" 
                      prefix={<FaLinkedin className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>
              </motion.div>

              <Divider />

              {/* Lead Details Section */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-6">
                  <FaTags className="text-purple-600 text-xl" />
                  <Title level={4} className="mb-0 text-gray-700">Lead Details</Title>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="leadSource"
                    label="Lead Source"
                    rules={[{ required: true, message: 'Please enter the lead source' }]}
                  >
                    <Select placeholder="Select lead source" className="rounded-lg">
                      <Option value="Website">Website</Option>
                      <Option value="Referral">Referral</Option>
                      <Option value="Conference">Conference</Option>
                      <Option value="Social Media">Social Media</Option>
                      <Option value="Cold Outreach">Cold Outreach</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="preferredChannel"
                    label="Preferred Contact Channel"
                    rules={[{ required: true, message: 'Please select preferred channel' }]}
                  >
                    <Select placeholder="Select preferred channel" className="rounded-lg">
                      <Option value="email">Email</Option>
                      <Option value="phone">Phone</Option>
                      <Option value="linkedin">LinkedIn</Option>
                      <Option value="whatsapp">WhatsApp</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please select category' }]}
                  >
                    <Select placeholder="Select category" className="rounded-lg">
                      <Option value="B2B">B2B</Option>
                      <Option value="B2C">B2C</Option>
                      <Option value="Enterprise">Enterprise</Option>
                      <Option value="Startup">Startup</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="interestedIn"
                    label={
                      <span>
                        Areas of Interest 
                        <Tooltip title="Enter comma-separated values (e.g., React, Node.js, AWS)">
                          <Text className="text-gray-400 ml-1">(comma-separated)</Text>
                        </Tooltip>
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter areas of interest' }]}
                  >
                    <TextArea 
                      placeholder="React, Node.js, AWS, Docker, Kubernetes"
                      rows={3}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="mt-8">
                <Form.Item className="mb-0">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={btnLoading}
                      size="large"
                      block
                      className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      icon={btnLoading ? null : <FaSave />}
                    >
                      {btnLoading ? 'Adding Lead...' : 'Add Lead'}
                    </Button>
                  </motion.div>
                </Form.Item>
              </motion.div>
            </Form>
          </Card>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {btnLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 right-6"
            >
              <Alert
                message="Adding lead..."
                description="Please wait while we process your request."
                type="info"
                showIcon
                icon={<FaCheckCircle />}
                className="shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AddLead;
