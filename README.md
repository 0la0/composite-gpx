# CompositeGPX
Render multiple GPX activites as a high resolution image.

![Renderer Image](/readme_assets/screen-recording.gif "Example Animation")

![Renderer Image](/readme_assets/example_0.png "Example Image")

![Renderer Image](/readme_assets/example_1.png "Example Image")

--- 

## Setup
* `npm install; cd server; npm install`
* [Create a MapBox access token](https://account.mapbox.com/access-tokens/)
* Createa a file in the root directory called `.env.json`
* Add the access token and optional initial map coordinates:
```json
 {
   "mapBoxAccessToken": "MAP_BOX_ACCESS_TOKEN",
   "initialCoords": {
    "lat": 0,
    "lon": 0
  }
 }
```

---

## Prepare Data
* install [gpsbabel](https://formulae.brew.sh/formula/gpsbabel)
* Get an archive of activities
  * [Strava bulk export](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export#Bulk)
  * [Garmin bulk export](https://www.garmin.com/en-US/account/datamanagement/exportdata/)
* create the directory structure: `server/_temp/raw`:
```bash
mkdir server/_temp; mkdir server/_temp/raw
```
* Copy activity files to: `server/_temp/raw`
* Transform activity files to JSON:
```bash
cd server
npm run processData [user-name]
```

---  

## Run
* From the root directory, run: `npm start`
* Navigate to [localhost:3001](http://localhost:3001)

---

## Prepare Activity Area
* From the homepage, click on the [Editor link](http://localhost:3001/#/editor)
* In the "Profiles" section (upper right), a button should appear that matches the last argument from the earlier command: `npm run processData [user-name]`
* Click the profile option and the activies will appear in low resolution.
* Click the rectangle icon on the left to select an area to render.
* Enter a name for activity profile and click "confirm".

---

## Render Activities (2D)
* From the homepage, click on [Renderer 2D](http://localhost:3001/#/renderer-2d)
* In the "Profiles" section (upper right), a selection should appear that matches a profile created the previous step.
* Click the "Render" button.
* After modifying render settings, click "Render" to see the results.
* To export, right click on the image and select "Save Image"

---

## Render Activities (3D)
* From the homepage, click on [Renderer 3D](http://localhost:3001/#/renderer-3d)
* In the "Profiles" section (upper right), a selection should appear that matches the profile you selected in the previous step.
* Click the "Start" button.
* After modifying render settings, click "Pause / Start" to see the results.
* To skip animating the data, set the "Animation Speed" to 0.
