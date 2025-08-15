import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Spin,
  Button,
  Empty,
  message,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Badge,
  Space,
  Typography,
  Divider,
  Row,
  Col
} from 'antd';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt,
  FaVideo,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaUser,
  FaClock,
  FaPlus,
  FaArrowLeft,
  FaSync,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaLink,
  FaShare
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SideNavDash from '../components/SideNavDash';
import axiosInstance from '../api/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AllMeetings = () => {
  const [loading, setLoading] = useState(false);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [meetingCount, setMeetingCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [scheduleForm] = Form.useForm();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/meetings');
      setMeetings(response.data.meetings || []);
      setMeetingCount(response.data.total || 0);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'An error occurred while fetching meetings';
      setError(errorMessage);
      message.error(errorMessage);
      // Set empty arrays if API is not available yet
      setMeetings([]);
      setMeetingCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMeetings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleScheduleMeeting = (lead) => {
    setSelectedLead(lead);
    setIsScheduleModalVisible(true);
    scheduleForm.resetFields();
  };

  const handleCreateJitsiMeeting = async (values) => {
    try {
      setSchedulingLoading(true);
      const meetingData = {
        leadId: selectedLead._id,
        title: values.title,
        description: values.description,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
        scheduledTime: values.scheduledTime.format('HH:mm'),
        duration: values.duration,
        meetingType: values.meetingType,
        jitsiRoomId: `ai-sdr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const response = await axiosInstance.post('/meetings/schedule', meetingData);
      
      if (response.data.success) {
        message.success('Meeting scheduled successfully!');
        setIsScheduleModalVisible(false);
        fetchMeetings();
        
        // Send email to client
        await axiosInstance.post('/meetings/send-invitation', {
          meetingId: response.data.meeting._id,
          leadEmail: selectedLead.email
        });
        
        message.success('Meeting invitation sent to client!');
      }
    } catch (error) {
      message.error('Failed to schedule meeting: ' + (error?.response?.data?.message || error.message));
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    } else {
      message.warning('No meeting link available');
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    form.setFieldsValue({
      meetingLink: meeting.meetingLink,
      meetingDate: meeting.meetingDate ? dayjs(meeting.meetingDate) : null,
      status: meeting.status
    });
    setIsModalVisible(true);
  };

  const handleUpdateMeeting = async (values) => {
    try {
      const payload = {
        meetingLink: values.meetingLink,
        meetingDate: values.meetingDate?.toISOString(),
        status: values.status
      };

      await axiosInstance.patch(`/leads/update/${editingMeeting._id}`, payload);
      message.success('Meeting updated successfully!');
      setIsModalVisible(false);
      setEditingMeeting(null);
      form.resetFields();
      fetchMeetings();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to update meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    Modal.confirm({
      title: 'Delete Meeting',
      content: 'Are you sure you want to delete this meeting? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/leads/delete/${meetingId}`);
          message.success('Meeting deleted successfully!');
          fetchMeetings();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Failed to delete meeting');
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'meeting': return 'blue';
      case 'scheduled': return 'green';
      case 'completed': return 'purple';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'meeting': return 'Scheduled';
      case 'scheduled': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const isMeetingUpcoming = (meetingDate) => {
    return dayjs(meetingDate).isAfter(dayjs());
  };

  const isMeetingToday = (meetingDate) => {
    return dayjs(meetingDate).isSame(dayjs(), 'day');
  };

  const getMeetingTimeStatus = (meetingDate) => {
    if (isMeetingToday(meetingDate)) {
      return 'Today';
    } else if (isMeetingUpcoming(meetingDate)) {
      return 'Upcoming';
    } else {
      return 'Past';
    }
  };

  const getMeetingTimeColor = (meetingDate) => {
    if (isMeetingToday(meetingDate)) {
      return 'orange';
    } else if (isMeetingUpcoming(meetingDate)) {
      return 'green';
    } else {
      return 'gray';
    }
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <FaArrowLeft className="text-gray-600" />
              </motion.button>
              <div>
                <Title level={2} className="mb-1 text-gray-800">
                  All Meetings 
                  <Tag color="blue" className="ml-3 text-sm">
                    {meetingCount} {meetingCount === 1 ? 'Meeting' : 'Meetings'}
                  </Tag>
                </Title>
                <Text className="text-gray-600">Manage and track all scheduled meetings</Text>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchMeetings}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
            >
              <FaSync className="text-gray-600" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center h-64"
          >
            <Spin size="large" />
          </motion.div>
        ) : error ? (
          <motion.div variants={itemVariants}>
            <Card className="text-center border-red-200 bg-red-50">
              <Text className="text-red-600 text-lg">{error}</Text>
            </Card>
          </motion.div>
        ) : meetings.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center h-96"
          >
            <Empty
              description={
                <span className="text-gray-500 text-lg">
                  No meetings found
                </span>
              }
            />
            <Button
              type="primary"
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={fetchMeetings}
            >
              Refresh
            </Button>
          </motion.div>
        ) : (
          /* Meetings List */
          <motion.div variants={itemVariants}>
            <List
              grid={{ gutter: 24, xs: 1, sm: 2, lg: 3 }}
              dataSource={meetings}
              renderItem={(meeting) => (
                <List.Item>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl border-0"
                      styles={{ body: { padding: '1.5rem' } }}
                    >
                      {/* Meeting Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="large"
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                          >
                            {meeting.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <div>
                            <Title level={5} className="mb-1">{meeting.name}</Title>
                            <Text className="text-gray-500 text-sm">{meeting.role}</Text>
                          </div>
                        </div>
                        <Space>
                          <Tag color={getStatusColor(meeting.status)}>
                            {getStatusText(meeting.status)}
                          </Tag>
                          <Tag color={getMeetingTimeColor(meeting.meetingDate)}>
                            {getMeetingTimeStatus(meeting.meetingDate)}
                          </Tag>
                        </Space>
                      </div>

                      {/* Meeting Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaEnvelope className="text-blue-500" />
                          <Text className="text-sm">{meeting.email}</Text>
                        </div>

                        {meeting.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaPhone className="text-green-500" />
                            <Text className="text-sm">{meeting.phone}</Text>
                          </div>
                        )}

                        {meeting.company && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaBuilding className="text-purple-500" />
                            <Text className="text-sm">{meeting.company}</Text>
                          </div>
                        )}

                        {meeting.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaMapMarkerAlt className="text-red-500" />
                            <Text className="text-sm">{meeting.location}</Text>
                          </div>
                        )}

                        {meeting.meetingDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendarAlt className="text-orange-500" />
                            <Text className="text-sm">
                              {dayjs(meeting.meetingDate).format('MMM DD, YYYY h:mm A')}
                            </Text>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="primary"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleJoinMeeting(meeting)}
                            icon={<FaVideo />}
                          >
                            Join Meeting
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => handleScheduleMeeting(meeting)}
                            icon={<FaCalendarAlt />}
                            className="border-green-300 text-green-600 hover:text-green-700 hover:border-green-400"
                          >
                            Schedule
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => handleEditMeeting(meeting)}
                            icon={<FaEdit />}
                            className="border-gray-300"
                          />
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            danger
                            onClick={() => handleDeleteMeeting(meeting._id)}
                            icon={<FaTrash />}
                          />
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </List.Item>
              )}
            />
          </motion.div>
        )}

        {/* Edit Meeting Modal */}
        <Modal
          title="Edit Meeting"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingMeeting(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateMeeting}
          >
            <Form.Item
              name="meetingLink"
              label="Meeting Link"
              rules={[
                { required: true, message: 'Please enter the meeting link' },
                {
                  pattern: /^https?:\/\/.+$/,
                  message: 'Please enter a valid URL'
                }
              ]}
            >
              <Input
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                prefix={<FaVideo className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="meetingDate"
              label="Meeting Date & Time"
              rules={[{ required: true, message: 'Please select meeting date and time' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className="w-full"
                placeholder="Select date and time"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Meeting Status"
              rules={[{ required: true, message: 'Please select meeting status' }]}
            >
              <Select placeholder="Select status">
                <Option value="meeting">Scheduled</Option>
                <Option value="scheduled">Confirmed</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingMeeting(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Meeting
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Schedule Meeting Modal */}
        <Modal
          title="Schedule New Meeting"
          open={isScheduleModalVisible}
          onCancel={() => {
            setIsScheduleModalVisible(false);
            setSelectedLead(null);
            scheduleForm.resetFields();
          }}
          footer={null}
          width={700}
        >
          {selectedLead && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Avatar size="large" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  {selectedLead.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div>
                  <Title level={5} className="mb-1">{selectedLead.name}</Title>
                  <Text className="text-gray-600">{selectedLead.email}</Text>
                  {selectedLead.company && (
                    <Text className="text-gray-500 text-sm block">{selectedLead.company}</Text>
                  )}
                </div>
              </div>
            </div>
          )}

          <Form
            form={scheduleForm}
            layout="vertical"
            onFinish={handleCreateJitsiMeeting}
          >
            <Form.Item
              name="title"
              label="Meeting Title"
              rules={[{ required: true, message: 'Please enter meeting title' }]}
            >
              <Input 
                placeholder="Enter meeting title"
                prefix={<FaCalendarAlt className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Meeting Description"
              rules={[{ required: true, message: 'Please enter meeting description' }]}
            >
              <TextArea 
                rows={3}
                placeholder="Enter meeting description"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="scheduledDate"
                  label="Meeting Date"
                  rules={[{ required: true, message: 'Please select meeting date' }]}
                >
                  <DatePicker
                    className="w-full"
                    placeholder="Select date"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="scheduledTime"
                  label="Meeting Time"
                  rules={[{ required: true, message: 'Please select meeting time' }]}
                >
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="HH:mm"
                    className="w-full"
                    placeholder="Select time"
                    disabledTime={(now, type) => {
                      if (type === 'time' && scheduleForm.getFieldValue('scheduledDate') && 
                          dayjs(scheduleForm.getFieldValue('scheduledDate')).isSame(dayjs(), 'day')) {
                        return {
                          disabledHours: () => {
                            const hours = [];
                            for (let i = 0; i < dayjs().hour(); i++) {
                              hours.push(i);
                            }
                            return hours;
                          },
                          disabledMinutes: (selectedHour) => {
                            if (selectedHour === dayjs().hour()) {
                              const minutes = [];
                              for (let i = 0; i < dayjs().minute(); i++) {
                                minutes.push(i);
                              }
                              return minutes;
                            }
                            return [];
                          }
                        };
                      }
                      return {};
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="duration"
                  label="Duration (minutes)"
                  rules={[{ required: true, message: 'Please select duration' }]}
                >
                  <Select placeholder="Select duration">
                    <Option value={15}>15 minutes</Option>
                    <Option value={30}>30 minutes</Option>
                    <Option value={45}>45 minutes</Option>
                    <Option value={60}>1 hour</Option>
                    <Option value={90}>1.5 hours</Option>
                    <Option value={120}>2 hours</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="meetingType"
                  label="Meeting Type"
                  rules={[{ required: true, message: 'Please select meeting type' }]}
                >
                  <Select placeholder="Select type">
                    <Option value="video">Video Call</Option>
                    <Option value="audio">Audio Call</Option>
                    <Option value="presentation">Presentation</Option>
                    <Option value="discussion">Discussion</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                onClick={() => {
                  setIsScheduleModalVisible(false);
                  setSelectedLead(null);
                  scheduleForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-green-600 hover:bg-green-700"
                icon={<FaCalendarAlt />}
                loading={schedulingLoading}
                disabled={schedulingLoading}
              >
                {schedulingLoading ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </div>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
};

export default AllMeetings;
