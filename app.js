// =========================================
// ================ modules ================
// =========================================
const fs = require("fs");
const http = require("http");
const URL = require("url");
const slugify = require("slugify");

const makeHtml = require("./module/makeHtml");

//------------reading data---------------
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const productData = JSON.parse(data); //convert string to json
const raout = productData.map(
  (product) =>
    (product.routName = slugify(product.productName, {
      replacement: "-",
      lower: true,
    }))
);
//------------reading html files---------------
let overviewHTML = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  "utf-8"
);
let productHTML = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  "utf-8"
);
let templateCardHTML = fs.readFileSync(
  `${__dirname}/templates/template_card.html`,
  "utf-8"
);
let ProductCardHTML = fs.readFileSync(
  `${__dirname}/templates/product_card.html`,
  "utf-8"
);
// ----------------make dynamic html--------------

const server = http.createServer((req, res) => {
  let url = req.url;
  const urlraout = URL.parse(url, true).pathname.split("/").slice(-1).join("");
  //   console.log(urlObj);
  res.writeHead(200, { "content-type": "text/html" });
  if (url == "/" || url == "/overview") {
    const cardsHtml = productData
      .map((product) => makeHtml(templateCardHTML, product))
      .join("");
    let changeOverviewHtml = overviewHTML.replace(
      /{%PRODUCT_CARDS%}/g,
      cardsHtml
    );
    res.write(changeOverviewHtml);
    res.end();
  } else if (url == `/product/${urlraout}`) {
    let currentDataObj =
      productData[
        productData.findIndex((product) => product.routName == urlraout)
      ];
    let outputFigure = makeHtml(ProductCardHTML, currentDataObj);
    let output = productHTML.replace(/{%PRODUCT_CARDS%}/g, outputFigure);
    res.write(output);
    res.end();
  }
});
server.listen(process.env.PORT || 8000, "127.0.0.1", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server is running on http://127.0.0.1:8000`);
  }
});
