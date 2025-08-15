import React, { useState, useEffect } from "react";
import { Tabs, Table, Spin, Checkbox, Button, Dropdown, Card, Statistic, Row, Col, Progress, Tag, Avatar, Tooltip, Modal, message } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUsers, 
  FaEnvelope, 
  FaPhone, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaDownload,
  FaSync,
  FaCalendarAlt,
} from "react-icons/fa";
import SideNavDash from "../components/SideNavDash";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";



export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState({});

  const [allLeads, setAllLeads] = useState({
    newLeads: [],
    contactedLeads: [],
    followUpLeads: [],
    closedLeads: [],
    readyToMeetLeads: [],
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState("email");
  const [selectedSocialApp, setSelectedSocialApp] = useState(null);

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/leads/get/all");
      setAllLeads(res.data);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to fetch leads",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete lead
  const handleDeleteLead = async (leadId) => {
    Modal.confirm({
      title: 'Delete Lead',
      content: 'Are you sure you want to delete this lead? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setBtnLoading((prev) => ({ ...prev, [leadId]: true }));
          await axiosInstance.delete(`/leads/delete/${leadId}`);
          message.success('Lead deleted successfully!');
          fetchLeads();
        } catch (error) {
          setStatusMessage({
            type: "error",
            text: error?.response?.data?.message || 'Failed to delete lead'
          });
        } finally {
          setBtnLoading((prev) => ({ ...prev, [leadId]: false }));
        }
      }
    });
  };

  // Toggle checkbox
  const toggleCheckbox = async (leadId, checked) => {
    setBtnLoading((prev) => ({ ...prev, [leadId]: true }));
    try {
      await axiosInstance.patch(`/leads/check/${leadId}`);
      const newLeads = { ...allLeads };
      Object.keys(newLeads).forEach((key) => {
        if (Array.isArray(newLeads[key])) {
          newLeads[key] = newLeads[key].map((lead) =>
            lead._id === leadId ? { ...lead, checked: !checked } : lead
          );
        }
      });
      setAllLeads(newLeads);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update lead status",
      });
    } finally {
      setBtnLoading((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  // Send email
  const handleSend = async () => {
    if (selectedChannel === "email") {
      setBtnLoading((prev) => ({ ...prev, email: true }));
      try {
        await axiosInstance.get(`/leads/send/email`);
        setStatusMessage({ type: "success", text: "Email sent successfully" });
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err?.response?.data?.message || "Failed to send email",
        });
      } finally {
        setBtnLoading((prev) => ({ ...prev, email: false }));
      }
    } else if (selectedChannel === "social" && selectedSocialApp) {
      setStatusMessage({
        type: "success",
        text: `Message sent via ${selectedSocialApp}`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: "Please select a valid channel or social media app",
      });
    }
  };

  useEffect(() => {
    fetchLeads();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLeads();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper: unique values for filters per tab
  const getUniqueValues = (leads, field) => {
    return Array.from(
      new Set(leads.map((l) => l[field]).filter((v) => v !== undefined && v !== null))
    ).map((v) => ({ text: v, value: v }));
  };

  // Calculate statistics
  const getStats = () => {
    const totalLeads = Object.values(allLeads)
      .filter(leads => Array.isArray(leads))
      .reduce((sum, leads) => sum + leads.length, 0);
    const newLeadsCount = Array.isArray(allLeads.newLeads) ? allLeads.newLeads.length : 0;
    const contactedLeadsCount = Array.isArray(allLeads.contactedLeads) ? allLeads.contactedLeads.length : 0;
    const readyToMeetCount = Array.isArray(allLeads.readyToMeetLeads) ? allLeads.readyToMeetLeads.length : 0;
    const conversionRate = totalLeads > 0 ? ((readyToMeetCount / totalLeads) * 100).toFixed(1) : 0;

    return {
      totalLeads,
      newLeadsCount,
      contactedLeadsCount,
      readyToMeetCount,
      conversionRate
    };
  };

  const stats = getStats();

  // Generate columns for each tab
  const getColumns = (leads) => [
    {
      title: "Toggle",
      dataIndex: "checked",
      key: "checked",
      render: (checked, record) => (
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Checkbox
            checked={checked}
            disabled={btnLoading[record._id]}
            onChange={() => toggleCheckbox(record._id, checked)}
          />
        </motion.div>
      ),
    },
    { 
      title: "Name", 
      dataIndex: "name", 
      key: "name",
      render: (name) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size="small" 
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      )
    },
    { 
      title: "Email", 
      dataIndex: "email", 
      key: "email",
      render: (email) => (
        <Tooltip title={email}>
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
            {email?.length > 25 ? `${email.substring(0, 25)}...` : email}
          </span>
        </Tooltip>
      )
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      filters: getUniqueValues(leads, "age"),
      onFilter: (value, record) => record.age === value,
      render: (age) => (
        <Tag color={age < 30 ? "blue" : age < 50 ? "green" : "orange"}>
          {age}
        </Tag>
      )
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      filters: getUniqueValues(leads, "experience"),
      onFilter: (value, record) => record.experience === value,
      render: (exp) => (
        <Tag color={exp < 2 ? "red" : exp < 5 ? "orange" : "green"}>
          {exp} years
        </Tag>
      )
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      filters: getUniqueValues(leads, "company"),
      onFilter: (value, record) => record.company === value,
    },
    {
      title: "Industry",
      dataIndex: "industry",
      key: "industry",
      filters: getUniqueValues(leads, "industry"),
      onFilter: (value, record) => record.industry === value,
      render: (industry) => (
        <Tag color="purple">{industry}</Tag>
      )
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      filters: getUniqueValues(leads, "location"),
      onFilter: (value, record) => record.location === value,
    },
    { 
      title: "Lead Score", 
      dataIndex: "leadScore", 
      key: "leadScore",
      render: (score) => (
        <div className="flex items-center gap-2">
          <Progress 
            percent={score} 
            size="small" 
            showInfo={false}
            strokeColor={score > 80 ? "#52c41a" : score > 60 ? "#faad14" : "#f5222d"}
          />
          <span className="text-xs font-medium">{score}%</span>
        </div>
      )
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (status) => {
        const colorMap = {
          'new': 'blue',
          'contacted': 'orange',
          'follow-up': 'purple',
          'closed': 'red',
          'ready-to-meet': 'green'
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <motion.a
            href={`/lead/${record._id}`}
            className="text-blue-500 hover:text-blue-700 font-medium p-2 rounded-lg hover:bg-black-50 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaEye />
          </motion.a>
          
          {record.status === 'ready-to-meet' && (
            <motion.button
              className="text-purple-500 hover:text-purple-700 font-medium p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(`/lead/meeting/all?schedule=${record._id}`)}
              title="Schedule Meeting"
            >
              <FaCalendarAlt />
            </motion.button>
          )}
          
          <motion.button
            className="text-green-500 hover:text-green-700 font-medium p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/lead/${record._id}`)}
            title="Edit Lead"
          >
            <FaEdit />
          </motion.button>
          <motion.button
            className="text-red-500 hover:text-red-700 font-medium p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDeleteLead(record._id)}
            title="Delete Lead"
          >
            <FaTrash />
          </motion.button>
        </div>
      ),
    },
  ];

  // Social media apps dropdown
  const socialMenuItems = [
    { key: "Instagram", label: "Instagram" },
    { key: "LinkedIn", label: "LinkedIn" },
    { key: "Twitter", label: "Twitter" },
    { key: "Facebook", label: "Facebook" }
  ];

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavDash />
      <motion.div 
        className="flex-1 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your leads and track performance</p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              onClick={fetchLeads}
            >
              <FaSync className="text-gray-600" />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
            >
              <FaDownload className="text-gray-600" />
              Export
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants} className="mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Statistic
                    title="Total Leads"
                    value={stats.totalLeads}
                    prefix={<FaUsers className="text-blue-500" />}
                    valueStyle={{ color: '#3f51b5' }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Statistic
                    title="New Leads"
                    value={stats.newLeadsCount}
                    prefix={<FaUsers className="text-green-500" />}
                    valueStyle={{ color: '#4caf50' }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Statistic
                    title="Contacted"
                    value={stats.contactedLeadsCount}
                    prefix={<FaPhone className="text-orange-500" />}
                    valueStyle={{ color: '#ff9800' }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Statistic
                    title="Conversion Rate"
                    value={stats.conversionRate}
                    suffix="%"
                    prefix={<FaChartLine className="text-purple-500" />}
                    valueStyle={{ color: '#9c27b0' }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Action Controls */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="border-0 shadow-lg">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <Dropdown
                  menu={{
                    items: [
                      { key: "email", label: "Email" },
                      { key: "whatsapp", label: "WhatsApp" },
                      { key: "sms", label: "SMS" },
                      { key: "social", label: "Social Media" }
                    ],
                    onClick: (e) => setSelectedChannel(e.key)
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <Button className="flex items-center gap-2">
                    <FaFilter />
                    {selectedChannel === "social" ? "Social Media" : selectedChannel}
                  </Button>
                </Dropdown>

                {selectedChannel === "social" && (
                  <Dropdown 
                    menu={{
                      items: socialMenuItems,
                      onClick: (e) => setSelectedSocialApp(e.key)
                    }}
                    placement="bottomRight" 
                    arrow
                  >
                    <Button>
                      {selectedSocialApp || "Select App"}
                    </Button>
                  </Dropdown>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="primary"
                  disabled={selectedChannel === "email" ? btnLoading.email : !selectedSocialApp}
                  onClick={handleSend}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="large"
                >
                  {btnLoading.email && selectedChannel === "email" ? "Sending..." : "Send Message"}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Status Message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              className={`mb-6 p-4 rounded-xl border ${
                statusMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <FaChartLine className="text-green-600" />
                ) : (
                  <FaChartLine className="text-red-600" />
                )}
                {statusMessage.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Spin size="large" />
          </motion.div>
        ) : (
          /* Tabs Section */
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <Tabs 
                defaultActiveKey="new" 
                type="card" 
                className="custom-tabs"
                items={[
                  { key: "new", label: "New Leads", data: allLeads.newLeads, color: "blue", bgColor: "#dbeafe", textColor: "#1e40af" },
                  { key: "contacted", label: "Contacted Leads", data: allLeads.contactedLeads, color: "orange", bgColor: "#fed7aa", textColor: "#ea580c" },
                  { key: "follow-up", label: "Follow-Up Leads", data: allLeads.followUpLeads, color: "purple", bgColor: "#e9d5ff", textColor: "#7c3aed" },
                  { key: "closed", label: "Closed Leads", data: allLeads.closedLeads, color: "red", bgColor: "#fecaca", textColor: "#dc2626" },
                  { key: "meeting-ready", label: "Meeting Ready", data: allLeads.readyToMeetLeads, color: "green", bgColor: "#bbf7d0", textColor: "#16a34a" },
                ].map((tab) => ({
                  key: tab.key,
                  label: (
                    <span className="flex items-center gap-2">
                      <span>{tab.label}</span>
                      <Tag 
                        color={tab.color} 
                        className="ml-1 font-semibold"
                        style={{ 
                          backgroundColor: tab.bgColor, 
                          color: tab.textColor,
                          borderColor: tab.textColor
                        }}
                      >
                        {tab.data.length}
                      </Tag>
                    </span>
                  ),
                  children: (
                    <Table
                      rowKey="_id"
                      columns={getColumns(tab.data)}
                      dataSource={tab.data}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `${range[0]}-${range[1]} of ${total} items`,
                        responsive: true
                      }}
                      className="custom-table"
                      scroll={{ x: 'max-content' }}
                    />
                  )
                }))}
              />
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Custom CSS for enhanced styling */}
      <style>{`
        .custom-tabs .ant-tabs-tab {
          border-radius: 8px !important;
          margin-right: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .custom-tabs .ant-tabs-tab:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        
        .custom-tabs .ant-tabs-tab-active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
        }

        .custom-tabs .ant-tabs-tab {
          color: #374151 !important;
          font-weight: 500 !important;
          background: white !important;
          border: 1px solid #e5e7eb !important;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #1f2937 !important;
          background: #f9fafb !important;
          border-color: #d1d5db !important;
        }
        
        .custom-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-weight: 600 !important;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f1f5f9 !important;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 16px 12px !important;
        }

        /* Responsive design */
        @media (max-width: 1200px) {
          .custom-tabs .ant-tabs-tab {
            margin-right: 4px !important;
            padding: 8px 12px !important;
          }
        }

        @media (max-width: 768px) {
          .custom-tabs .ant-tabs-tab {
            margin-right: 2px !important;
            padding: 6px 8px !important;
            font-size: 12px !important;
          }
        }

        /* Fix horizontal scrolling */
        .custom-table .ant-table {
          overflow-x: auto !important;
        }

        .custom-table .ant-table-container {
          min-width: 100% !important;
        }
      `}</style>
    </div>
  );
}
