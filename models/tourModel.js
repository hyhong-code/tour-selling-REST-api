const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name is required for a tour'],
      unique: true,
      trim: true,
      maxlength: [40, 'A name can have at most 40 characters'],
      minlength: [10, 'A name must have at least 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A duration is required for a tour'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A maxGroupSize is required for a tour'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be of easy, medium, or difficult',
      },
      required: [true, 'A difficulty is required for a tour'],
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'A rating must be above 1.0'], // Also works with dates
      max: [5, 'A rating must be below 5.0'],
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A price is required for a tour'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this keyword only works on creation not update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be below tour price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A description is required for a tour'],
    },
    imageCover: {
      type: String,
      required: [true, 'A imageCover is required for a tour'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date], //2021-03-21,11:32
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // Everytime data is outputted as JSON or Object, include the virtuals
    toJSON: { virtuals: true },
    toObject: { virtual: true },
  }
);

// Virtuals cannot be selected
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate reviews
TourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

// Document middleware: runs before .save() and .create(), NOT update
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embed tour guides into TourModel
// TourSchema.pre('save', async function (next) {
//   // .map() cannot be made async
//   const guidesPromises = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// TourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Populate guides for every query
TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// Query middleware (this points to current query)
TourSchema.pre(/^find/, function (next) {
  // Regex to match all find queries
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

TourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// Aggregation middleware (this points to current aggregation object)
TourSchema.pre('aggregate', function (next) {
  // this.pipeline() returns the pipeline array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
