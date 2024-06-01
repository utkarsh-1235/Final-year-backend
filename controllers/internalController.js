const { default: mongoose } = require("mongoose");
const Internal = require("./../models/Internal");
const asyncHandler = require("express-async-handler");

// @desc Get Internal Result
// @route GET /internal/:paper
// @access Everyone
const getInternal = asyncHandler(async (req, res) => {
  if (!req?.params?.paper) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const internal = await Internal.findOne({
    paper: req.params.paper,
  }).exec();
  if (!internal) {
    return res.status(404).json({
      message: "No Existing Record(s) found. Add New Record.",
    });
  }
  res.json(internal);
});

// @desc Get Internal Result
// @route GET /internal/student/:studentId
// @access Everyone
const getInternalStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const internal = await Internal.aggregate([
    {
      $lookup: {
        from: "paper",
        localField: "paper",
        foreignField: "_id",
        as: "paper",
      },
    },
    {
      $unwind: "$paper",
    },
    {
      $project: {
        marks: {
          $filter: {
            input: "$marks",
            as: "mark",
            cond: {
              $eq: [
                "$$mark._id",
                new mongoose.Types.ObjectId(req.params.studentId),
              ],
            },
          },
        },
        "paper.paper": 1,
      },
    },
    {
      $unwind: "$marks",
    },
  ]);
  if (!internal.length) {
    return res.status(404).json({
      message: "No Records Found.",
    });
  }
  res.json(internal);
});

// @desc Add Internal
// @route POST /Internal
// @access Private
const addInternal = asyncHandler(async (req, res) => {
  const subject = req.body.paper;
  const { marks } = req.body;

  // Confirm Data
  if (!subject || !marks || !Array.isArray(marks)) {
    return res.status(400).json({ message: "Incomplete Request: Fields Missing or invalid marks format" });
  }

  // Check for Duplicates
  const duplicate = await Internal.findOne({ subject }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Internal record already exists" });
  }

  // Save each student's marks
  const savedRecords = await Promise.all(
    marks.map(async (mark) => {
      const internalObj = {
        subject,
        marks: {
          CO1: {
            A1a: mark.CO1?.A1a || '',
            A1b: mark.CO1?.A1b || '',
            A1c: mark.CO1?.A1c || '',
            B2a: mark.CO1?.B2a || '',
            B2b: mark.CO1?.B2b || '',
            B2c: mark.CO1?.B2c || '',
            C3a: mark.CO1?.C3a || '',
            C3b: mark.CO1?.C3b || '',
            C5a: mark.CO1?.C5a || '',
          },
          CO2: {
            A1d: mark.CO2?.A1d || '',
            A1e: mark.CO2?.A1e || '',
            B2d: mark.CO2?.B2d || '',
            B2e: mark.CO2?.B2e || '',
            C4a: mark.CO2?.C4a || '',
            C4b: mark.CO2?.C4b || '',
            C5b: mark.CO2?.C5b || '',
          },
          CO3: {
            A1a: mark.CO3?.A1a || '',
            A1b: mark.CO3?.A1b || '',
            A1c: mark.CO3?.A1c || '',
            B2a: mark.CO3?.B2a || '',
            C3a: mark.CO3?.C3a || '',
            C3b: mark.CO3?.C3b || '',
          },
          CO4: {
            A1d: mark.CO4?.A1d || '',
            B2b: mark.CO4?.B2b || '',
            B2c: mark.CO4?.B2c || '',
            C4a: mark.CO4?.C4a || '',
            C4b: mark.CO4?.C4b || '',
          },
          CO5: {
            A1e: mark.CO5?.A1e || '',
            B2d: mark.CO5?.B2d || '',
            B2e: mark.CO5?.B2e || '',
            C5a: mark.CO5?.C5a || '',
            C5b: mark.CO5?.C5b || '',
          },
        },
      };

      const record = new Internal(internalObj);
      return record.save();
    })
  );

  if (savedRecords) {
    res.status(201).json({ message: `Internal Records Added`, data: savedRecords });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Internal
// @route PATCH /Internal
// @access Private
const updateInternal = asyncHandler(async (req, res) => {
  const { id, paper, marks } = req.body;

  // Confirm Data
  if (!id || !paper || !marks) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Record
  const record = await Internal.findById(id).exec();
  if (!record) {
    return res.status(404).json({ message: "Internal record doesn't exist" });
  }

  // Check for duplicate
  const duplicate = await Internal.findOne({
    paper: req.params.paper,
  })
    .lean()
    .exec();

  // Allow Updates to original
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" });
  }
  record.paper = paper;
  record.marks = marks;
  const save = await record.save();
  if (save) {
    res.json({
      message: ` Internal Record Updated`,
    });
  } else {
    res.json({ message: "Save Failed" });
  }
});

// @desc Delete Teacher
// @route DELETE /Teacher
// @access Private
const deleteInternal = asyncHandler(async (req, res) => {
  const id = req.params.paper;

  if (!id) {
    return res.status(400).json({ message: "Internal ID required" });
  }

  const record = await Internal.findById(id).exec();
  if (!record) {
    return res.status(404).json({ message: "Internal Record not found" });
  }

  await record.deleteOne();
  res.json({
    message: `Internal Record deleted`,
  });
});

module.exports = {
  getInternal,
  getInternalStudent,
  addInternal,
  updateInternal,
  deleteInternal,
};
