const Assembly = require('../models/Assembly');
const Topic = require('../models/Topic');

const mapCouncilResponse = (assembly) => {
  const data = assembly.toObject ? assembly.toObject() : assembly;
  return {
    ...data,
    council_name: data.assembly_name,
    council_description: data.assembly_description,
    defense_date: data.defense_date,
    defense_location: data.defense_location,
    council_status: data.assembly_status,
  };
};

const buildAssemblyPayload = (body) => {
  const payload = {};

  if (body.assembly_name || body.council_name) {
    payload.assembly_name = body.assembly_name || body.council_name;
  }
  if (body.assembly_description || body.council_description) {
    payload.assembly_description =
      body.assembly_description || body.council_description;
  }
  if (body.defense_date !== undefined) {
    payload.defense_date = body.defense_date;
  }
  if (body.defense_location !== undefined) {
    payload.defense_location = body.defense_location;
  }
  if (body.assembly_status || body.council_status) {
    payload.assembly_status = body.assembly_status || body.council_status;
  }
  if (body.assembly_major) {
    payload.assembly_major = body.assembly_major;
  }
  if (body.chairman) {
    payload.chairman = body.chairman;
  }
  if (body.secretary) {
    payload.secretary = body.secretary;
  }
  if (Array.isArray(body.members)) {
    payload.members = body.members;
  }

  return payload;
};

const getAllCouncils = async (req, res, next) => {
  try {
    const assemblies = await Assembly.find()
      .sort({ created_at: -1 })
      .populate('chairman', 'full_name email')
      .populate('secretary', 'full_name email')
      .populate('members.member_id', 'full_name email');
    const data = assemblies.map(mapCouncilResponse);

    // Fetch topics for each council
    const topics = await Topic.find({
      topic_assembly: { $in: assemblies.map((a) => a._id) },
    }).select('topic_title topic_assembly');

    const dataWithTopics = data.map((council) => {
      const councilTopics = topics.filter(
        (t) => String(t.topic_assembly) === String(council._id)
      );
      return { ...council, topics: councilTopics };
    });

    res.status(200).json({
      success: true,
      count: dataWithTopics.length,
      data: dataWithTopics,
    });
  } catch (error) {
    next(error);
  }
};

const getCouncilById = async (req, res, next) => {
  try {
    const assembly = await Assembly.findById(req.params.id)
      .populate('chairman', 'full_name email')
      .populate('secretary', 'full_name email')
      .populate('members.member_id', 'full_name email');
    if (!assembly) {
      return res
        .status(404)
        .json({ success: false, message: 'Council not found' });
    }

    const topics = await Topic.find({ topic_assembly: assembly._id }).select(
      'topic_title topic_assembly'
    );
    const data = { ...mapCouncilResponse(assembly), topics };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createCouncil = async (req, res, next) => {
  try {
    const payload = buildAssemblyPayload(req.body);
    const assembly = await Assembly.create(payload);

    if (req.body.topics && Array.isArray(req.body.topics)) {
      await Topic.updateMany(
        { _id: { $in: req.body.topics } },
        { topic_assembly: assembly._id }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Created successfully',
      data: mapCouncilResponse(assembly),
    });
  } catch (error) {
    next(error);
  }
};

const updateCouncil = async (req, res, next) => {
  try {
    const payload = buildAssemblyPayload(req.body);
    const assembly = await Assembly.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!assembly) {
      return res
        .status(404)
        .json({ success: false, message: 'Council not found' });
    }

    if (req.body.topics && Array.isArray(req.body.topics)) {
      // Unset previous topics explicitly
      await Topic.updateMany(
        { topic_assembly: assembly._id },
        { $unset: { topic_assembly: 1 } }
      );
      // Set new ones
      if (req.body.topics.length > 0) {
        await Topic.updateMany(
          { _id: { $in: req.body.topics } },
          { topic_assembly: assembly._id }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Updated successfully',
      data: mapCouncilResponse(assembly),
    });
  } catch (error) {
    next(error);
  }
};

const deleteCouncil = async (req, res, next) => {
  try {
    const assembly = await Assembly.findByIdAndDelete(req.params.id);
    if (!assembly) {
      return res
        .status(404)
        .json({ success: false, message: 'Council not found' });
    }
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCouncils,
  getCouncilById,
  createCouncil,
  updateCouncil,
  deleteCouncil,
};
