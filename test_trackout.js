const mongoose = require('mongoose');
const URI = 'mongodb+srv://prathamesh:Cmaxhxhc3@cluster0.crbtvne.mongodb.net/trackout?appName=Cluster0';

console.log('Testing connection to TRACKOUT database:', URI);

mongoose.connect(URI)
  .then(() => {
    console.log('SUCCESS: TrackOut database connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: TrackOut database also failed');
    console.error(err);
    process.exit(1);
  });
