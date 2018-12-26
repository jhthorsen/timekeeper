module.exports = function(config) {
  config.entry = {
    "timekeeper": "./assets/timekeeper.js",
  };

  config.module.rules.push({
    test: /\.(png|jpe?g|svg)\b/,
    use: {
      loader: "url-loader",
      options: {
        limit: 100000
      }
    }
  });
};
