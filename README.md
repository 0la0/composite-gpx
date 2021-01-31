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
* `npm install`
* [Create a MapBox access token](https://account.mapbox.com/access-tokens/)
* Createa a file in the root directory called `.env.json`
* Add the access token in the json: `{ "mapBoxAccessToken": MAP_BOX_ACCESS_TOKEN }`

---  

## Run
* `npm start`
* Navigate to [localhost:3001](http://localhost:3001)

---
