const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

exports.getHospitals = async (req, res, next) => {
  let query;

  //Copy req.query

  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];

  //loop over remove fields and   delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);
  console.log(removeFields);
  //Create query string

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|let|in)\b/g,
    (match) => `$${match}`
  );

  query = Hospital.find(JSON.parse(queryStr));

  //Select Feilds
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // console.log(`---------${queryStr}`);
  // const x = req.query
  // console.log(x);

  // queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)
  // console.log(queryStr);
  // query = Hospital.find(JSON.parse(queryStr))
  try {
    const total = await Hospital.countDocuments();

    query = query.skip(startIndex).limit(limit);
    //Execute query
    const hospitals = await query;

    //Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res
      .status(200)
      .json({ success: true, count: hospitals.length, data: hospitals });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

exports.createHospital = async (req, res, next) => {
  console.log(req.body);
  const hospital = await Hospital.create(req.body);
  res.status(201).json({ success: true, data: hospital });
};

exports.updateHospital = async (req, res, next) => {
  try {
    const updateHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateHospital) {
      res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: updateHospital });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      res.status(400).json({ success: false });
    }
    hospital.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);

    res.status(400).json({ success: false });
  }
};
