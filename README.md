# FCC-Image Search Abstraction Layer

## Overview
Implementation of this user stories:

**User Story:** I can get the image URLs, alt text and page urls for a set of images relating to a given search string.

**User Story:** I can paginate through the responses by adding a ?offset=2 parameter to the URL.

**User Story:** I can get a list of the most recently submitted search strings.

## Installation
```
git clone https://github.com/Apprryx/fcc-image-search-abstraction-layer.git
cd fcc-image-search-abstraction-layer
npm install
npm start
```

.env
```
SECRET=generate-your-secret
PORT=8080
APP_URL=http://localhost:8080/
DB_URI=url-to-mongodb
accKey=bing-api-key
```
## License

MIT License. [Click here for more information.](LICENSE.md)
