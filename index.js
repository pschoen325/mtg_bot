const Twit = require('twit'),
  scryfall = require('scryfall-sdk'),
  https = require('https');

require('dotenv').config()

const T = new Twit({
  consumer_key: process.env.BOT_CONSUMER_KEY,
  consumer_secret: process.env.BOT_CONSUMER_SECRET,
  access_token: process.env.BOT_ACCESS_TOKEN,
  access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET
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
                status: card.name
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