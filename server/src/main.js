import express from 'express';
import profileService from './profileService.js';

const port = 3000;
const webServer = express();

webServer.get('/api/profile', (req, res) => {
  profileService.getProfiles()
    .then(activities => res.json(activities))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Error logged', });
    });
});

webServer.get('/api/profile/:name', (req, res) => {
  const { name, } = req.params;
  console.log('get', name);
  profileService.getProfile(name)
    .then(activities => res.json(activities))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Error logged', });
    });
});

webServer.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});
