# cda-api
api for [cda]("https://www.cda.pl")

# example of use
```js
const { CdaSearchApi, CdaVideoApi } = require("cda-api");

let search = await CdaSearchApi.search("<search query>"); // search query
let videoApi = await CdaVideoApi.fromURL(search[0].link); // you can also use method fromID to get video api from id

let qualities = videoApi.getQualities(); // get qualities
let videoURL = videoApi.getVideoLink(Array.from(qualities.keys()).reverse()[0]); // get video link (highest quality)

let videoData = videoApi.getVideoData(); // gets most info about video (including comments)
```