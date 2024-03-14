import axios from 'axios';
import * as cheerio from 'cheerio';
import  scrapeAmazonProduct  from "./amazon.js";
import { Product } from "../../../models/Product.model.js";
import { SearchProduct } from '../../../models/SearchProduct.model.js';
import { getAveragePrice, getHighestPrice, getLowestPrice } from '../utils.js';

export async function scrapeAmazonPage(ProductName , searchId) {
  if (!ProductName) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  };

  try {
    // Fetch the product page
    const url = createUrlAmazon(ProductName);
    const response = await axios.get(url , options);
    const $ = cheerio.load(response.data);

    const link_elements = $('[data-asin] h2 a');

    const urls = [];
    let count = 0;
    link_elements.each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        if(count >= 3) return;
        const page_url = urljoin(url, href);
        console.log(page_url);
        urls.push(page_url);
      }
      count++;
    });

    let products = []; 
  
    for (let i = 0; i<urls.length;i++) {

      let intervalId = setInterval(() => {
          console.log('Delayed action');
      }, 5000);
      setTimeout(() => {
          clearInterval(intervalId);
      }, 5000);

      const prod = await scrapeAmazonProduct(urls[i] , ProductName);
      
      if(! prod) return;
      
      let product = prod;

      const existingProduct = await Product.findOne({ title: prod?.title});

      if(existingProduct) {

        const updatedPriceHistory = [
          ...existingProduct.priceHistory,
          prod?.currentPrice 
        ]
       
        product = await Product.findByIdAndUpdate(
          existingProduct._id,
          {
            $Set: {
              priceHistory: updatedPriceHistory,
              lowestPrice: getLowestPrice(updatedPriceHistory),
              highestPrice: getHighestPrice(updatedPriceHistory),
              averagePrice: getAveragePrice(updatedPriceHistory)
            } 
          }
        )

        await SearchProduct.findByIdAndUpdate(
          searchId,
          {
            $addToSet : {
              scrapedProducts : product?._id 
            }
          }
        )

        for ( const review of prod.reviews ){
          await Product.findByIdAndUpdate(
            product?._id,
            {
              $addToSet: { 
                reviews:review 
              }
            },
            {new : true}
          )
        }

        products.push(product);
        continue;
      }

      const newProduct = await Product.create(product);

      await SearchProduct.findByIdAndUpdate(
        searchId,
        {
          $addToSet : {
            scrapedProducts : newProduct?._id 
          }
        }
      )

      products.push(newProduct);

    }
    return products;

  } catch (error) {
    console.log(error);
  }
}

function createUrlAmazon(productName) {
  const query = encodeURIComponent(productName.toString());
  const baseUrl = "https://www.amazon.in/s?k=";
  const searchUrl = baseUrl + query;
  return searchUrl;
}

function urljoin(listing_url, href) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  if (href.startsWith('/')) {
    href = href.slice(1);
  }
  const parts = listing_url.split('/');
  parts.pop();
  return parts.join('/') + '/' + href;
}
