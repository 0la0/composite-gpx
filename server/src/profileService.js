import fs from 'fs';
import { DIR, FILE_TYPE, } from './util.js';

class ProfileService {
  getProfiles() {
    return new Promise((resolve, reject) => {
      fs.readdir(DIR.JSON, (error, files) => {
        if (error) {
          return reject(error);
        }
        const filesWithoutType = files.map(fileName => {
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
}

const profileService = new ProfileService();
export default profileService;
