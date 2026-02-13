const Assembly = require('../models/Assembly');

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
    const assemblies = await Assembly.find().sort({ created_at: -1 });
    const data = assemblies.map(mapCouncilResponse);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

const getCouncilById = async (req, res, next) => {
  try {
    const assembly = await Assembly.findById(req.params.id);
    if (!assembly) {
      return res
        .status(404)
        .json({ success: false, message: 'Council not found' });
    }
    res.status(200).json({ success: true, data: mapCouncilResponse(assembly) });
  } catch (error) {
    next(error);
  }
};

const createCouncil = async (req, res, next) => {
  try {
    const payload = buildAssemblyPayload(req.body);
    const assembly = await Assembly.create(payload);
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
    const assembly = await Assembly.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!assembly) {
      return res
        .status(404)
        .json({ success: false, message: 'Council not found' });
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
