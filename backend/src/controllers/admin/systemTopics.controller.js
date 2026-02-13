const Topic = require('../../models/Topic');
const SystemLog = require('../../models/SystemLog');

// Get all system topics
exports.getAllTopics = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const filter = { is_system_topic: true };
    if (category) {
      filter.topic_category = category;
    }

    const topics = await Topic.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('topic_creator', 'user_name user_id')
      .populate('topic_category', 'topic_category_title')
      .populate('topic_major', 'major_title');

    const total = await Topic.countDocuments(filter);

    await SystemLog.create({
      action: 'GET_SYSTEM_TOPICS',
      collection_name: 'topics',
      user_id: req.user.user_id,
      changes: { filter },
      ip_address: req.ip,
    });

    res.json({
      success: true,
      data: topics,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting system topics:', error);
    res.status(500).json({ success: false, message: 'Failed to load topics' });
  }
};

// Create system topic
exports.createTopic = async (req, res) => {
  try {
    const topic_title = req.body.topic_title;
    const topic_description =
      req.body.topic_description || req.body.description || '';
    const topic_category = req.body.topic_category || req.body.category;
    const topic_major = req.body.topic_major || req.body.major;
    const topic_max_members =
      req.body.topic_max_members || req.body.max_students || 1;
    const topic_registration_period = req.body.topic_registration_period;

    if (!topic_title || !topic_category || !topic_major) {
      return res.status(400).json({
        success: false,
        message: 'Missing required topic fields',
      });
    }

    const topic = new Topic({
      topic_title,
      topic_description,
      topic_category,
      topic_major,
      topic_max_members,
      topic_registration_period,
      topic_creator: req.user._id,
      topic_creator_id: req.user.user_id,
      topic_teacher_status: 'approved',
      topic_leader_status: 'approved',
      is_system_topic: true,
      is_active: true,
    });

    await topic.save();

    await SystemLog.create({
      action: 'CREATE_SYSTEM_TOPIC',
      collection_name: 'topics',
      document_id: topic._id,
      user_id: req.user.user_id,
      changes: { topic_title, topic_category },
      ip_address: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Topic created',
      data: topic,
    });
  } catch (error) {
    console.error('Error creating system topic:', error);
    res.status(500).json({ success: false, message: 'Failed to create topic' });
  }
};

// Update system topic
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.topic_title) {
      updateData.topic_title = req.body.topic_title;
    }
    if (req.body.topic_description || req.body.description) {
      updateData.topic_description =
        req.body.topic_description || req.body.description;
    }
    if (req.body.topic_category || req.body.category) {
      updateData.topic_category = req.body.topic_category || req.body.category;
    }
    if (req.body.topic_major || req.body.major) {
      updateData.topic_major = req.body.topic_major || req.body.major;
    }
    if (req.body.topic_max_members || req.body.max_students) {
      updateData.topic_max_members =
        req.body.topic_max_members || req.body.max_students;
    }
    if (req.body.topic_registration_period) {
      updateData.topic_registration_period = req.body.topic_registration_period;
    }

    const topic = await Topic.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: 'Topic not found' });
    }

    await SystemLog.create({
      action: 'UPDATE_SYSTEM_TOPIC',
      collection_name: 'topics',
      document_id: topic._id,
      user_id: req.user.user_id,
      changes: updateData,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'Topic updated',
      data: topic,
    });
  } catch (error) {
    console.error('Error updating system topic:', error);
    res.status(500).json({ success: false, message: 'Failed to update topic' });
  }
};

// Delete system topic
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await Topic.findByIdAndDelete(id);

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: 'Topic not found' });
    }

    await SystemLog.create({
      action: 'DELETE_SYSTEM_TOPIC',
      collection_name: 'topics',
      document_id: topic._id,
      user_id: req.user.user_id,
      changes: { topic_title: topic.topic_title },
      ip_address: req.ip,
    });

    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    console.error('Error deleting system topic:', error);
    res.status(500).json({ success: false, message: 'Failed to delete topic' });
  }
};
