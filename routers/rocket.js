//client sidee displays

const express = require('express');
const router = express.Router();
const cors = require('cors');// make sure not just anyone can use my post requests
// const passport = require('passport');
// const passportJWT = passport.authenticate('jwt', {session: false, failureRedirect: '/auth'});
// const viewItemDetails = require('../../presets/viewItemDetails');
// const fourOhFour = require('../../presets/fourOhFour');

const corsOptions = require('../../../src/utils/cors-options');// use the main one in landing-pages src dir
// const process_memory = require('../utils/process_memory.js');

//path: origin/user/
// cant use jwt unless i can modify the socket.io headers
// router.get("/", cors(corsOptions), /*passportJWT,*/ viewItemDetails);
// router.get("/:val1?", cors(corsOptions), /*passportJWT,*/ viewItemDetails);// needed to help link/script contamination
// router.get("/:val1?/:val2?", cors(corsOptions), /*passportJWT,*/ viewItemDetails);// needed to help link/script contamination
// router.get("/:val1?/:val2?/:val3?/*", cors(corsOptions), /*passportJWT,*/ fourOhFour);// needed to help link/script contamination

router.get('/', cors(corsOptions), (req, res) => {
  // res.send('my 404 page')
  try {

    console.log("[rocket]");

    res.render('rocket');
    // res.send('hello rocket');
    //see routers/alight.js for example on sending data

  } catch (e) {
      res.render('404', {
        title:'404',
        errorMessage:'an error has occured'
      });
  }
})// catch all



// router.get('/liftoff', cors(corsOptions), (req, res) => {
//   console.log("[rocket liftoff]");
// })// catch all

router.get('/help', cors(corsOptions), (req, res) => {
  // res.send('Hello express!')
  res.render('help', {
    title:'Help',
    name: 'Andrew Mead',
    help_txt: 'Some help message'
  })
})

// router.get('/*', cors(corsOptions), (req, res) => {
//   // res.send('my 404 page')
//   console.log("[alight 404]");
//   res.render('404', {
//     title:'404',
//     errorMessage:'article not found'
//   });
// })// catch all


module.exports = router;

// const express = require('express');
// const router = express.Router();
//
// module.exports = router;
