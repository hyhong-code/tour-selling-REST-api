const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
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
    res.status(400).json({ status: 'fail', message: error });
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
    res.status(400).json({ status: 'fail', message: error });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({ success: 'fail', message: 'No such tour' });
    }

    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: error });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
      // { $match: { _id: { $ne: 'EASY' } } },
    ]);
    res.status(200).json({ status: 'success', data: { stats } });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: error });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);
    res
      .status(200)
      .json({ status: 'success', results: plan.length, data: { plan } });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: error });
  }
};
