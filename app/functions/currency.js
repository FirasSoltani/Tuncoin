/***** GLOBAL IMPORTS *****/
const axios = require("axios");
const NewsAPI = require("newsapi");

/***** FUNCTIONS GOES HERE *****/
/* GET CRYPTOCURRENCY VALUES */
exports.cryptocurrencyValues = (req, res, next) => {
  axios
    .get(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.CRYPTOCURRENCY_VALUES}&ids=BTC,ETH,XRP&interval=1d,30d&convert=EUR&per-page=100&page=1`
    )
    .then((response) => {
      res.status(200).json({ values: response.data});
    });
};

/* GET CRYPTOCURRENCY NEWS */
exports.cryptocurrencyNews = (req, res, next) => {
  const newsapi = new NewsAPI(process.env.CRYPTOCURRENCY_NEWS);
  newsapi.v2
    .topHeadlines({
      q: "bitcoin",
      category: "business",
      language: "en",
    })
    .then((response) => {
      res.status(200).json({articles: response.articles});
    });
};
