var express = require('express');
var router = express.Router();

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = "1035596612539-vtjplkj18vtbvuvago3hu92hq8b8ufhq.apps.googleusercontent.com";
var CLIENT_SECRET = "TIHbmDlynZ8rq6V5n2tEgw0T";
var REDIRECT_URL = "http://localhost:3000/oauth2callback";

var oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

/*
 * GET home page.
 * Generate OAuth2 URL.
 */
router.get('/', function(req, res, next) {
  var scopes = [
    'https://www.googleapis.com/auth/calendar'
  ];

  var url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'online',

    // If you only need one scope you can pass it as a string
    scope: scopes,

    // Optional property that passes state parameters to redirect URI
    // state: { foo: 'bar' }
  });

  res.render('index', {
    title: 'Mini Calendar APP',
    authURL: url
  });
});

/*
 * GET OAuth2 callback page.
 * Get authcode back from API. Use that code to get authentication token.
 */
router.get('/oauth2callback', function(req, res, next) {
  var code = req.query.code;

  var success = false;

  oauth2Client.getToken(code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
      success = true;
    }

    res.render('auth', {
      'success': success
    });
  });
});

/*
 * GET OAuth2 callback page.
 * Get 10 upcoming events using Google Calendar API.
 */
router.get('/events', function(req, res, next) {
  var calendar = google.calendar('v3');
  var events = [];

  calendar.events.list({
    auth: oauth2Client,
    calendarId: 'avans.nl_jha4b97ckbfm2sdqedfndob824@group.calendar.google.com',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      res.render('events', { 'events': events });
      return;
    }

    console.log(response);

    events = response.items;

    console.log(oauth2Client);
    console.log(events);

    res.render('events', { 'events': events });
  });
});

module.exports = router;
