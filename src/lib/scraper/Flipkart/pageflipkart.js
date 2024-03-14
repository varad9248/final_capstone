import axios from 'axios';
import * as cheerio from 'cheerio';
import  scrapeFlipkartProduct  from './flipkart.js';
import { Product } from "../../../models/Product.model.js";
import { SearchProduct } from '../../../models/SearchProduct.model.js';
import { getAveragePrice, getHighestPrice, getLowestPrice } from '../utils.js';


export async function scrapeFlipkartPage(ProductName , searchId ) {
    let retries = 0;
    console.log("entered");
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

    const CUSTOM_HEADERS = {
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      'accept-language': 'en-GB,en;q=0.9'}
  
      try {
          // Fetch the product page
          const url = createUrlFlipkart(ProductName);
          const response = await axios({
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
            },
            method: "GET",
            url: url,
          } , options);
    
          if(!response) throw new Error(`Failed to fetch ${url}: ${response.status}`);
          const $ = cheerio.load(await response.data);
  
          const link1_elements = $('a._1fQZEK');
          const link2_elements = $('a._2UzuFa');
          const link3_elements = $('a._2rpwqI');
          const link4_elements = $('a.s1Q9rs');
          
          let link_elements;
          if (link1_elements.length > 0) {
              link_elements = link1_elements;
          } else if (link2_elements.length > 0) {
              link_elements = link2_elements;
          } else if (link3_elements.length > 0) {
              link_elements = link3_elements;
          } else {
              link_elements = link4_elements;
          }
          
          const urls = [];
          let count = 0;
          link_elements.each((_, element) => {
              const href = $(element).attr('href');
              if (href) {
                if(count >=3 ) return;
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
    
          const prod = await scrapeFlipkartProduct(urls[i] , ProductName);
          
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
        console.log(error.message);
      }
    }
  
  function createUrlFlipkart(productName) {
    const query = encodeURIComponent(productName.toString()); // Encode special characters in the query
    const baseUrl = 'https://www.flipkart.com/search?q=';
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
  