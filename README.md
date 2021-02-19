# CompositeGPX
Render multiple GPX activites as a high resolution image.

---

## Prepare Data
* install [gpsbabel](https://formulae.brew.sh/formula/gpsbabel)
* Get an archive of activities [strava bulk export](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export#Bulk)
* copy contents of activities directory to `server/_temp/raw`
* transform data to json:
```bash
cd server
npm run processData [user-name]
```

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

## Run
* `npm start`
* Navigate to [localhost:3001](http://localhost:3001)

---

![Editor Image](/readme_assets/editor.png?raw=true "Editor")

---

## Prepare Activity Area
* From the homepage, click on the `Editor` [link](http://localhost:3001/#/editor)
* In the "Profiles" section (upper right), a button should appear that matches the last argument from the earlier command: `npm run processData [user-name]`
* Click the profile option and the activies will appear in low resolution.
* Click the rectangle icon on the left to select an area to render.
* Cancel or confirm.

---

![Renderer Image](/readme_assets/renderer.png?raw=true "Renderer")

---

## Render Activities
* From the homepage, click on the `Renderer` [link](http://localhost:3001/#/renderer)
* In the "Profiles" section (upper right), a button should appear that matches the profile you selected in the previous step. Click a profile button.
* Click the "Render" button.
* To export, zoom in to 100%, right click on the image, and "Save Image As..."