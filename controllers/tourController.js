const fs = require('fs');
const Tour = require('../models/tourModel');

// Route handlers
exports.getAllTours = async (req, res) => {
  console.log(req.query);

  try {
    // 1. Filtering
    const queryObj = { ...req.query };

    // Exclude query keywords
    const excludedFields = ['fields', 'sort', 'page', 'limit'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Use query operators
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(lt|lte|gt|gte|in)\b/g,
      (match) => `$${match}`
    );

    // Build up query
    let query = Tour.find(JSON.parse(queryStr)); // if no await, returns query doc

    // 2. Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(',').join(' ')); // sort('price ratingsAverage')
    } else {
      query = query.sort('-createdAt');
    }

    // 3. Fields limiting
    if (req.query.fields) {
      query = query.select(req.query.fields.split(',').join(' '));
    } else {
      query = query.select('-__v'); // no need to send __v to client
    }

    // 4. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const totalNumDocs = await Tour.countDocuments();
    if (req.query.page && skip >= totalNumDocs) {
      throw new Error(`Page ${req.query.page} does not exist`);
    }

    // Execute query
    const tours = await query;
    res
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (error) {
    console.error(error);
    res.status(404).json({ statsu: 'fail', message: error.message });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // findOne({ _id:req.params.id })

    if (!tour) {
      return res.status(404).json({ success: 'fail', message: 'No such tour' });
    }

    res.status(200).json({ status: 'success', data: { tour } });
  } catch (error) {
    console.error(error);
    res.status(404).json({ statsu: 'fail', message: error });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour } });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: 'Invalid data sent!' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({ success: 'fail', message: 'No such tour' });
    }

    res.status(200).json({ status: 'success', data: tour });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: 'Invalid data sent!' });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    let tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ success: 'fail', message: 'No such tour' });
    }

    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: 'Invalid data sent!' });
  }
};
