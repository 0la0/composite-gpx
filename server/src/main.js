import express from 'express';
import bodyParser from 'body-parser';
import profileService from './profileService.js';

const port = 3000;
const webServer = express();
webServer.use(bodyParser.json());

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
  profileService.getProfile(name)
    .then(activities => res.json(activities))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Error logged', });
    });
});

webServer.post('/api/renderview/:name', (req, res) => {
  const { name, } = req.params;
  profileService.createRenderView(name, req.body)
    .then(() => res.status(204).send())
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Error logged', });
    });
});

webServer.get('/api/renderview', (req, res) => {
  profileService.getRenderViews()
    .then(activities => res.json(activities))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Error logged', });
    });
});

webServer.get('/api/renderview/:name', (req, res) => {
  const { name, } = req.params;
  profileService.getRenderView(name)
    .then(activities => res.json(activities))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: 'Error logged', });
    });
});

webServer.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});
