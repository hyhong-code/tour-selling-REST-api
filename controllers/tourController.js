const fs = require('fs');
const Tour = require('../models/tourModel');

// Route handlers
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (error) {
    console.error(error);
    res.status(404).json({ statsu: 'fail', message: error });
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
