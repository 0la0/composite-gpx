import fs from 'fs';
import { DIR, FILE_TYPE, } from './util.js';

// bounds: { minlat, minlon, maxlat, maxlon }
const transformPoint = ({ lat, lon,}, bounds) => {
  const latRange = bounds.maxlat - bounds.minlat;
  const lonRange = bounds.maxlon - bounds.minlon;
  const transformedLat = (bounds.maxlat - lat) / latRange;
  const transformedLon = (lon - bounds.minlon) / lonRange;
  return {
    lat: transformedLat,
    lon: transformedLon,
  };
}

class ProfileService {
  getProfiles() {
    return new Promise((resolve, reject) => {
      fs.readdir(DIR.JSON, (error, files) => {
        if (error) {
          return reject(error);
        }
        const filesWithoutType = files
          .filter(fileName => fileName.lastIndexOf('.min.json') >= 0)
          .map(fileName => {
            const jsonIndex = fileName.lastIndexOf(FILE_TYPE.JSON);
            const nameWithoutJson = fileName.slice(0, jsonIndex);
            return nameWithoutJson;
          });
        return resolve({ profiles: filesWithoutType, });
      });
    });
  }

  getProfile(name) {
    return new Promise((resolve, reject) => {
      const filePath = `${DIR.JSON}/${name}${FILE_TYPE.JSON}`;
      fs.readFile(filePath, 'utf8', (error, fileBuffer) => {
        if (error) {
          return reject(error);
        }
        try {
          const fileString = fileBuffer.toString();
          const activityJson = JSON.parse(fileString);
          return resolve(activityJson);
        } catch (error) {
          return reject(error);
        }
      });
    });
  }

  createRenderView(name, body) {
    const { bounds, } = body;
    return new Promise((resolve) => {
      const modifiedFileName = name.replace('.min', '');
      const file = fs.readFileSync(`${DIR.JSON}/${modifiedFileName}${FILE_TYPE.JSON}`).toString('utf8');
      const fileContents = JSON.parse(file);
      const modifiedActivities = fileContents.activities.map(activity => {
        const transformedPoints = activity.points
          .map(point => ({
            ...point,
            ...transformPoint(point, bounds),
          }))
          .filter(point => point.lat >= 0 && point.lat <= 1 && point.lon >=0 && point.lon <= 1);
        return {
          ...activity,
          points: transformedPoints,
        };
      }).filter(activity => activity.points.length);
      const appFile = {
        activities: modifiedActivities,
        bounds,
      };
      fs.writeFileSync(`${DIR.JSON}/${body.name}.app.json`, JSON.stringify(appFile));
      return resolve();
    });
  }

  getRenderViews() {
    return new Promise((resolve, reject) => {
      fs.readdir(DIR.JSON, (error, files) => {
        if (error) {
          return reject(error);
        }
        const filesWithoutType = files
          .filter(fileName => fileName.lastIndexOf('.app.json') >= 0)
          .map(fileName => {
            const jsonIndex = fileName.lastIndexOf(FILE_TYPE.JSON);
            const nameWithoutJson = fileName.slice(0, jsonIndex);
            return nameWithoutJson;
          });
        return resolve({ views: filesWithoutType, });
      });
    });
  }

  getRenderView(name) {
    return new Promise((resolve, reject) => {
      const filePath = `${DIR.JSON}/${name}${FILE_TYPE.JSON}`;
      fs.readFile(filePath, 'utf8', (error, fileBuffer) => {
        if (error) {
          return reject(error);
        }
        try {
          const fileString = fileBuffer.toString();
          const activityJson = JSON.parse(fileString);
          return resolve(activityJson);
        } catch (error) {
          return reject(error);
        }
      });
    });
  }
}

const profileService = new ProfileService();
export default profileService;
