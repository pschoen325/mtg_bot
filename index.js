const Twit = require('twit'),
  tumblr = require('tumblr.js'),
  scryfall = require('scryfall-sdk'),
  https = require('https');

require('dotenv').config()

const T = new Twit({
  consumer_key: process.env.BOT_CONSUMER_KEY,
  consumer_secret: process.env.BOT_CONSUMER_SECRET,
  access_token: process.env.BOT_ACCESS_TOKEN,
  access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET
});

const Tumbs = tumblr.createClient({
  consumer_key: process.env.TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
  token: process.env.TUMBLR_TOKEN,
  token_secret: process.env.TUMBLR_TOKEN_SECRET
});

function postRandomCard() {
  let base64;

  console.log('Finding a Card...');

  scryfall.Cards.random().then((card) => {
    https.get(card.image_uris.normal, (res) => {
      let body = "";

      res.setEncoding('binary');

      res.on('data', function (chunk) {
        if (res.statusCode == 200) body += chunk;
      });

      res.on('end', () => {
        base64 = new Buffer(body, 'binary').toString('base64')

        console.log('Converted!');
        console.log('Uploading an image...');

        Tumbs.createPhotoPost('mtg-cards-hourly.tumblr.com', {
          data64: base64,
          caption: `<h1>${card.name}</h1><i>Art By: ${card.artist}</i>`,
          tags: 'mtg, magic the gathering, tcg'
        }, (res) => {
          console.log('Posted On Tumblr')
        });

        T.post('media/upload', {
          media_data: base64
        }, function (err, data) {
          if (err) {
            console.log('Something went wrong');
            console.log(err);
          } else {
            console.log('Image uploaded');
            console.log('Tweeting Now...');

            T.post('statuses/update', {
                media_ids: new Array(data.media_id_string),
                status: `${card.name} #mtg`
              },
              function (err) {
                if (err) {
                  console.log('Something went wrong...');
                  console.log(err);
                } else {
                  console.log('Posted an image!');
                }
              }
            );
          }
        });
      });
    }).on('error', (err) => {
      console.log(`Got error: ${err.message}`);
    });
  }).catch();
};

postRandomCard();