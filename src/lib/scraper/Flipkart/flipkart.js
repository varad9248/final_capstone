import axios from 'axios';
import * as cheerio from 'cheerio';
import extractPrice  from '../utils.js';

export default async function scrapeFlipkartProduct(url, searchId) {
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
    if(response.status !== 200)  throw new Error(`Failed to fetch ${url}: ${response.status}`);
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('.yhB1nd span').text().trim();
    const currentPrice = extractPrice(
      $('._25b18c div._16Jk6d'),
      $('._16Jk6d'),
      $('.a-button-selected .a-color-base'),
    );

    const originalPrice = $('div._3I9_wc._2p6lqe').text().substring(1).replace(/,/g, '')
      || $('._25b18c div._3I9_wc').text().substring(1).replace(/,/g, '');

    const outOfStock = false;

    const images =
      $('._3kidJX div.CXW8mj img._396cs4._2amPTt._3qGmMb').attr('src')
      || $('._3nMexc').attr('srcset')
      || '{}';

    const currency = $('div._3I9_wc._2p6lqe').text()[0]
      || $('._25b18c div._3I9_wc').text()[0];

    const discountRate = $('div._3Ay6Sb._31Dcoz span').text().replace(/[-%]/g, "").replace(" off", "");

    let description = $('div._1mXcCf.RmoJUa p').text() || $('div._2418kt li').text() || title;

    const starsCount = $('div._2d4LTz').text().trim() || 0;

    const reviewElement = $('span._2_R_DZ').children().last();

    const reviewsCount = reviewElement.text().split(' ')[0].replace(/,/g, '');

    const category_words = $('a._2whKao').text().trim().split(/\s+/);

    const category = category_words[category_words.length - 1];

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
        review_author : review_author ,
        review_title : review_title,
        review_desc : review_desc,
        review_rating : review_rating,
        review_sentiment : review_sentiment
      });

      reviews_data.push(newReview._id);
    })


    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: images,
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: category || 'category',
      reviewsCount: Number(reviewsCount),
      stars: Number(starsCount),
      starsCount: Number(starsCount),
      avgStars: Number(starsCount),
      isOutOfStock: outOfStock,
      description,
      reviews : reviews_data,
      domain: "Flipkart",
      searchId: searchId,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };

    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}
