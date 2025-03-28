// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

function stringify(arr) {

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  var byteToHex = [];

  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
  }
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}
// IMPORTANT: any change done here has to be followed by `npm run build-script`
// this will build & generate `bundledVidjetModule`
var Vidjet = (function () {
  // private variables
  // we want to display full-size on tablets
  var isTablet = /(tablet|ipad|playbook|silk|kindle)/i.test(navigator.userAgent);
  var isMobile = isTablet || /(android(?!.*mobi))|Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|(hpw|web)OS|Opera M(obi|ini)/i.test(navigator.userAgent);

  var vidjetSite,
    vidjetCampaigns,
    vidjetCampaignsToKill,
    vidjetCampaignsToShowManual,
    vidjetSiteId,
    analytics,
    vidjetBackendUrl,
    vidjetPlayerUrl,
    vidjet_currentSessionId,
    vidjetEmbededIframes;

  var vidjet_format, vidjet_campaignSelected,
    vidjet_componentsHasBeenDisplayed = false;

  // related to scroll events
  var ticking = false;
  var hasScrollFired = false;
  var vidjet_campaignVideos = [];
  var videoOriginalSize = {};
  var isMultipleBubble = false;
  var isPlayerOpen = false;
  var vidjet_bubbleSize = 120;
  // The extra space we give to the bubble to prevent it from cutting out.
  const BUBBLE_EXTRA = { width: 40, height: 40 };
  let savedScrollPosition = 0;

  var
    vidjet_TriggerType = {
      landing: 0,
      exit: 1,
      scroll: 2,
      delay: 3
    },
    vidjet_DeviceType = {
      mobile: 0,
      desktop: 1
    };

  function _getPageProductId() {
    //This is for client trois kilo sept because they use productIdKey
    if (vidjetSiteId === "81c4adfb-15f0-47db-8b5e-4e5135dfb808")
      return (typeof cdcDatalayer !== 'undefined' && cdcDatalayer?.ecommerce?.items?.length && cdcDatalayer.ecommerce.items[0].item_id) + '_' + (prestashop.page.body_classes['lang-fr'] ? 'fr' : 'en')

    return window?.ShopifyAnalytics?.meta?.page?.resourceType === 'product' && window.ShopifyAnalytics?.meta?.page?.resourceId ||
      window.id_product ||
      (typeof cdcDatalayer !== 'undefined' && cdcDatalayer?.ecommerce?.items?.length && cdcDatalayer.ecommerce.items[0].item_id) ||
      window._idp ||
      window.productObject?.id ||
      document.querySelector('.product_id')?.textContent ||
      document.getElementById('product_page_product_id')?.value ||
      document.querySelector('[data-product_id]')?.getAttribute('data-product_id') ||
      document.querySelector('a[data-product_id]')?.getAttribute('data-product_id') ||
      document.querySelector('meta.wooptpmProductId')?.getAttribute('data-id') ||
      document.querySelector('button[name="add-to-cart"]')?.value;
  }

  function _addProductPageAnalytics() {
    if (window?.vidjetProductData) {
      analytics.brand = window?.vidjetProductData?.brand;
      analytics.category = window?.vidjetProductData?.category;
      return
    }

    // Select all script tags with type "application/ld+json"
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');

    // Loop through each script tag
    scriptTags.forEach(script => {
      try {
        const jsonData = JSON.parse(script.textContent);

        // Check if the JSON contains product-related data
        if ((jsonData["@type"] === "Product" || jsonData["@type"] === "ProductGroup") && jsonData.brand && jsonData.category) {
          analytics.brand = jsonData.brand?.name;
          analytics.category = jsonData.category;
        }
      } catch (error) {
        console.warn("Vidjet - Error parsing JSON-LD for product data:", error);
      }
    });

    //might be usefull for woo data ? at list working for the client graazie
    const productDataElement = document.querySelector('[name="gtm4wp_product_data"]');

    if (productDataElement) {
      // Parse the JSON data from the value attribute
      const productData = JSON.parse(productDataElement.value);

      // Retrieve the brand and category
      analytics.brand = productData.item_brand;
      analytics.category = productData.item_category;
    }

    if (vidjetSiteId === 'f1eb6d75-56cd-4808-83d5-2265e156034c' && !analytics.category?.length) {
      const priority = ["femme", "homme", "enfant"];

      let productDataText = document.getElementById("wck_viewed_product-js-extra")?.textContent?.toLowerCase();

      if (!productDataText?.length) {
        productDataText = document.querySelector('div.product.type-product')?.className;
      }

      const found = productDataText && priority.find(word => productDataText.includes(word));

      if (found) {
        analytics.brand = found;
        analytics.category = found;
      }
    }
  }

  function _setEnvVariables() {
    const scriptTag = document.getElementById('vidjet');
    const scriptSrc = scriptTag ? scriptTag.src : '';

    if (scriptSrc.includes('app-api.vidjet.io') || scriptSrc.includes('/client-app.js')) {
      vidjetBackendUrl = 'https://app-api.vidjet.io';
      vidjetPlayerUrl = 'https://player.vidjet.io';
    } else if (scriptSrc.includes('dev-app-api.vidjet.io') || scriptSrc.includes('/dev-client-app.js')) {
      vidjetBackendUrl = 'https://dev-app-api.vidjet.io';
      vidjetPlayerUrl = 'https://dev-player.vidjet.io';
    } else if (scriptSrc.includes('localhost') || scriptSrc.includes('/local-client-app.js')) {
      vidjetBackendUrl = 'http://localhost:3000';
      vidjetPlayerUrl = 'https://localhost:8080';
    } else {
      //Default to backend if not match
      vidjetBackendUrl = 'https://app-api.vidjet.io';
      vidjetPlayerUrl = 'https://player.vidjet.io';
    }
  }

  function _setAnalytics() {
    // Set Site Id with the scrip url params
    const scriptTag = document.getElementById('vidjet');
    const scriptSrc = scriptTag ? scriptTag.src : '';
    const urlParams = new URL(scriptSrc).searchParams;

    vidjetSiteId = urlParams.get('siteId');

    // Get the backend & play URL based on the script url
    _setEnvVariables();

    // Set Page & Session Analytics
    const sessionId = _getCookie('vidjet-sessionId');
    vidjet_currentSessionId = sessionId ? sessionId : uuidv4();
    _setCookie('vidjet-sessionId', vidjet_currentSessionId, 1);

    analytics = {
      url: location.href,
      sessionId: vidjet_currentSessionId,
      productId: _getPageProductId()
    };

    _addProductPageAnalytics();
  }

  function uuidv4(options, buf, offset) {
    options = options || {};
    var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }

      return buf;
    }

    return stringify(rnds);
  }


  // Integrate website if not integrated yet
  function _integrateManualIfNeeded() {
    if (!_isEmpty(vidjetSite) && !vidjetSite.integration) {
      const siteData = {
        siteId: vidjetSite && vidjetSite._id,
        integrationDate: (new Date()).toISOString(),
        integration: 'manual',
        websiteUrl: window.location.protocol + '//' + window.location.hostname
      };

      _makeRequest('/website/integrate', siteData);
    }
  }

  // Depending on the breakpoints, we decide the iframe size with this variable
  function _iframeSizesBasedOnWindow() {
    return {
      // < 480px
      mobile: {
        square: .8,
        portrait: .65,
        landscape: .95,
      },
      // < 768px
      tablet: {
        square: .6,
        portrait: .3,
        landscape: .7,
      },
      // < 1024px
      desktop: {
        square: .35,
        portrait: .25,
        landscape: .50,
      },
      // < 1680px
      bigDesktop: {
        square: .3,
        portrait: .2,
        landscape: .4,
      },
      // > 1680px
      giantDesktop: {
        square: .25,
        portrait: .20,
        landscape: .30
      }
    }
  }

  function _setCartActions() {
    var intergrationsToGetCart = [
      { integration: 'shopify', cookieName: 'cart' },
      { integration: 'woocommerce', cookieName: 'vidjet_woo_cart_id' },
      { integration: 'wix', cookieName: 'vidjet_wix_cart_id' },
      { integration: 'prestashop' }
    ];

    var cartToGet = intergrationsToGetCart.find(obj => obj.integration === vidjetSite.integration);


    // if it's a integration, check if there is a cart created in the cookies
    if (cartToGet) {
      let cartId =
        cartToGet.integration === 'prestashop' ?
          window.vidjetPreastshopCartId :
          _getCookie(cartToGet.cookieName);

      //For jamehawk (woocommerce) it has a different cookie name
      if (vidjetSiteId === "2581441e-2743-4fd6-9c0e-e9f734fb551f") {
        cartId = _getCookie('woocommerce_cart_hash');
      }

      if (cartToGet?.integration === 'shopify' && cartId?.includes('key')) {
        if (cartId.includes('%3Fkey')) {
          cartId = cartId.split('%3Fkey')[0];
        } else if (cartId.includes('?key')) {
          cartId = cartId.split('?key')[0];
        }
      }

      // save the id in a new cookie so that we send it only once
      if (cartId && cartId !== _getCookie('vidjet_cart_id')) {
        _setCookie('vidjet_cart_id', cartId, 1);
        _sendEvent('cartCreated');
      }
    }
  }

  function _isWarmangoProductCampaign(siteId, campaignId) {
    if (siteId !== '383ece2b-e9a7-4e37-a0a2-5f42d0a1009b') return false

    const noneProductCampaignsIds = [
      "d7dfa072-fb6d-48ea-9b1d-b8bb576435bd",
      "618bf347-b02b-43d4-9ffa-079318639735",
      "a246fc8d-fd05-4f2e-886b-fac3065d89bd"
    ];

    return !noneProductCampaignsIds.includes(campaignId);
  }

  function _removeEmbedWhenLocked() {
    const embedIframes = [
      ...document.querySelectorAll('.vidjet-video-wrapper'),
      ...document.querySelectorAll('.vidjet-carousel-wrapper')
    ];

    for (const embedIframe of embedIframes) {
      embedIframe.remove();
    }
  }

  // private methods
  function _detectScreenSize(videoDimensions) {
    const { mobile, tablet, desktop, bigDesktop, giantDesktop } = _iframeSizesBasedOnWindow();
    const screenWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const videoAspect = _detectVideoRatio(videoDimensions);
    // should return a width and height for each size
    switch (true) {
      case screenWidth <= 480:
        return screenWidth * mobile[videoAspect]
      case screenWidth <= 768:
        return screenWidth * tablet[videoAspect]
      case screenWidth <= 1024:
        return screenWidth * desktop[videoAspect]
      case screenWidth <= 1680:
        return screenWidth * bigDesktop[videoAspect]
      default:
        return screenWidth * giantDesktop[videoAspect]
    }
  }

  // Algorithm to adjust iframe size to video ratio - "Thibault's First Algorithm"
  function _setIframeSize(videoDimensions) {
    let iframeWidth = _detectScreenSize(videoDimensions);
    const isHideBubble = vidjet_format.hideBubble || isMobile;
    const margin = isMultipleBubble ? 0 : 30;
    const bubble = isHideBubble ? 0 : vidjet_bubbleSize ? vidjet_bubbleSize : 120;
    const { width: originalWidth, height: originalHeight } = videoDimensions;
    const divider = originalWidth / iframeWidth;
    const calculatedHeight = originalHeight / divider;
    iframeHeight = calculatedHeight + margin + bubble;
    return {
      iframeWidth,
      iframeHeight
    }
  }

  function _setBubbleSize() {
    vidjet_bubbleSize = vidjet_bubbleSize || 90;
    if (vidjet_format.bubbleShape === 'original') {
      const { width, height } = videoOriginalSize;
      const ratio = width / height;
      const isPortrait = ratio < 1;
      if (isPortrait) {
        //the client time health want the video thumbnail bigger
        if (vidjetSiteId === 'e537e73f-d665-49aa-9030-d7cc9056a08b')
          return { width: vidjet_bubbleSize * 1.4, height: (vidjet_bubbleSize / ratio) * 1.4 }

        return { width: vidjet_bubbleSize, height: vidjet_bubbleSize / ratio }
      } else {
        return { width: vidjet_bubbleSize * ratio, height: vidjet_bubbleSize }
      }
    } else {
      return { width: vidjet_bubbleSize, height: vidjet_bubbleSize }
    }
  }


  function _limitOffset(offset) {
    const { height, width } = videoOriginalSize;
    const defaultMargin = 10;
    if (offset.moveX === 0 && offset.moveY === 0) {
      return {
        offsetX: 0,
        offsetY: 0
      }
    }
    const { iframeWidth, iframeHeight } = isPlayerOpen ? _setIframeSize({ width, height }) : _setBubbleSize();
    const screenHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - (defaultMargin * 2);
    const screenWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) - (defaultMargin * 2);
    let { moveX: offsetX, moveY: offsetY } = offset;
    const cumulatedHeight = offsetY + iframeHeight;
    const cumulatedWidth = offsetX + iframeWidth;
    if (cumulatedHeight > screenHeight) {
      offsetY -= cumulatedHeight - screenHeight;
    }
    if (cumulatedWidth > screenWidth) {
      offsetX -= cumulatedWidth - screenWidth;
    }
    return {
      offsetX,
      offsetY
    }
  }

  function _addStickyBar(iframeParams, siteId, campaignId, offset, isOpenByDefault, bubbleSize) {
    const stickyBar = document.createElement("div");
    const { backgroundColor, textColor, text } = vidjet_format.stickyBarOptions;
    const { moveY } = offset;

    stickyBar.classList.add('vidjet-stickyBar');
    stickyBar.id = 'vidjet-stickybar';
    stickyBar.style['background-color'] = backgroundColor;

    moveY ? stickyBar.style.bottom = `${moveY || 0 + 20}px` : '';

    stickyBar.innerHTML = `
      <div style="height: 100%;display: flex;">
        <div id="vidjet-stickybar-open-video" style="align-items: center; display: flex;">
          <img height="16" width="16" src="https://vidjetvideostorage.s3.eu-west-1.amazonaws.com/Play+Icon+2.0+SVG.svg" style="margin-left: 6px;">
          <span style="font-size: 14px;font-weight: 600;color: ${textColor};margin-left: 9px;line-height: 14px;margin-right: 4px;font-family: "Gothic A1", sans-serif;>${text}</span>
        </div>
        <div id="vidjet-stickybar-close" style="align-items: center; display: flex;">
          <img height="18" width="18" src="https://vidjetvideostorage.s3.eu-west-1.amazonaws.com/Close+icon+Sticky+Play+Button.svg" style="margin-left: 8px;margin-right: 7px;">
        </div>
      </div>
    `;

    document.body.appendChild(stickyBar);

    //add Click event to show video or close sticky bar
    document.getElementById("vidjet-stickybar-open-video").addEventListener('click', function () {
      //When showing the popup, hide the sticky bar
      stickyBar.classList.add('vidjet-hidden');

      _addIframe(iframeParams, siteId, campaignId, offset, isOpenByDefault);
    });

    document.getElementById("vidjet-stickybar-close").addEventListener('click', function () {
      stickyBar.classList.add('vidjet-hidden');
    });
  }

  function _addElement(iframeParams, siteId, campaignId, offset, isOpenByDefault, bubbleSize) {
    // If it's a sticky bar, we first want to display it. The iframe will be shown when it's clicked
    if (vidjet_format.isStickyBar) {
      _sendEvent('display');
      return _addStickyBar(iframeParams, siteId, campaignId, offset, isOpenByDefault)
    }

    _addIframe(iframeParams, siteId, campaignId, offset, isOpenByDefault);
  }

  function _addIframe(iframeParams, siteId, campaignId, offset, isOpenByDefault, bubbleSize) {
    const { campaignType } = iframeParams || {};
    // Some campaigns will need to be moved around because of other elements
    const { offsetX: moveX, offsetY: moveY } = _limitOffset(offset);

    if (document.querySelectorAll('.vidjet-iframe').length) {
      return;
    } else {
      let iframe = document.createElement("iframe");
      var PLAYER_APP_URL = `${vidjetPlayerUrl}/${siteId}/${campaignId}`;
      var urlWithParams = new URL(PLAYER_APP_URL);
      const isPopup = campaignType === 'popup';
      urlWithParams.searchParams.set('sessionId', vidjet_currentSessionId);
      urlWithParams.searchParams.set('device', isMobile ? 'mobile' : 'desktop');
      urlWithParams.searchParams.set('url', analytics.url);
      urlWithParams.searchParams.set('isDynamicFormat', _isDynamicFormat(vidjet_format));

      analytics.productId && urlWithParams.searchParams.set('productId', analytics.productId);

      iframe.classList.add('vidjet-iframe');
      iframe.title = 'Vidjet video player';
      iframe.allow = 'clipboard-read; clipboard-write; fullscreen';
      iframe.style.border = 'none';
      iframe.style.position = 'fixed';
      const defaultMargin = 10;
      iframe.style.bottom = isPopup ? 0 : (!moveY ? `${defaultMargin}px` : `${moveY}px`);
      iframe.style.display = 'block';
      // if the video isMultipleBubble we add border radius
      isMultipleBubble ? iframe.style.borderRadius = '10px' : '';
      if (campaignType === 'right' && !isPopup) {
        iframe.style.right = moveX ? `${moveX}px` : `${defaultMargin}px`;
      } else if (campaignType === 'left' && !isPopup) {
        iframe.style.left = moveX ? `${moveX}px` : `${defaultMargin}px`;
      } else if (isPopup) {
        iframe.classList.add('vidjet-popup');
      } else {
        // Default
        iframe.style.left = moveX ? `${moveX}px` : 0;
      }
      iframe.style.zIndex = '4815162342';

      //For bubmats clients, reduce z-index so their cart slider goes over the video
      if (siteId === "3b552290-2fcf-4b40-84bb-eb6c0118d821") {
        iframe.style.zIndex = '2147483646';
      } else if (siteId === "4eb27fa9-2ff9-4c62-8a74-184ded24bb80") {
        iframe.style.zIndex = '29';
      }

      iframe.src = urlWithParams.toString();
      if (!isPopup) {
        if (isOpenByDefault && !vidjet_format.isFullScreen) {
          const { iframeWidth, iframeHeight } = _setIframeSize(videoOriginalSize);
          iframe.style.width = `${iframeWidth}px`;
          iframe.style.height = `${iframeHeight}px`;
        } else {
          const { width, height } = _setBubbleSize();
          iframe.style.width = `${width + BUBBLE_EXTRA.width}px`;
          iframe.style.height = `${height + BUBBLE_EXTRA.height}px`;
        }
      }

      //If the website is Warmango.fr, they want the bubble positioned on the product gallery image.
      if (_isWarmangoProductCampaign(siteId, campaignId)) {
        iframe.style.position = 'absolute';

        document.getElementsByClassName('media-viewer__image-link')[0].style.position = 'relative';
        document.getElementsByClassName('media-viewer__image-link')[0].appendChild(iframe);

        return
      }

      // Starts hidden, and we show it according to triggers
      document.body.appendChild(iframe);

      const message = {
        action: 'widgetToDisplay',
        data: { campaign: vidjet_campaignSelected, site: vidjetSite }
      };

      // Wait for iframe to load
      iframe.onload = function () {
        iframe.contentWindow.postMessage(message, '*');
      };
    }
  }

  //Keep track of the video view restriction. If the limit is reached, we won't display the campaign no more.
  function _handleViewRestrictionCount() {
    const viewCookie = _getCookie(`vidjet_view_${vidjet_campaignSelected._id}`);
    const cookieNewValue = viewCookie ? parseInt(viewCookie) + 1 : 1;

    _setCookie(`vidjet_view_${vidjet_campaignSelected._id}`, cookieNewValue, vidjet_campaignSelected.segmentation.viewRestriction.notShownTime + 1);

    //If the new cookie value is equal to the max view we need to stop displaying the video
    if (cookieNewValue >= vidjet_campaignSelected.segmentation.viewRestriction.maxView) {
      _setCookie(
        `vidjet_timing_${vidjet_campaignSelected._id}`,
        new Date(new Date().getTime() + (vidjet_campaignSelected.segmentation.viewRestriction.notShownTime * 1000 * 3600)).toISOString(),
        vidjet_campaignSelected.segmentation.viewRestriction.notShownTime + 1
      );
      _deleteCookie(`vidjet_view_${vidjet_campaignSelected._id}`);
    }
  }

  function _shopifyAddToCart(product) {
    let cartData = {
      items: [{
        id: product.variantId,
        qty: product.qty || 1
      }]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cartData)
    });
  }

  function _prestashopAddToCart(product) {
    const token = window.prestashop && prestashop.static_token;
    const actionURL = (window.prestashop && prestashop.urls?.pages?.cart) || location.origin;
    var query = 'controller=cart&add=1&action=update&ajax=true&qty=' + (product.qty || 1) + '&token=' + token + '&id_product=' + product.productId + '&ipa=' + product.variantId;

    $.post(actionURL, query, null, 'json').then((resp) => {
      window.prestashop && prestashop.emit('updateCart', {
        reason: {}, resp: resp
      });

      //If it's a buy now, we directly want to redirect user to the checkout after the click
      if (product.isBuyNow) {
        window.location.href = (window.prestashop && prestashop.urls?.pages?.order) || location.origin + '/order';
      }
    }).fail((resp) => {
      window.prestashop && prestashop.emit('handleError', { eventType: 'addProductToCart', resp: resp });
    });
  }

  function _handleAddToCartEvent(product) {
    switch (vidjetSite.integration) {
      case 'shopify':
        _shopifyAddToCart(product);
        break;

      case 'woocommerce':
        window.vidjetAddToCart(product, product.isBuyNow);
        //window.vidjetAddToCart.length checks if the isBuyNow params is available in the new plugin based on the version. 
        //1 param is the the old version and two is with the isBuyNow
        if (window.vidjetAddToCart.length === 1 && product.isBuyNow) window.location.href = window.vidjetcheckoutUrl;
        break;

      case 'prestashop':
        _prestashopAddToCart(product);
        break;
    }

    //If the client is crazy compression. after an ATC, we want to close the FS and display their carte drawer
    if (vidjetSiteId === "9b37caa1-347d-4e4f-8478-1c4126fb9f7e") {
      // Send event to let iframe know that we are closing the fullscreen
      const iframes = [document.querySelector('.vidjet-iframe'), ...document.querySelectorAll('.vidjet-embed-iframe')];
      const message = {
        action: 'scriptCloseEvent',
      };
      // remove null values
      const filteredArray = iframes.filter(iframe => iframe);

      if (filteredArray.length > 0) {
        filteredArray.forEach(iframe => {
          iframe.contentWindow.postMessage(message, '*');
        });
      }

      // Dispatch the 'cart:refresh' event to trigger the refresh functionality
      document.dispatchEvent(new CustomEvent('cart:refresh'));

      // Optionally show the cart drawer if not already visible
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && !cartDrawer.hasAttribute('open')) {
        cartDrawer.show();
      }

      // Force another one in case Dispatch the 'cart:refresh' event to trigger the refresh functionality
      document.dispatchEvent(new CustomEvent('cart:refresh'));
    } else if (vidjetSiteId === 'aec674f0-a547-4a5e-a39e-f86e0b2ac770') {
      // Send event to let iframe know that we are closing the fullscreen
      const iframes = [document.querySelector('.vidjet-iframe'), ...document.querySelectorAll('.vidjet-embed-iframe')];
      const message = {
        action: 'scriptCloseEvent',
      };
      // remove null values
      const filteredArray = iframes.filter(iframe => iframe);

      if (filteredArray.length > 0) {
        filteredArray.forEach(iframe => {
          iframe.contentWindow.postMessage(message, '*');
        });
      }

      // Dispatch the 'cart:refresh' event to trigger the refresh functionality
      document.dispatchEvent(new CustomEvent('cart:refresh'));

      const cartDrawer = document.querySelector('cart-drawer');

      if (!cartDrawer.classList.contains('active')) {
        cartDrawer.classList.add('active');
      }

      // Dispatch the 'cart:refresh' event to trigger the refresh functionality
      document.dispatchEvent(new CustomEvent('cart:refresh'));
    } else if (vidjetSiteId === 'de5b64fe-d44b-45f9-8efd-2bbd2c36784a') { //For the client what matters
      // Send event to let iframe know that we are closing the fullscreen
      const iframes = [document.querySelector('.vidjet-iframe'), ...document.querySelectorAll('.vidjet-embed-iframe')];
      const message = {
        action: 'scriptCloseEvent',
      };
      // remove null values
      const filteredArray = iframes.filter(iframe => iframe);

      if (filteredArray.length > 0) {
        filteredArray.forEach(iframe => {
          iframe.contentWindow.postMessage(message, '*');
        });
      }

      setTimeout(() => {
        fetch(window.routes.cart_url)
          .then(response => response.text())
          .then(html => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, "text/html");

            let newCartDrawer = doc.querySelector("cart-drawer");
            document.querySelector("cart-drawer").refreshSections(newCartDrawer.innerHTML, true);

            let newCartCounter = doc.querySelector("cart-counter");
            document.querySelector("cart-counter").refresh(newCartCounter.innerHTML, true);
          });
      }, 500);
    }
  }

  async function getShopifyCart() {
    const result = await fetch("/cart.json");

    if (result.status === 200) {
      return result.json();
    }

    console.log(`Failed to get request, Shopify returned ${result.status} ${result.statusText}`);
  }

  async function _getCartItems() {
    switch (vidjetSite.integration) {
      case 'shopify':
        const cart = await getShopifyCart();
        return cart.items.map(item => {
          return {
            productId: item.id,
            variantId: item.variant_id,
            quantity: item.quantity
          }
        })
    }
  }

  async function _sendCartItems() {
    // select all iframes
    const iframes = [document.querySelector('.vidjet-iframe'), ...document.querySelectorAll('.vidjet-embed-iframe')];
    const message = {
      action: 'sendCartItems',
      data: await _getCartItems()
    };
    // remove null values
    const filteredArray = iframes.filter(iframe => iframe);

    if (filteredArray.length > 0) {
      filteredArray.forEach(iframe => {
        iframe.contentWindow.postMessage(message, '*');
      });
    }
  }

  async function _getWidgets() {
    // Retrieve all unique data-vidjet-campaign-id values from iframes with the specified class
    const embededCampaignIds = [...new Set(
      Array.from(document.querySelectorAll('iframe.vidjet-embed-iframe')).map(iframe => {
        const campaignId = iframe.getAttribute('data-vidjet-campaign-id');

        if (campaignId) {
          return campaignId;
        }

        const src = iframe.getAttribute('src');
        const match = src.match(/player\.vidjet\.io(?:\/embed)?\/[^\/]+\/([^\/]+)/);

        return match ? match[1] : null;
      }).filter(Boolean)
    )];

    const params = new URLSearchParams({
      ...analytics,
      siteId: vidjetSiteId,
      isMobile,
      sessionId: vidjet_currentSessionId,
      embededCampaignIds
    });

    try {
      const response = await fetch(`${vidjetBackendUrl}/widgets?${params.toString()}`, {
        method: 'GET',
      });

      const data = await response.json();
      vidjetCampaigns = data.campaignsReturned || [];
      vidjetCampaignsToKill = data.campaignsToKill || [];
      vidjetCampaignsToShowManual = data.campaignsToShowManual || [];
      vidjetSite = data.site;
    } catch (error) {
      console.error('Error fetching widget data:', error);
    }
  }

  // can be refactored for each event
  function _reactToPlayerEvent(event) {
    const { origin, properties } = event && event.data;

    const iframes = document.querySelectorAll('.vidjet-iframe, .vidjet-embed-iframe');

    // Find the specific iframe that triggered the event using event.source
    const triggeringIframe = Array.from(iframes).find((iframe) => {
      return iframe.contentWindow === event.source;
    });

    if (!triggeringIframe) {
      return;
    }

    const iframe = document.querySelector('.vidjet-iframe') || document.querySelector('.vidjet-embed-iframe');

    if (!iframe) {
      return
    }

    if (origin === 'closeMainPlayer') {
      if (properties && properties.currentVideoId && vidjet_format.bubbleShape === 'original') {
        const currentVideo = vidjet_campaignVideos.find(video => video._id === properties.currentVideoId);
        videoOriginalSize = { height: currentVideo.height, width: currentVideo.width };
      }
      isPlayerOpen = false;
      // Timeout to see the elements fade out
      setTimeout(() => {
        // for fullscreen we need to set the bubble size but if multiple videos set iframe size to correct size
        const { width, height } = _setBubbleSize();
        iframe.style.width = `${width + BUBBLE_EXTRA.width}px`;
        iframe.style.height = `${height + BUBBLE_EXTRA.height}px`;
      }, 500);
      if (vidjet_format.isFullScreen) {
        // remove the fullscreen class
        document.querySelectorAll('.vidjet-body').forEach((body) => body.classList.remove('vidjet-body'));
        iframe.classList.remove('vidjet-fullscreen');
        // restore scroll position
        window.scrollTo(0, savedScrollPosition);
        const defaultMargin = 10;
        iframe.style.bottom = vidjet_format.moveY ? `${vidjet_format.moveY + defaultMargin}px` : `${defaultMargin}px`;
        iframe.style.display = 'block';
        // position 1 is right and 0 left
        if (vidjet_format.position === 1) {
          iframe.style.left = "unset";
          iframe.style.right = vidjet_format.moveX ? `${vidjet_format.moveX + defaultMargin}px` : `${defaultMargin}px`;
        } else if (vidjet_format.position === 0) {
          iframe.style.right = "unset";
          iframe.style.left = vidjet_format.moveX ? `${vidjet_format.moveX + defaultMargin}px` : `${defaultMargin}px`;
        }
      }
    } else if (origin === 'openMainPlayer') {
      isPlayerOpen = true;
      isMultipleBubble && (videoOriginalSize = { width: 1080, height: 1920 });
      if (vidjet_format.isFullScreen) {
        iframe.style.height = "100%";
        iframe.style.width = "100%";
        // in fullscreen we need to always display the player with no move X or Y
        iframe.style.bottom = "0px";
        iframe.style.right = "0px";
        iframe.style.left = "0px";
        iframe.classList.add('vidjet-fullscreen');
        _injectCssFullScreen();
      } else {
        //If the website is Warmango.fr, they want the bubble positioned on the product gallery image and the iframe size should be set based on the image size.
        if (_isWarmangoProductCampaign(vidjetSite._id, vidjet_campaignSelected._id)) {
          iframe.style.width = 'auto';
          iframe.style.height = '100%';
          return
        }

        // different size depending on portrait/landscape/square format
        const { iframeWidth, iframeHeight } = _setIframeSize(videoOriginalSize);
        iframe.style.width = `${iframeWidth}px`;
        iframe.style.height = `${iframeHeight}px`;
      }
    } else if (origin === 'destroyIframe') {
      // to see the fade-out animation
      setTimeout(() => {
        _destroyIframe();
        //If the format is sticky bar, show it back
        if (vidjet_format?.isStickyBar) { document.getElementById("vidjet-stickybar") && document.getElementById("vidjet-stickybar").classList.remove('vidjet-hidden'); }
      }, 500);
    } else if (origin === 'getCartItems') {
      _sendCartItems();
    } else if (origin === 'addToCart') {
      _handleAddToCartEvent(properties);
    } else if (origin === 'killIframe') {
      const iframe = document.querySelector(`iframe[data-vidjet-campaign-id="${properties.campaignId}"]`);

      iframe?.parentElement?.remove();
    } else if (origin === 'getAnalytics') {
      //Send the necessary analytics to the iframe
      const message = {
        action: 'getAnalytics',
        data: analytics
      };

      iframe.contentWindow.postMessage(message, '*');
    } else if (origin === 'openFullScreen') {
      // TODO find why the message is being sent twice
      _openCarouselFullScreen(triggeringIframe);
      _injectCssFullScreen();
    } else if (origin === 'closeFullScreen') {
      _closeCarouselFullScreen();
    } else if (origin === 'carouselHeight') {
      const targetedIframes = _targetCarousels(properties.campaignId);

      targetedIframes.forEach((targetedIframe) => {
        targetedIframe.parentElement.style.height = `calc(${properties.carouselHeight}px + 32px)`;
        targetedIframe.parentElement.style.paddingBottom = '0';
      });
    } else if (origin === 'youtubeThumbnailClicked') {
      document.querySelector('#videos')?.scrollIntoView({ behavior: 'smooth' });
    } else if (origin === 'newBulkLoaded') {
      const campToShow = vidjetCampaigns?.length && vidjetCampaigns.find(camp => camp._id === properties.campaignId);
      const campToKill = vidjetCampaignsToKill?.length && vidjetCampaignsToKill.find(camp => camp._id === properties.campaignId);

      if (campToKill) {
        const iframe = document.querySelector(`iframe[data-vidjet-campaign-id="${properties.campaignId}"]`);

        return iframe?.parentElement?.remove()
      }

      if (!campToShow) return

      const message = {
        action: 'widgetToDisplay',
        data: { campaign: campToShow, site: vidjetSite }
      };

      //This is only for avenur privee + trois kilo sept right now but it should be applied to all the clients
      const targetedIframes = _targetCarousels(properties.campaignId);

      targetedIframes.forEach((targetedIframe) => {
        function updateIframeStyle(iframe) {
          if (!iframe.parentElement.style.height || iframe.parentElement.style.height === '0px') {
            iframe.parentElement.style.height = '125px';
          }

          if (iframe.parentElement.style.display === 'none') {
            iframe.parentElement.style.display = '';
          }
        }

        targetedIframe?.contentWindow?.postMessage(message, '*');
        updateIframeStyle(targetedIframe);
        targetedIframe.addEventListener('load', () => {
          targetedIframe?.contentWindow?.postMessage(message, '*');
          updateIframeStyle(targetedIframe);
        });
      });

    }
  }

  function _openCarouselFullScreen(targetedIframe) {
    const styles = `.vidjet-fullscreen { 
                      position: fixed !important; 
                      height: 100% !important;
                      width: 100% !important;
                      z-index: 2147483647; 
                      top: 0; 
                      right: 0; 
                      bottom: 0px; 
                      left: 0px; 
                      max-height: none !important; 
                      margin: 0 !important
                    } `;

    const vidjetStyleSheet = document.createElement("style");
    vidjetStyleSheet.innerText = styles;
    document.head.appendChild(vidjetStyleSheet);

    window.scrollY && (savedScrollPosition = window.scrollY);

    // check if the parent element already has the fullscreen class
    if (targetedIframe && !Array.from(targetedIframe.classList).includes('vidjet-fullscreen')) {
      targetedIframe.parentElement.classList.add('vidjet-fullscreen');
    }

    //if client has issue expending to real fullscreen set vidjet-fullscreen class to the element
    // Wow concept
    if (vidjetSiteId === '734b0b8d-b483-407a-8d92-4aeab5a0fa73') {
      document.querySelector('.product__info-wrapper.grid__item.scroll-trigger.animate--slide-in')?.classList.add('vidjet-fullscreen');
    } else if (vidjetSiteId === '6c5262c4-16e4-4f4e-9fb8-9ce7e2a35ebb') { //eclo beauty custom code for cart drawer display issue
      document.getElementById('corner-cowi-open-primary-card')?.setAttribute('style', 'opacity: 0 !important;');
    } else if (vidjetSiteId === '85e681e0-fa68-47ea-8c25-87c381917dd3') { // zapatoferoz because sticky add to cart on FS
      document.querySelector('.m-main-product--wrapper')?.classList.add('vidjet-fullscreen');
    } else if (vidjetSiteId === '2ddbc5bf-6ca3-4416-bebc-5344ed1bc5d3') { //Brothers & sisters
      document.querySelector('.ymq-cart-app-slid-overlay').style.setProperty('display', 'none', 'important');
      document.getElementById('ymq-cart-app').style.setProperty('display', 'none', 'important');
    } else if (vidjetSiteId === '5e777d31-4d59-4f34-bfe6-5c6b79d39079') { //sugarlashpro
      document.querySelector('.product__media').style.setProperty('display', 'none', 'important');
      document.querySelector('.media-and-text').style.setProperty('display', 'none', 'important');
    } else if (vidjetSiteId === '9c711719-c902-445b-9ec1-8af6f88c0231') { //Maju
      document.querySelector('.sticky-buy-button')?.style?.setProperty('display', 'none', 'important');
    } else if (vidjetSiteId === '1cad9345-776f-4402-8cf3-c602c6c9c4d8' || vidjetSiteId === '2c3703cc-396d-46a4-ad9e-0d0fbd7188a0') { //Smart little toys
      document.querySelector('.product__info-wrapper')?.style?.setProperty('display', 'contents', 'important');
    }

    // hide elements that have the class vidjet-iframe
    const iframes = document.querySelectorAll('.vidjet-iframe');
    iframes.forEach((iframe) => {
      iframe.style.display = 'none';
    });
  }

  function _targetCarousels(campaignId) {
    // in case there are several carousel embed
    let iframes = document.querySelectorAll('.vidjet-embed-iframe');
    iframes = Array.prototype.slice.call(iframes);

    let targetedIframes = [];

    // if there is only one carousel embed, we target it
    if (iframes.length === 1) {
      return iframes
    }

    targetedIframes = iframes.filter((iframe) => {
      // with new code copied from vidjet
      if (iframe?.dataset?.vidjetCampaignId) {
        return iframe.dataset.vidjetCampaignId === campaignId
        // elementor adds the link in the data-src attribute and replaces the src attribute
      } else if (iframe?.dataset?.src?.includes('vidjet.io')) {
        return iframe.dataset.src.includes(campaignId)
      } else {
        return iframe?.attributes?.src?.value?.includes(campaignId)
      }
    });

    return targetedIframes
  }

  function _closeCarouselFullScreen() {
    // remove the class vidjet-body and vidjet-fullscreen from all the elements in the document
    document.querySelectorAll('.vidjet-body').forEach((body) => body.classList.remove('vidjet-body'));
    document.querySelectorAll('.vidjet-fullscreen').forEach((fullscreen) => fullscreen.classList.remove('vidjet-fullscreen'));

    // reposition to original iframe code
    window.scrollTo(0, savedScrollPosition);

    if (vidjetSiteId === '6c5262c4-16e4-4f4e-9fb8-9ce7e2a35ebb') { //eclo beauty custom code for cart drawer display issue
      document.getElementById('corner-cowi-open-primary-card').style.removeProperty('opacity');
    } else if (vidjetSiteId === '2ddbc5bf-6ca3-4416-bebc-5344ed1bc5d3') { //Brothers & sisters
      document.querySelector('.ymq-cart-app-slid-overlay').style.removeProperty('display');
      document.getElementById('ymq-cart-app').style.removeProperty('display');
    } else if (vidjetSiteId === '5e777d31-4d59-4f34-bfe6-5c6b79d39079') { //sugarlashpro
      document.querySelector('.product__media').style.removeProperty('display');
      document.querySelector('.media-and-text').style.removeProperty('display');
    } else if (vidjetSiteId === '9c711719-c902-445b-9ec1-8af6f88c0231') { //Maju
      document.querySelector('.sticky-buy-button')?.style?.removeProperty('display');
    } else if (vidjetSiteId === '1cad9345-776f-4402-8cf3-c602c6c9c4d8' || vidjetSiteId === '2c3703cc-396d-46a4-ad9e-0d0fbd7188a0') { //Smart little toys
      document.querySelector('.product__info-wrapper')?.style?.removeProperty('display');
    }

    // show elements that have the class vidjet-iframe
    const iframes = document.querySelectorAll('.vidjet-iframe');
    iframes.forEach((iframe) => {
      iframe.style.display = 'block';
    });
  }

  function _injectCssFullScreen() {
    const headStyleSheets = Array.from(document.head.querySelectorAll('style'));
    if (typeof headStyleSheets.find((styleSheet) => styleSheet.id === 'vidjet-body') !== 'object') {
      // safer to add it through css
      // ensure our fullscreen is scrollable
      // we add z-index 0 to all elements to avoid them to be on top of the fullscreen, see z-index context stacking
      const styles = `.vidjet-body {
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    overflow: hidden;
                                    height: 100vh;
                                    width: 100vw;
                                    background-color: white;
                                    color: white;
                                    }
                                    .vidjet-body *:not(.vidjet-fullscreen) {z-index: unset !important;} `;
      const vidjetStyleSheet = document.createElement("style");
      vidjetStyleSheet.setAttribute('id', 'vidjet-body-style');
      vidjetStyleSheet.innerText = styles;
      document.head.appendChild(vidjetStyleSheet);
    }
    document.querySelector('body').classList.add('vidjet-body');
    document.querySelector('html').classList.add('vidjet-body');
    // scroll to top to show url bar
    window.scrollTo(0, 1);
  }


  // Because data in the DB is encoded into 0 and 1
  // And it was confusing to read :)
  function _decryptParams(formatObject) {
    // Popup 0, Bubble 1
    let paramObject = {};
    if (formatObject?.formatType === 0) {
      paramObject.campaignType = 'popup';
    } else if (formatObject?.formatType === 1) {
      if (formatObject?.position === 0) {
        paramObject.campaignType = 'left';
      }
      if (formatObject?.position === 1) {
        paramObject.campaignType = 'right';
      }
    }
    if (formatObject?.isFullScreen) {
      paramObject.isFullScreen = 'fullscreen';
    }
    return paramObject;
  }

  function _setCookie(name, value, hours) {
    var expires = "";
    if (hours) {
      var date = new Date();
      date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function _getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function _onScroll(campaign, variablesFromUp) {
    let h = document.documentElement,
      b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight',
      progress = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;

    const { siteId, _id, moveX, moveY, isPlayerOpen, bubbleSize } = variablesFromUp;


    // we keep track of if the scroll event has fired to run it only once
    if (progress >= campaign.segmentation.trigger.option && !hasScrollFired) {
      _addElement(_decryptParams(vidjet_format), siteId, _id, { moveX, moveY }, isPlayerOpen);
      hasScrollFired = true;
    }
  }


  function _displayIframeBasedOnTrigger(campaign) {

    // In case this event is triggered more than once, make the check if already done
    if (vidjet_componentsHasBeenDisplayed) {
      return
    }

    vidjet_campaignVideos = campaign.videos;
    vidjet_componentsHasBeenDisplayed = true;
    const { landing, exit, scroll, delay } = vidjet_TriggerType;
    vidjet_campaignSelected = Object.assign({}, campaign);
    const { siteId, _id } = campaign;
    // to be changed if multiple not on fullscreen
    if (vidjet_format.formatType === 1) {
      if (!vidjet_format.isFullScreen && campaign.videos.length > 1) {
        isMultipleBubble = true;
        videoOriginalSize = { width: 1080, height: 1920 };
      } else {
        videoOriginalSize = { width: campaign.videos[0].width, height: campaign.videos[0].height };
      }
      isPlayerOpen = vidjet_format.openByDefault && !vidjet_format.isFullScreen;
    }
    const { moveX, moveY, bubbleSize } = vidjet_format || {};
    // We put these needed vars in an object to pass them down to another function
    const variablesToPassDown = { siteId, _id, videoOriginalSize, moveX, moveY, isPlayerOpen, bubbleSize };
    vidjet_bubbleSize = bubbleSize;

    // Make sure that we haven't reached the view restriction
    if (!campaign.isBulk) _handleViewRestrictionCount();

    if (!campaign?.segmentation?.trigger?.type || campaign.segmentation.trigger.type === landing) {
      _addElement(_decryptParams(vidjet_format), siteId, _id, { moveX, moveY }, isPlayerOpen);
    } else if (campaign.segmentation.trigger.type === exit) {
      document.addEventListener('mouseout', (e) => { _onExitIntent(e, variablesToPassDown); });
      if (isMobile) {
        document.addEventListener('scroll', (e) => { _onExitIntent(e, variablesToPassDown); });
      }
    } else if (campaign.segmentation.trigger.type === scroll) {
      window.addEventListener('scroll', function (e) {
        if (!ticking) {
          // We use requestAnimationFrame to reduce memory usage
          // https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#scroll_event_throttling
          window.requestAnimationFrame(function () {
            _onScroll(campaign, variablesToPassDown);
            ticking = false;
          });

          ticking = true;
        }
      }, true);
    } else if (campaign.segmentation.trigger.type === delay) {
      setTimeout(() => {
        _addElement(_decryptParams(vidjet_format), siteId, _id, { moveX, moveY }, isPlayerOpen);
      }, (campaign.segmentation.trigger.option || 10) * 1000);
    }
  }

  let lastPoint = 0;
  const _onExitIntent = (event, variablesFromTop) => {
    const { siteId, _id, moveX, moveY, isPlayerOpen, bubbleSize } = variablesFromTop;
    if (
      event.clientY < 50 &&
      event.relatedTarget == null &&
      event.target.nodeName.toLowerCase() !== 'select') {
      // Remove this event listener
      document.removeEventListener('mouseout', (e) => { console.log(e, 'removed'); });
      _addElement(_decryptParams(vidjet_format), siteId, _id, { moveX, moveY }, isPlayerOpen);
    } else if (event.type == "scroll") {
      let currentPoint = window.pageYOffset || document.documentElement.scrollTop;
      let offset = 50;
      if (currentPoint + offset < lastPoint) {
        document.removeEventListener('scroll', (e) => { console.log(e, 'removed'); });
        _addElement(_decryptParams(vidjet_format), siteId, _id, { moveX, moveY }, isPlayerOpen);
      }
      lastPoint = currentPoint <= 0 ? 0 : currentPoint;
    }
  };


  function _addCss() {
    let vidjetCss = document.querySelector('style[data-vidjet]');
    if (vidjetCss) {
      return vidjetCss.remove();
    } else {
      const style = `<style data-vidjet>
        .vidjet-hidden {display:none !important;}
        .vidjet-popup {width: 100vw !important; height: 100vh !important;}
        .vidjet-stickyBar {
          width: 31px;
          z-index: 87423664732678;
          position: fixed;
          bottom: 20px;
          left: 0;
          height: 34px;
          background-color: #7660FF;
          border-radius: 0px 100px 100px 0px;
          overflow: hidden;
          cursor: pointer;
        }
        .vidjet-stickyBar:hover{
          width: auto;
          height: 38px;
        }
      </style>`;
      return document.head.insertAdjacentHTML("beforeend", style)
    }
    //<div class="vidjet-stickyBar"><span style="/* margin: 10px 10px 5px 2px; *//* vertical-align: middle; */"><img height="15" width="15" src="https://vidjetvideostorage.s3.eu-west-1.amazonaws.com/Big+Play+Icon.png" style="/* vertical-align: middle; */overflow: hidden;"> Watch video  <img height="15" width="15" src="https://vidjetvideostorage.s3.eu-west-1.amazonaws.com/styckybar-close-icon.png" style="/* vertical-align: middle; */overflow: hidden;"></span></div>
  }
  //<div class="vidjet-stickyBar" style="/* display: inline; *//* margin: auto; *//* vertical-align: middle; */"><span style="/* margin: 10px 10px 5px 2px; *//* vertical-align: middle; *//* margin-left: 5px; *//* display: inline; *//* width: 100%; */height: 100%;display: flex;/* justify-content: space-around; *//* margin: 5px; */align-items: center;/* justify-content: center; */"><img height="16" width="16" src="https://vidjetvideostorage.s3.eu-west-1.amazonaws.com/Play+Icon+2.0+SVG.svg" style="/* vertical-align: middle; *//* overflow: hidden; */margin-left: 6px;"><span style="font-size: 14px;font-weight: 600;color: white;margin-left: 9px;line-height: 14px;margin-right: 4px;/* text-align: center; */font: roboto;font-family: &quot;Gothic A1&quot;, sans-serif;">Watch video</span> <img height="18" width="18" src="https://vidjetvideostorage.s3.eu-west-1.amazonaws.com/Close+icon+Sticky+Play+Button.svg" style="/* vertical-align: middle; *//* overflow: hidden; *//* right: 0; */margin-left: 8px;margin-right: 7px;/* margin-top: 5px; */"></span></div>

  function _deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
  }

  function _destroyIframe() {
    if (document.querySelector('.vidjet-iframe')) {
      const iframeElement = document.querySelector('.vidjet-iframe');
      return iframeElement.remove()
    }
  }

  function _makeRequest(route, data) {
    var xhr = new XMLHttpRequest(),
      requestUrl = vidjetBackendUrl + route;

    xhr.open('POST', requestUrl, true);
    //xhr.timeout = 200; // Set to the lowest possible timeout because we do not care about data from BE
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  function _sendAnalyticsToIframes() {
    // select all iframes
    const iframes = [...document.querySelectorAll('.vidjet-embed-iframe')];

    const message = {
      action: 'getAnalytics',
      data: analytics
    };

    // remove null values
    vidjetEmbededIframes = iframes.filter(iframe => iframe);

    if (vidjetEmbededIframes.length > 0) {
      vidjetEmbededIframes.forEach(iframe => {
        iframe.contentWindow.postMessage(message, '*');
      });
    }
  }

  function _setListenerForPlayerEvent() {
    window.addEventListener('message', (event) => {
      if (event.data.messageOrigin !== 'vidjet') {
        return
      }
      _reactToPlayerEvent(event);
    }, false);
  }

  function _isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
  }


  //Set up tracking event like sessionId, cartId if present and send page View

  function _sendEvent(eventType, eventParams) {
    // send session Id & device type to player
    const eventData = {
      siteId: vidjetSiteId,
      campaignId: vidjet_campaignSelected && vidjet_campaignSelected._id,
      sessionId: vidjet_currentSessionId || _getCookie('vidjet-sessionId'),
      type: eventType,
      date: (new Date()).toISOString(),
      device: isMobile ? 'mobile' : 'desktop',
      params: eventParams
    };

    //send cart id on cartCreated event
    if (eventType === 'cartCreated') {
      const cartId = _getCookie('vidjet_cart_id');
      cartId ? eventData.cartId = cartId : '';
    }


    _makeRequest('/track-event', eventData);
  }

  function _detectVideoRatio({ height, width }) {
    const hasSquareFormat = (height / width) > 0.9 && (height / width) < 1.2;
    if (hasSquareFormat) {
      return 'square'
    } else if (height > width) {
      return 'portrait'
    } else {
      return 'landscape'
    }
  }

  function _exclusiveTimeClientBulkInGalery(campaign) {
    const eventListenerType = isMobile ? 'touchend' : 'click';

    //add Vidjet element
    document.getElementsByClassName('magic-slide mt-active')[0].insertAdjacentHTML("afterend", '<div class="magic-slide mt-active vidjet-video-wrapper vidjet-toggle" style="display: none; padding-bottom: 100%; position: relative; overflow: hidden; height: auto; margin: 0px auto; width: 56.5%" > <iframe class="vidjet-embed-iframe" data-vidjet-campaign-id="f7278680-1975-48d8-832a-f8eeb6c4ad86" src="https://player.vidjet.io/68945558-fa1e-4113-a678-4860e8a4c67b/f7278680-1975-48d8-832a-f8eeb6c4ad86?backendCall=true" style=" position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px; " allow="clipboard-read; clipboard-write; fullscreen" frameborder="0" ></iframe> </div>');

    //Add event listener on current elements
    const els = document.getElementsByClassName('magictoolbox-selector mz-thumb');
    for (let el of els) {
      el.addEventListener(eventListenerType, () => {
        //Toggle image and video
        document.getElementsByClassName('magic-slide mt-active')[0].style.display = 'block';
        document.getElementsByClassName('magic-slide mt-active vidjet-toggle')[0].style.display = 'none';

        //remove the selected class from vidjet thumbnail
        const vidjetSelectedThumbnail = document.getElementsByClassName('magictoolbox-selector mz-thumb vidjet-toggle')[0];
        vidjetSelectedThumbnail.classList.remove('active-selector');
        vidjetSelectedThumbnail.classList.remove('mz-thumb-selected');
      });
    }

    //Add Vidjet thumbnail
    const node = document.createElement("a");

    node.innerHTML = `<a class="magictoolbox-selector mz-thumb vidjet-toggle" style="position: relative" data-mt-selector-id="6559" onclick="return false;" data-magic-slide-id="zoom" data-zoom-id="MagicZoomPlusImageMainImage" href="${campaign.videos[0].thumbnail}" data-image="${campaign.videos[0].thumbnail}" title="Vidjet thumbnail"><img src="${campaign.videos[0].thumbnail}" alt="Audemars Piguet Royal Oak - 14" style="width: 58px; height: 104px;"><img src="https://media.vidjet.io/Play+Icon+3.0.png" alt="img-1" style="color: white;display: block;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);width: 25px; height: 31px;pointer-events: none;border-bottom-color: transparent;"></a>`;
    node.firstChild.addEventListener(eventListenerType, () => {
      //Toggle image and video
      document.getElementsByClassName('magic-slide mt-active')[0].style.display = 'none';
      document.getElementsByClassName('magic-slide mt-active vidjet-toggle')[0].style.display = 'block';

      //Remove the selected class from previous selected thumbnail
      const selectedThumbnail = document.getElementsByClassName('magictoolbox-selector mz-thumb active-selector')[0];
      (selectedThumbnail && selectedThumbnail.classList.remove('active-selector'));
      (selectedThumbnail && selectedThumbnail.classList.remove('mz-thumb-selected'));

      //Add the eselected class ot our thumbnail
      const vidjetSelectedThumbnail = document.getElementsByClassName('magictoolbox-selector mz-thumb vidjet-toggle')[0];
      vidjetSelectedThumbnail.classList.add('active-selector');
      vidjetSelectedThumbnail.classList.add('mz-thumb-selected');
    });

    document.getElementsByClassName('magictoolbox-selector mz-thumb')[document.getElementsByClassName('magictoolbox-selector mz-thumb').length - 1].parentNode.appendChild(node.firstChild);

    const iframe = document.querySelector(`iframe[data-vidjet-campaign-id="${campaign._id}"]`);
    if (iframe) {
      iframe.addEventListener('load', function () {
        // Send tracking analytics to the iframe
        _sendAnalyticsToIframes();

        const message = {
          action: 'widgetToDisplay',
          data: { campaign, site: vidjetSite }
        };

        // Send the message to the iframe after it has loaded
        iframe.contentWindow.postMessage(message, '*');
      });
    }
  }

  function _addVideoInImageGallery() {
    //Elifexir
    if (vidjetSiteId === '1f3f4a1f-b5cf-41c9-8906-be1aeebde3e1') {
      const videosToAdd = [];
      // const videosToAdd = [
      //   { url: "/ritual-fit", campaignId: "707e9af6-fc42-47e5-9c29-509b79964d0c", secondPath: "/ritual-fit/" },
      //   { url: "/vientre-plano", campaignId: "24189915-94f1-44de-8bdf-3f1cccfba7f5", secondPath: "/vientre-plano/" },
      //   { url: "/fitness", campaignId: "75ce73a6-65cb-48db-bbc5-0d8ee2d57401", secondPath: "/fitness/" },
      // ]

      //{ url: "/senobell", campaignId: "2e81e940-04f9-47db-856a-ade310749dc6", secondPath: "/senobell/" },

      for (const videoToAdd of videosToAdd) {
        if (document.location.pathname === videoToAdd.url || document.location.pathname === videoToAdd.secondPath) {
          var checkCount = 1;
          var elementCheck = setInterval(function () {
            var elementInGallery = document.getElementsByClassName('woocommerce-product-gallery__image') && document.getElementsByClassName('woocommerce-product-gallery__image')[2];

            //When ready, replace with our video/iframe element
            if (elementInGallery) {
              elementInGallery.innerHTML = `
              <div class="vidjet-video-wrapper" style="padding-bottom: 100%;position: relative;overflow: auto;width: 56.25%;margin: 0px auto;">
                <iframe class="vidjet-embed-iframe" src="https://player.vidjet.io/1f3f4a1f-b5cf-41c9-8906-be1aeebde3e1/${videoToAdd.campaignId}?backendCall=true"
                  style=" position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px; "
                  allow="clipboard-read; clipboard-write; fullscreen" frameborder="0"></iframe>
              </div>`;


              clearInterval(elementCheck);
            }

            checkCount += 1;
            //Only allow checking before 2 second
            if (checkCount >= 20) {
              clearInterval(elementCheck);
            }
          }, 100); // Checks every 100ms(0.1s)
          break;
        }
      }
    } else if (vidjetSiteId === '15701a38-dae7-47d3-9881-cddf540b11a2') { // Atashi Celullar
      const videosToAdd = [
        { url: "https://atashicellular.com/antioxidante/587-tonico-regenerante-purificante.html", campaignId: "6c9e1a3b-f851-4d81-a280-162a175ad732" }
      ];

      for (const videoToAdd of videosToAdd) {
        if (document.location.href.includes(videoToAdd.url)) {
          var checkCount = 1;
          var elementCheck = setInterval(function () {
            var elementInGallery = document.getElementsByClassName('product-lmage-large swiper-slide') && document.getElementsByClassName('product-lmage-large swiper-slide')[2];

            //When ready, replace with our video/iframe element
            if (elementInGallery) {
              elementInGallery.innerHTML = `
              <div class="vidjet-video-wrapper" style="padding-bottom: 100%;position: relative;overflow: auto;width: 100%;margin: 0px auto;">
                <iframe class="vidjet-embed-iframe" src="https://player.vidjet.io/15701a38-dae7-47d3-9881-cddf540b11a2/${videoToAdd.campaignId}?backendCall=true"
                  style=" position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 10px; "
                  allow="clipboard-read; clipboard-write; fullscreen" frameborder="0"></iframe>
              </div>`;


              clearInterval(elementCheck);
            }

            checkCount += 1;
            //Only allow checking before 2 second
            if (checkCount >= 20) {
              clearInterval(elementCheck);
            }
          }, 100); // Checks every 100ms(0.1s)
          break;
        }
      }
    }
  }

  function _addResizeListener() {
    let resizeTimer;
    window.addEventListener('resize', function (event) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        _handleOnResizeWindow();
      }, 250);
    }, true);
  }


  function _handleOnResizeWindow() {
    //If we do not have a video displayed do not handle the resize event
    if (!vidjet_format) {
      return
    }

    const isPopupFormat = _decryptParams(vidjet_format).campaignType === "popup";
    if (isPopupFormat) {
      return
    }
    let { iframeWidth, iframeHeight } = _setIframeSize(videoOriginalSize);

    const offset = { moveX: vidjet_format.moveX, moveY: vidjet_format.moveY };
    const { offsetX: moveX, offsetY: moveY } = _limitOffset(offset);
    if (isPlayerOpen) {
      _resizeIframe(iframeWidth, iframeHeight, moveX, moveY);
    } else {
      const { width, height } = _setBubbleSize();
      _resizeIframe(width + BUBBLE_EXTRA.width, height + BUBBLE_EXTRA.height, moveX, moveY);
    }

  }

  function _resizeIframe(iframeWidth, iframeHeight, moveX, moveY) {

    const iframeElement = document.querySelector('.vidjet-iframe');
    if (!iframeElement) {
      return
    } else {
      // reposition element
      const { campaignType } = _decryptParams(vidjet_format);
      const isPopup = campaignType === 'popup';
      const defaultMargin = 10;
      if (campaignType === 'right' && !isPopup) {
        iframeElement.style.right = moveX ? `${moveX}px` : `${defaultMargin}px`;
      } else if (campaignType === 'left' && !isPopup) {
        iframeElement.style.left = moveX ? `${moveX}px` : `${defaultMargin}px`;
      }
      iframeElement.style.bottom = isPopup ? 0 : (!moveY ? `${defaultMargin}px` : `${moveY}px`);

      if (iframeElement) {
        iframeElement.style.width = `${iframeWidth}px`;
        iframeElement.style.height = `${iframeHeight}px`;
      }
    }
  }

  function _isDynamicFormat(campaign) {
    //If the formats is not present, it's because the param is the format object and not the full campaign object
    if (!campaign.formats) {
      return campaign.formatType === 1 || campaign.formatType === 0
    }

    return campaign.formats[0].formatType === 1 || campaign.formats[0].formatType === 0
  }

  function _displayWidgets() {
    let dynamicFormatAlreadyAdded = false;

    for (const campaign of vidjetCampaigns) {
      if (_isDynamicFormat(campaign)) {
        if (dynamicFormatAlreadyAdded) continue;

        vidjet_format = isMobile ? campaign.formats.find(format => format.deviceType === vidjet_DeviceType.mobile) :
          campaign.formats.find(format => format.deviceType === vidjet_DeviceType.desktop);

        //Verify that we have reached the view limit or not. Bulk do not have view restriction
        if (!campaign.bulk) {
          const timingCookie = _getCookie(`vidjet_timing_${campaign._id}`);
          if (timingCookie && new Date().getTime() < new Date(timingCookie).getTime()) {
            continue;
          } else if (timingCookie) {
            // Delete the cookie if the no showing time has been passed
            _deleteCookie(`vidjet_timing_${campaign._id}`);
          }
        }

        dynamicFormatAlreadyAdded = true;

        _displayIframeBasedOnTrigger(campaign);
      } else {
        //Add bulk widget to image gallery for Exclusive time client
        if (vidjetSiteId === '68945558-fa1e-4113-a678-4860e8a4c67b' && campaign._id === 'f7278680-1975-48d8-832a-f8eeb6c4ad86') {
          _exclusiveTimeClientBulkInGalery(campaign);
        }

        const message = {
          action: 'widgetToDisplay',
          data: { campaign, site: vidjetSite }
        };

        //This is only for avenur privee + trois kilo sept right now but it should be applied to all the clients
        const targetedIframes = _targetCarousels(campaign._id);

        targetedIframes.forEach((targetedIframe) => {
          function updateIframeStyle(iframe) {
            if (!iframe.parentElement.style.height || iframe.parentElement.style.height === '0px') {
              iframe.parentElement.style.height = '125px';
            }

            if (iframe.parentElement.style.display === 'none') {
              iframe.parentElement.style.display = '';
            }
          }

          targetedIframe?.contentWindow?.postMessage(message, '*');
          updateIframeStyle(targetedIframe);
          targetedIframe.addEventListener('load', () => {
            targetedIframe?.contentWindow?.postMessage(message, '*');
            updateIframeStyle(targetedIframe);
          });
        });
      }
    }
  }

  function _addCustomCode() {
    const url = new URL(window.location.href);

    //For Graazie live shopping page
    if (vidjetSiteId === 'f1eb6d75-56cd-4808-83d5-2265e156034c' && location.href.includes('live-shopping')) {
      // Select all elements with the data-bellepoque-play-onclick attribute
      const buttons = document.querySelectorAll("[data-bellepoque-play-onclick]");

      // Attach click event listener to each button
      buttons.forEach((button) => {
        button.addEventListener("click", function (event) {
          event.preventDefault(); // Prevent default action if necessary

          // Get the value of the data attribute
          const campaignId = button.getAttribute("data-bellepoque-play-onclick");

          // Call the Vidjet.showCampaign function with the retrieved value
          if (campaignId) {
            Vidjet.showCampaign(campaignId, true);
          } else {
            console.error("Vidjet - Campaign ID is missing on clicked element.");
          }
        });
      });

      // Check if the parameter exists to display live video automatically
      if (url.searchParams.has('autoplay-live-shopping-be')) {
        // Retrieve the value of the parameter
        const paramValue = url.searchParams.get('autoplay-live-shopping-be');
        Vidjet.showCampaign(paramValue, true);
      }
    } else if (vidjetSiteId === 'f1eb6d75-56cd-4808-83d5-2265e156034c' && url.searchParams.has('vidjet-show-widget')) {// graazie automatic video display 
      // Retrieve the value of the parameter
      const paramValue = url.searchParams.get('vidjet-show-widget');
      Vidjet.showCampaign(paramValue, true);
    }
  }

  function _killBulkIframes() {
    //Go through the list of all iframes embed and check if it needs to be removed
    vidjetEmbededIframes.forEach(iframe => {
      const campToKill = vidjetCampaignsToKill.find(campaign => campaign._id === iframe?.getAttribute('data-vidjet-campaign-id'));

      if (campToKill) {
        //If we are inside Shopify editor, make sure to display blank elements.
        if (document?.documentElement?.classList?.contains('shopify-design-mode') || window?.Shopify?.designMode === true) {
          const message = {
            action: 'widgetToDisplay',
            data: {
              campaign: {
                ...campToKill,
                videos: [
                  { url: 'https://media.vidjet.io/default-color-preview.mp4', _id: '1', videoId: '3', thumbnail: 'https://media.vidjet.io/default-color-preview.jpg' },
                  { url: 'https://media.vidjet.io/default-color-preview.mp4', _id: '2', videoId: '3', thumbnail: 'https://media.vidjet.io/default-color-preview.jpg' },
                  { url: 'https://media.vidjet.io/default-color-preview.mp4', _id: '3', videoId: '3', thumbnail: 'https://media.vidjet.io/default-color-preview.jpg' }]
              },
              site: vidjetSite
            }
          };

          //This is only for avenur privee + trois kilo sept right now but it should be applied to all the clients
          const targetedIframes = _targetCarousels(campToKill._id);

          targetedIframes.forEach((targetedIframe) => {
            function updateIframeStyle(iframe) {
              if (!iframe.parentElement.style.height || iframe.parentElement.style.height === '0px') {
                iframe.parentElement.style.height = '125px';
              }

              if (iframe.parentElement.style.display === 'none') {
                iframe.parentElement.style.display = '';
              }
            }

            targetedIframe?.contentWindow?.postMessage(message, '*');
            updateIframeStyle(targetedIframe);
            targetedIframe.addEventListener('load', () => {
              targetedIframe?.contentWindow?.postMessage(message, '*');
              updateIframeStyle(targetedIframe);
            });
          });
          return
        }

        iframe?.parentElement?.remove();
      }
    });
  }

  // public accessible methods
  return {
    init: async function () {
      //_setAnalytics
      _setAnalytics();

      // Send tracking analytics to the iframe already embeded
      _sendAnalyticsToIframes();

      // Add listener for player messages
      _setListenerForPlayerEvent();

      //replace image in photo gallery with video
      _addVideoInImageGallery();

      // load css
      _addCss();

      if (!vidjetSiteId) {
        console.error('Vidjet - No SiteId set in script url');
        return
      }

      // Call BE endpoint to propagate bulk or display widget
      await _getWidgets();

      if (!vidjetSite) {
        return
      }

      //If it's locked, check if there are embeded code and do not display dynamic format
      if (vidjetSite.isLocked) {
        _removeEmbedWhenLocked();
        return
      }

      //For some clients, we do some manual stuff
      _addCustomCode();

      //Send data to bulk & display dynamic formats
      _displayWidgets();

      //Kill Bulk embeded iframes if not matching segmentation
      _killBulkIframes();

      //The page view event is now handled by the /widget endpoit directly in the BE

      // If the website is not integrated yet, set it to manual by calling BE
      _integrateManualIfNeeded();

      // Set cart id cookie to know when cart is created
      _setCartActions();

      //Add resize listener for bubble and popup (why dont we do it after adding the element ??)
      if (vidjet_format) {
        const { isFullScreen } = _decryptParams(vidjet_format);
        !isFullScreen && _addResizeListener();
      }
    },

    // No segmentation check, we just want to display a video
    // If no video running or force=true we show it
    showCampaign: function (campaignId, isForceShow) {
      const campaignToShow = vidjetCampaignsToShowManual.find(campaign => campaign._id == campaignId);

      if (!campaignToShow) {
        return console.error(`Invalid campaign id for ${campaignId}`)
      }

      // We need all the variables, but for the campaignId we pass
      // So we get them again and overwrite whatever they were
      vidjet_format = isMobile ? campaignToShow.formats.find(format => format.deviceType === vidjet_DeviceType.mobile) :
        campaignToShow.formats.find(format => format.deviceType === vidjet_DeviceType.desktop);

      const { isFullScreen } = _decryptParams(vidjet_format);

      if (isForceShow) {
        _destroyIframe();
        // Reinitializing some variables after destroy
        vidjet_componentsHasBeenDisplayed = false;
        ticking = false;
        hasScrollFired = false;
        _displayIframeBasedOnTrigger(campaignToShow);
        !isFullScreen && _addResizeListener();
      } else {
        // If there's no iframe present, show video
        // Otherwise we warn the user about "forceShow"
        if (!document.querySelectorAll('.vidjet-iframe').length) {
          vidjet_componentsHasBeenDisplayed = false;
          ticking = false;
          hasScrollFired = false;
          _displayIframeBasedOnTrigger(campaignToShow);
          !isFullScreen && _addResizeListener();
        } else {
          return console.warn('Campaign already running. To show this video, pass "true" as the second parameter to force show.')
        }
      }
    },
    initSpa: function () {
      const self = this;
      // Store url on window load
      let currentPage = location.href;
      // Listen for changes every 500ms
      setInterval(function () {
        if (currentPage != location.href) {
          console.log('VIDJET: page change detected');
          _destroyIframe();
          vidjet_componentsHasBeenDisplayed = false;
          ticking = false;
          hasScrollFired = false;
          self.init();
          // Page has changed, set new page as 'current'
          currentPage = location.href;
        }
      }, 500);
    },
    send: function (event, sendParams) {
      // at the moment, the only event a user can send is "conversion"
      if (event === 'conversion' || event === 'order') {
        return _sendEvent(event, sendParams)
      } else {
        return console.warn(`The '${event}' type is not supported. Please use a valid event type.`)
      }
    }
  };
})();

Vidjet.init();
console.log('VIDJET loaded');
