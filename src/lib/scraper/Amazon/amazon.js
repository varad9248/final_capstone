"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import  extractCurrency from '../utils.js';
import extractPrice  from '../utils.js';
import { Review } from '../../../models/Review.model.js';

export default async function scrapeAmazonProduct(url, productName) {
  if (!url) return;

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
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images =
      $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}';

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'));
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');

    const description = $('#productDescription span').text() || $('#feature-bullets li').text();

    const category = $('#nav-subnav img').attr('alt');

    const stars = $('i.a-icon.a-icon-star.a-star-4.cm-cr-review-stars-spacing-big span').text().replace(" out of 5 stars");

    const reviews_element = $('#cm-cr-dp-review-list div.a-section.celwidget');

    let reviews_data = [];
    
    reviews_element.each(async (index , element) => {
      const $ = cheerio.load(element);
      // Extract reviewer name
      const review_author = $('a.a-profile span.a-profile-name').text().trim().replace(/\n/g,"");
  
      const review_title = $('[data-hook="review-title"]').text().trim().replace(/\n/g,"");
  
      const review_desc = $('[data-hook="review-body"]').text().trim().replace(/\n/g,"");
  
      const review_rating =Number( $('[data-hook="review-star-rating"] .a-icon-alt').text().trim().replace(" out of 5 stars",""));

      const review_sentiment = ( review_rating  >= 4 ) ? "positive" : (review_rating == 3)  ? "neutral" : "negative";
  
      const newReview = await Review.create({
        review_author : review_author,
        review_title : review_title,
        review_desc : review_desc,
        review_rating : review_rating,
        review_sentiment : review_sentiment
      });

      reviews_data.push(newReview);
    })

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [ Number(currentPrice) ],
      discountRate: Number(discountRate),
      category: category || 'category',
      reviewsCount: 100,
      stars: Number(stars),
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      product_reviews : reviews_data,
      domain: "Amazon",
      searchId: productName,
    };

    return data;
  } catch (error) {
    console.log(error);
  }
}
