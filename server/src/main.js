import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const FILE_TYPE = {
  GUNZIP: '.gz',
  GPX: '.gpx',
  FIT: '.fit',
  GPX_GUNZIP: '.gpx.gz',
  FIT_GUNZIP: '.fit.gz',
};

const DIR = {
  FIT: '_temp/fit',
  RAW: '_temp/raw',
  TRANSFORMED: '_temp/transformed',
};

function cleanTemporaryDirectories() {
  fs.rmSync(DIR.TRANSFORMED, { recursive: true, force: true });
  fs.rmSync(DIR.FIT, { recursive: true, force: true });
  fs.mkdirSync(DIR.TRANSFORMED);
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
      fs.copyFileSync(srcFilePath, `${DIR.TRANSFORMED}/${file}`);
    }
    else if (file.endsWith(FILE_TYPE.GPX_GUNZIP)) {
      const gzIndex = file.lastIndexOf(FILE_TYPE.GUNZIP);
      const nameWithoutGz = file.slice(0, gzIndex);
      const destFilePath = `${DIR.TRANSFORMED}/${nameWithoutGz}`;
      const gpxString = zlib.unzipSync(fs.readFileSync(srcFilePath)).toString('utf8');
      fs.writeFileSync(destFilePath, gpxString);
    }
    else if (file.endsWith(FILE_TYPE.FIT_GUNZIP)) {
      const fitGzIndex = file.lastIndexOf(FILE_TYPE.FIT_GUNZIP);
      const nameWithoutFitGz = file.slice(0, fitGzIndex);
      const uncompressedFitFilePath = `${DIR.FIT}/${nameWithoutFitGz}.fit`;
      const destFilePath = `${DIR.TRANSFORMED}/${nameWithoutFitGz}.gpx`;

      const uncompressedFitBuffer = zlib.unzipSync(fs.readFileSync(srcFilePath));
      fs.writeFileSync(uncompressedFitFilePath, uncompressedFitBuffer);

      const fitToGpxCommand = `gpsbabel -i garmin_fit -f ${uncompressedFitFilePath} -o gpx -F ${destFilePath}`;
      child_process.execSync(fitToGpxCommand);

      // gpsbabel -i garmin_fit -f INPUT_FILE.fit -o gpx -F OUTPUT_FILE.gpx
      
      // console.log('TODO: move', file, destFilePath);

      // const gpxString = zlib.unzipSync(fs.readFileSync(srcFilePath)).toString('utf8');
      // fs.writeFileSync(destFilePath, gpxString);
    }
  });  
}

function init() {
  cleanTemporaryDirectories();
  uncompressFiles();
}

init();
