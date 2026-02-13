const SystemSetting = require('../../models/SystemSetting');
const SystemLog = require('../../models/SystemLog');

// Get all system settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();

    // Create default if not exists
    if (!settings) {
      settings = new SystemSetting();
      await settings.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi lấy cài đặt hệ thống' });
  }
};

// Update system settings
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;

    let settings = await SystemSetting.findOne();

    if (!settings) {
      settings = new SystemSetting(updateData);
    } else {
      Object.assign(settings, updateData);
    }

    settings.updated_by = req.user._id;
    settings.updated_at = Date.now();

    await settings.save();

    // Log action
    await SystemLog.create({
      action: 'UPDATE_SYSTEM_SETTINGS',
      collection_name: 'systemsettings',
      user_id: req.user.user_id,
      changes: updateData,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'Cập nhật cài đặt thành công',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật cài đặt' });
  }
};

// Get specific setting
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const settings = await SystemSetting.findOne();

    if (!settings || !settings[key]) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy cài đặt' });
    }

    res.json({
      success: true,
      data: { [key]: settings[key] },
    });
  } catch (error) {
    console.error('Error getting setting:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy cài đặt' });
  }
};

// Update specific setting
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    let settings = await SystemSetting.findOne();

    if (!settings) {
      settings = new SystemSetting();
    }

    settings[key] = value;
    settings.updated_by = req.user._id;
    settings.updated_at = Date.now();

    await settings.save();

    // Log action
    await SystemLog.create({
      action: 'UPDATE_SETTING',
      collection_name: 'systemsettings',
      user_id: req.user.user_id,
      changes: { key, value },
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: 'Cập nhật cài đặt thành công',
      data: { [key]: value },
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật cài đặt' });
  }
};
