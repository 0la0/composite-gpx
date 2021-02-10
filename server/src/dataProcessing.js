import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { DOMParser } from 'xmldom';
import { FILE_TYPE, DIR, } from './util.js';

function cleanTemporaryDirectories() {
  fs.rmSync(DIR.GPX, { recursive: true, force: true });
  fs.rmSync(DIR.FIT, { recursive: true, force: true });
  fs.mkdirSync(DIR.GPX);
  fs.mkdirSync(DIR.FIT);
}

function uncompressFiles() {
  fs.readdirSync(DIR.RAW).forEach((file) => {
    const srcFilePath = `${DIR.RAW}/${file}`;
    const fileExt = path.extname(srcFilePath);
    if (!fileExt) {
      return; 
    }
    if (fileExt === FILE_TYPE.GPX) {
      fs.copyFileSync(srcFilePath, `${DIR.GPX}/${file}`);
    }
    else if (file.endsWith(FILE_TYPE.GPX_GUNZIP)) {
      const gzIndex = file.lastIndexOf(FILE_TYPE.GUNZIP);
      const nameWithoutGz = file.slice(0, gzIndex);
      const destFilePath = `${DIR.GPX}/${nameWithoutGz}`;
      const gpxString = zlib.unzipSync(fs.readFileSync(srcFilePath)).toString('utf8');
      fs.writeFileSync(destFilePath, gpxString);
    }
    else if (file.endsWith(FILE_TYPE.FIT_GUNZIP)) {
      const fitGzIndex = file.lastIndexOf(FILE_TYPE.FIT_GUNZIP);
      const nameWithoutFitGz = file.slice(0, fitGzIndex);
      const uncompressedFitFilePath = `${DIR.FIT}/${nameWithoutFitGz}.fit`;
      const destFilePath = `${DIR.GPX}/${nameWithoutFitGz}.gpx`;
      const uncompressedFitBuffer = zlib.unzipSync(fs.readFileSync(srcFilePath));
      fs.writeFileSync(uncompressedFitFilePath, uncompressedFitBuffer);
      const fitToGpxCommand = `gpsbabel -i garmin_fit -f ${uncompressedFitFilePath} -o gpx -F ${destFilePath}`;
      child_process.execSync(fitToGpxCommand);
    }
    else {
      console.log(`Unrecognized file type: ${file}`);
    }
  });
  console.log('Files converted to gpx');
}

function gpxFileToJson(filePath) {
  const fileString = fs.readFileSync(filePath, 'utf8').toString();
  const doc = new DOMParser().parseFromString(fileString);
  const trk = doc.getElementsByTagName('trk')[0];
  const trkSegs = Array.prototype.slice.call(trk.getElementsByTagName('trkseg'));
  const trkPoints = trkSegs.flatMap(seg => {
    const points = seg.getElementsByTagName('trkpt');
    return Array.prototype.slice.call(points);
  });

  const points = trkPoints.map(trkPoint => {
    const elevationString = trkPoint.getElementsByTagName('ele')[0]?.textContent ?? '0';
    const time = trkPoint.getElementsByTagName('time')[0]?.textContent ?? '0';
    return {
      lat: parseFloat(trkPoint.getAttribute('lat')),
      lon: parseFloat(trkPoint.getAttribute('lon')),
      time,
      elevation: parseFloat(elevationString),
    };
  });

  const boundsElement = doc.getElementsByTagName('bounds')[0];
  const bounds = {
    minlat: parseFloat(boundsElement?.getAttribute('minlat') ?? '0'),
    minlon: parseFloat(boundsElement?.getAttribute('minlon') ?? '0'),
    maxlat: parseFloat(boundsElement?.getAttribute('maxlat') ?? '0'),
    maxlon: parseFloat(boundsElement?.getAttribute('maxlon') ?? '0'),
  };

  const activity = {
    time: points?.[0]?.time ?? '',
    bounds,
    points,
  };
  return activity;
}

function getMinimalActivities(activities) {
  return activities.map(activity => ({
    ...activity,
    points: activity.points.filter((point, index) => index % 20 === 0)
  }));
}

function convertGpxToJson(fileName) {
  const activities = fs.readdirSync(DIR.GPX).map((file) => {
    const srcFilePath = `${DIR.GPX}/${file}`;
    return gpxFileToJson(srcFilePath);
  });
  const data = { activities, };
  const minimalActivities = { activities: getMinimalActivities(activities), };
  fs.writeFileSync(`${DIR.JSON}/${fileName}.json`, JSON.stringify(data));
  fs.writeFileSync(`${DIR.JSON}/${fileName}.min.json`, JSON.stringify(minimalActivities));
}


function init() {
  const [ fileName, ] = process.argv.slice(2);
  if (!fileName) {
    console.log('Usage: npm run processData [fileName]');
    process.exit(1);
  }
  cleanTemporaryDirectories();
  uncompressFiles();
  convertGpxToJson(fileName);
}

init();
