const SystemLog = require('../../models/SystemLog');

// Actions considered "read-only" noise — excluded by default
const READ_ACTIONS = [
  'GET_SYSTEM_TOPICS',
  'GET_TOPICS',
  'GET_USERS',
  'GET_SETTINGS',
  'GET_LOGS',
  'GET_REPORTS',
  'GET_RUBRICS',
  'GET_COUNCILS',
  'GET_SCHEDULES',
  'GET_SEMESTERS',
  'VIEW',
];

// Get all system logs
exports.getAllLogs = async (req, res) => {
  try {
    const {
      action,
      collection,
      userId,
      searchMessage,
      page = 1,
      limit = 50,
      includeReads = 'false',
    } = req.query;

    const filter = {};
    if (action) {
      filter.action = action;
    } else if (includeReads === 'false') {
      filter.action = { $nin: READ_ACTIONS };
    }
    if (collection) filter.collection_name = collection;
    if (userId) filter.user_id = userId;
    if (searchMessage) {
      filter.$or = [
        { action: { $regex: searchMessage, $options: 'i' } },
        { collection_name: { $regex: searchMessage, $options: 'i' } },
      ];
    }

    const logs = await SystemLog.find(filter)
      .populate('user_id', 'user_name user_id email role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SystemLog.countDocuments(filter);

    const data = logs.map((log) => ({
      _id: log._id,
      action: log.action,
      collection_name: log.collection_name,
      document_id: log.document_id,
      user_name: log.user_id?.user_name || null,
      user_code: log.user_id?.user_id || null,
      user_email: log.user_id?.email || null,
      user_role: log.user_id?.role || null,
      changes: log.changes,
      timestamp: log.timestamp,
      ip_address: (log.ip_address || '').replace('::ffff:', ''),
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi lấy nhật ký hệ thống' });
  }
};

// Get log statistics
exports.getLogStats = async (req, res) => {
  try {
    const stats = await SystemLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await SystemLog.countDocuments();

    res.json({
      success: true,
      data: {
        total,
        byAction: stats,
      },
    });
  } catch (error) {
    console.error('Error getting log stats:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi lấy thống kê nhật ký' });
  }
};

// Export logs as CSV
exports.exportLogs = async (req, res) => {
  try {
    const { action, collection, fromDate, toDate } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (collection) filter.collection_name = collection;
    if (fromDate || toDate) {
      filter.timestamp = {};
      if (fromDate) filter.timestamp.$gte = new Date(fromDate);
      if (toDate) filter.timestamp.$lte = new Date(toDate);
    }

    const logs = await SystemLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(10000);

    // Build CSV
    const csv = [
      'Timestamp,Action,Collection,DocumentId,UserId,IP Address,Changes',
      ...logs.map((log) => {
        const changes =
          log.changes && typeof log.changes === 'object'
            ? JSON.stringify(log.changes).replace(/"/g, '""')
            : log.changes || '';
        return `"${log.timestamp.toISOString()}","${log.action}","${
          log.collection_name || ''
        }","${log.document_id || ''}","${log.user_id || ''}","${
          log.ip_address || '-'
        }","${changes}"`;
      }),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="system-logs.csv"'
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ success: false, message: 'Lỗi xuất nhật ký' });
  }
};

// Clear old logs
exports.clearOldLogs = async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await SystemLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    // Log the action
    await SystemLog.create({
      action: 'CLEAR_OLD_LOGS',
      collection_name: 'systemlogs',
      changes: {
        deletedCount: result.deletedCount,
        daysOld,
      },
      user_id: req.user.id,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} nhật ký cũ`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing old logs:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa nhật ký' });
  }
};
