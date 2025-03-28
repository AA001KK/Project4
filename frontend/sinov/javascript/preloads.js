
    (function() {
      var baseURL = "https://cdn.shopify.com/shopifycloud/checkout-web/assets/";
      var scripts = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/polyfills.I3JIKAFZ.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/app.BGjfNDKJ.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/page-Information.DalEKPcm.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/ButtonWithRegisterWebPixel.Rly_q8bN.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/NoAddressLocationFullDetour.Bbhftcwy.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/DeliveryMethodSelectorSection.DLMK5kLZ.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/useEditorShopPayNavigation.CuE4jxza.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/VaultedPayment.D8hrKOfV.js"];
      var styles = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/assets/app.v_cfVx1p.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/assets/ButtonWithRegisterWebPixel.9MjAB40w.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/assets/NoAddressLocationFullDetour.CpG-8YkX.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/assets/DeliveryMethodSelectorSection.DmqjTkNB.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/assets/useEditorShopPayNavigation.DCOTvxC3.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1.ru/assets/VaultedPayment.OxMVm7u-.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0831/9906/6398/files/logos_6efde8f7-f42c-43cb-ae55-02f697d16016_x320.png?v=1696065088","https://cdn.shopify.com/s/files/1/0831/9906/6398/files/POGO-18_1_2000x.jpg?v=1699700699"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [baseURL].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  