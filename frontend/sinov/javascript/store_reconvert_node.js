var jQueryRCT,
  script,
  current_script_url = document.currentScript.src,
  domain_name = current_script_url
    .replace("http://", "")
    .replace("https://", "")
    .split(/[/?#]/)[0],
  RCT_SITE_URL = "",
  RCT_ASSETS_URL = "",
  reconvertAjaxUrl =
    ("localhost" === domain_name
      ? ((RCT_SITE_URL = "http://localhost:4000/rtc_api/v1/"),
        (RCT_ASSETS_URL = "http://localhost/stilyo-apps/reconvert/v1/"))
      : "reconvert-stage.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://stage-node.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://reconvert-stage.stilyoapps.com/v1/"))
      : "cdn.stilyoapps.com" == domain_name ||
        "stilyoapps.com" == domain_name ||
        "www.stilyoapps.com" == domain_name ||
        "reconvert-cdn.com" == domain_name
      ? ((RCT_SITE_URL = "https://rct-service.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://reconvert-cdn.com/v1/"))
      : "stage-cdn.stilyoapps.com" == domain_name ||
        "prephp.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://prenode.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://prephp.stilyoapps.com/reconvert/v1/"))
      : "dev.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://dev-rct-argo.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://dev.stilyoapps.com/reconvert/v1/"))
      : "demo.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://demo-node.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://demo.stilyoapps.com/reconvert/v1/"))
      : "test-php.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://test-node.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://test-php.stilyoapps.com/reconvert/v1/"))
      : "stage-reconvert-ng.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://stage-node-ng.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL =
          "https://stage-reconvert-ng.stilyoapps.com/reconvert/v1/"))
      : "awsdev.stilyoapps.com" == domain_name
      ? ((RCT_SITE_URL = "https://awsdev-node.stilyoapps.com/rtc_api/v1/"),
        (RCT_ASSETS_URL = "https://awsdev.stilyoapps.com/reconvert/v1/"))
      : "reconvert-php-dashboardstage.reconvert.com" == domain_name &&
        ((RCT_SITE_URL =
          "https://reconvert-node-dashboardstage.reconvert.com/rtc_api/v1/"),
        (RCT_ASSETS_URL =
          "https://reconvert-php-dashboardstage.reconvert.com/reconvert/v1/")),
    RCT_SITE_URL + "store/reconvert"),
  RCTLoadStyle = function (e) {
    var t = document.getElementsByTagName("head")[0],
      o = document.createElement("link");
    (o.rel = "stylesheet"),
      (o.type = "text/css"),
      (o.href = e),
      (o.media = "all"),
      t.appendChild(o);
  },
  RCT_shop =
    (RCTLoadStyle(RCT_ASSETS_URL + "assets/css/rct_cart_front.css"),
    Shopify.shop),
  rctShopInfo = {},
  rctMainNote = "";
function RCTSetCookie(e, t, o) {
  var a = new Date(),
    o =
      (a.setTime(a.getTime() + 24 * o * 60 * 60 * 1e3),
      "expires=" + a.toUTCString());
  document.cookie = e + "=" + t + ";" + o + ";path=/;SameSite=None; Secure";
}
function RCTGetCookie(e, t) {
  for (
    var o = (e = null != e ? e : "flash_msg") + "=",
      a = document.cookie.split(";"),
      p = "",
      r = 0;
    r < a.length;
    r++
  ) {
    for (var n = a[r]; " " == n.charAt(0); ) n = n.substring(1);
    if (0 == n.indexOf(o))
      return (
        (p = n.substring(o.length, n.length)),
        (p = "1" == t && "0" == p ? "TIMER" : p)
      );
  }
  return p;
}
function RCTremoveCookie(e) {
  var t = new Date(),
    t = (t.setTime(t.getTime() + 1e3), "; expires=" + t.toGMTString());
  document.cookie = e + "=" + t + "; path=/";
}
function RCTSetLocalStorage(e, t) {
  localStorage.setItem(e, t);
}
function RCTGetLocalStorage(e) {
  return localStorage.getItem(e);
}
function RCTRemoveLocalStorage(e) {
  return localStorage.removeItem(e);
}
function RCTStoreReconMainFun() {
  var e =
      null != (e = RCTGetCookie("RCT-Revenue", "0")) && "" != e
        ? JSON.parse(e)
        : [],
    a = {},
    p = { additional_details: "" },
    t =
      ((e.additional_details = e.additional_details || []),
      (p.note = encodeURI(e.note).replaceAll("#", "%23")),
      e.additional_details.forEach(function (e, t) {
        var o = e[Object.keys(e)[0]],
          e = Object.keys(e)[0];
        p.additional_details += e + ": " + (a[e] = o) + "%0A";
      }),
      a.Template_id),
    o = a.Section_id,
    e =
      (((null != e && "" != e && null != o && "" != o) ||
        (null != t && "" != t)) &&
        (jQueryRCT('[name="note"]').val("").trigger("keyup"), RCTcheckCart(p)),
      null == t && (t = ""),
      RCTGetCookie("RCT-popup", "0"));
  e &&
    ((o = RCTGetCookie("RCT-popup-time", "0")),
    jQueryRCT.ajax({
      url: reconvertAjaxUrl,
      type: "post",
      dataType: "json",
      data: {
        shop: RCT_shop,
        action: "setTimerPopupBottom",
        selected_page_id: t,
        id: e,
        popupTimestamp: o,
      },
      success: function (e) {
        var t;
        "success" == e.result
          ? (jQueryRCT("body").append(e.html),
            jQueryRCT(".RCT-top-bar").is(":visible") &&
              (jQueryRCT("body").addClass("RCT-topbar-popup"),
              (t = jQueryRCT(".RCT-top-bar").height()),
              (t =
                '<div class="RCT-topbar-style"><style>.RCT-topbar-popup #page header.util + #shopify-section-header.header, .RCT-topbar-popup .sticky-header #PageContainer #shopify-section-header.header-section { top: ' +
                (t -=
                  0 < jQueryRCT("#shopify-section-announcement").length
                    ? jQueryRCT("#shopify-section-announcement").height()
                    : 0) +
                'px !important; } .RCT-topbar-popup .site-header--fixed, .RCT-topbar-popup .site-header.site-header--homepage, .RCT-topbar-popup #mobileNavBar, .RCT-topbar-popup #StickyBar.sticky--active, .RCT-topbar-popup .js-sticky-action-bar .action-area, .RCT-topbar-popup .site-header.page-element:not(.is-moved-by-drawer), .RCT-topbar-popup .nav-mobile, .RCT-topbar-popup .ajaxify-drawer, .RCT-topbar-popup .sticky-navigation-container.sticky.stuck, .RCT-topbar-popup #MobileNav, .RCT-topbar-popup .header__close.fixed, .RCT-topbar-popup .site-header-sticky .site-header--stuck, .RCT-topbar-popup .nav-container.nav-sticky, .RCT-topbar-popup #navbarStickyDesktop.nav-sticky, .RCT-topbar-popup .site-header.has-scrolled, .RCT-topbar-popup .site-header#header.header--has-scrolled, .RCT-topbar-popup .site-header#header.header--is-standard.header--standard, .RCT-topbar-popup .site-header#header.header--is-hamburger.header--standard, .RCT-topbar-popup .pageWrap #shopify-section-header nav.nav-hamburger.nav-main, .RCT-topbar-popup .site-header.headroom, .RCT-topbar-popup #site-header.site-header, .RCT-topbar-popup body[class^="trademark--"] .shopify-section__header, .RCT-topbar-popup [data-header-sidebar="true"] .main-sidebar, .RCT-topbar-popup .ui.sticky.top, .RCT-topbar-popup header.hero-active .hero-image-header-wrap, .RCT-topbar-popup .header.sticky .bar.fixed, .RCT-topbar-popup body[class^="kagami--"] #shopify-section-header, .RCT-topbar-popup #page header.util, .RCT-topbar-popup body:not(.show-mobile-nav) #toolbar.docked, .RCT-topbar-popup body.show-mobile-nav #mobile-nav .inner, .RCT-topbar-popup body.sticky-header .header .header-main-content[data-header-content], .RCT-topbar-popup #nav .wsmenu, .RCT-topbar-popup .header_bot.enabled-sticky-menu.sticky, .RCT-topbar-popup .transition-body #shopify-section-header #NavDrawer.drawer.drawer--is-open, .RCT-topbar-popup .transition-body #shopify-section-header #CartDrawer.drawer.drawer--is-open, .RCT-topbar-popup .header__mobile-nav, .RCT-topbar-popup .searching .search-bar-wrapper, .RCT-topbar-popup #shopify-section-header .coverheader, .RCT-topbar-popup .header.sticky-header--true, .RCT-topbar-popup .header.sticky-header--false.is-absolute, .RCT-topbar-popup #header.mobile-sticky-header--true, .RCT-topbar-popup #header.mm-fixed-top.mobile-header.mm-slideout, .RCT-topbar-popup #site-control.site-control, .RCT-topbar-popup .nav-shift #page-banner.banner-under-header, .RCT-topbar-popup .nav-shift .container #main, .RCT-topbar-popup #shopify-section-general-header .main-header-wrapper + .header-drawer, .RCT-topbar-popup .header-section .stuckMenu.isStuck, .RCT-topbar-popup #shopify-section-mobile-navigation .shifter-navigation, .RCT-topbar-popup .header-wrapper .sticky-header-wrapper.sticky, .RCT-topbar-popup #mobile-header #mobile-nav.mobile-nav, .RCT-topbar-popup header.is-sticky.st-visible, .RCT-topbar-popup header#top.header:not([role="banner"]), .RCT-topbar-popup header#velaHeader.velaHeader, .RCT-topbar-popup body.fixed-header.fixed-header--all > header, .RCT-topbar-popup .have-fixed .nav-bar, .RCT-topbar-popup .header-bottom.on .header-panel, .RCT-topbar-popup .have-fixed .nav-search, .RCT-topbar-popup .mb-fixed .hd_mobile, .RCT-topbar-popup .open-mn .hd_mobile .icon-menu, .RCT-topbar-popup .open-user .close_user, .RCT-topbar-popup html.open-mn .mn_mobile nav, .RCT-topbar-popup html.open-user .mobile_customer nav, .RCT-topbar-popup .header__search-bar-wrapper.is-fixed, .RCT-topbar-popup .sticky-header.header-clone.act-scroll, .RCT-topbar-popup .mobile_nav-fixed--false .page_banner, .RCT-topbar-popup .header-container.sticky-header, .RCT-topbar-popup .tt-stuck-nav.stuck, .RCT-topbar-popup .tt-dropdown-menu, .RCT-topbar-popup header#top.scroll-to-fixed-fixed, .RCT-topbar-popup header#header .header__content--sticky, .RCT-topbar-popup .header--sticky.is-sticky .header__content, .RCT-topbar-popup .stickyNav, .RCT-topbar-popup #header-phantom.sticky-header.fixed-header, .RCT-topbar-popup #sticky-info-product-template, .RCT-topbar-popup .sticky-wrapper.is-sticky .header-sticky, .RCT-topbar-popup .header__mobile.is-fixed, .RCT-topbar-popup #shopify-section-header-sticky.header-sticky__placeholder, .RCT-topbar-popup header#header-header.site-header, .RCT-topbar-popup #shopify-section-pxs-announcement-bar + #shopify-section-header .main-header-wrapper, .RCT-topbar-popup .sticky-header #PageContainer #shopify-section-header.header-section, .RCT-topbar-popup .header-content .header-container.header-fixed .header-main, .RCT-topbar-popup .header-content .header-container.header-mobile-fixed .header-main, .RCT-topbar-popup body.site-header-sticky .site-header, .RCT-topbar-popup #app-header.sticky-on.sticky, .RCT-topbar-popup .mm-page.mm-slideout #content_wrapper + .mobile-search, .RCT-topbar-popup .docked-navigation-container .docked-navigation-container__inner, .RCT-topbar-popup .docked-mobile-navigation-container .docked-mobile-navigation-container__inner, .RCT-topbar-popup nav.navigation--sticky.navigation[aria-label="Primary Navigation"], .RCT-topbar-popup #nav + #content_wrapper.mm-page .content.container, .RCT-topbar-popup .bodywrap.cf .page-header.cf { top: ' +
                t +
                'px !important; } .RCT-topbar-popup #ajaxifyDrawer.is-visible, .RCT-topbar-popup header.site-header.sticky:not(.ui), .RCT-topbar-popup #shopify-section-header.header header.sticky:not(.ui), .RCT-topbar-popup body:not(.mobile-drawer--open) .page-wrapper.page-element, .RCT-topbar-popup .site-header.is-standard.shift--alert, .RCT-topbar-popup .large--hide.medium-down--show.sticky-header:not(.ui), .RCT-topbar-popup #shopify-section-static-header.site-header-sticky--open, .RCT-topbar-popup #shopify-section-static-header.visible, .RCT-topbar-popup .site-navigation-wrapper + .site-mobile-nav .mobile-nav-panel, .RCT-topbar-popup .site-header-main-content .live-search--takeover .live-search-form, .RCT-topbar-popup body.colors--body-n-button-match .off-canvas--viewport .off-canvas--main-content, .RCT-topbar-popup body.js-focus-visible.is-mobile, .RCT-topbar-popup body:not(.js-drawer-open) .sticky-header.squished-header, .RCT-topbar-popup #announcement-bar.table, .RCT-topbar-popup body.meta-fixed #meta, .RCT-topbar-popup header.main-header-wrap.main-header--minimal-sticky, .RCT-topbar-popup #site-wrap #header #shopify-section-header + .curr-switcher.js, .RCT-topbar-popup .main_nav_wrapper.sticky_nav.sticky_nav--stick, .RCT-topbar-popup .main-nav__wrapper.sticky_nav.sticky_nav--stick, .RCT-topbar-popup .header.header-fixed--true.is-absolute, .RCT-topbar-popup #header.mobile_nav-fixed--true, .RCT-topbar-popup body.mobile_nav-fixed--false a#pagecontent[name="pagecontent"], .RCT-topbar-popup .mobile_nav-fixed--false.is-active #header, .RCT-topbar-popup .mono-produit-true[class^="mobile-type-header"] nav.nav-bar, .RCT-topbar-popup .wrap-all #headerApp, .RCT-topbar-popup .group-header.sticky-menu.active, .RCT-topbar-popup body:not(.js-drawer-open) .sticky-header.main-header-wrapper, .RCT-topbar-popup #sidebar-holder #sidebar, .RCT-topbar-popup #content-holder #content, .RCT-topbar-popup .mm-page.mm-slideout #content_wrapper #shopify-section-header + .index-sections .slideshow-section, .RCT-topbar-popup .mm-page.mm-slideout #content_wrapper #shopify-section-header + .main_content_area .index-sections .slideshow-section, .RCT-topbar-popup .mm-page.mm-slideout #content_wrapper #shopify-section-header + .index-sections .banner-section, .RCT-topbar-popup .bodywrap.cf .page-header.cf + #navbar.nav-style-out { margin-top: ' +
                t +
                "px; } .RCT-topbar-popup #shopify-section-header { margin-top: " +
                t +
                "px !important; }</style></div>"),
              jQueryRCT("body").append(t)),
            RCTbottomTimer(e.min, e.sec))
          : RCTremoveCookie("RCT-popup");
      },
      error: function (e, t) {},
    })),
    jQueryRCT(document).on("click", ".RCT-bar .close-btn", function (e) {
      jQueryRCT(".RCT-bar,.RCT-topbar-style").remove(),
        RCTremoveCookie("RCT-popup");
    });
}
function RCTbottomTimer(e, t) {
  var o = e < 10 ? "0" + e : e,
    a = t < 10 ? "0" + t : t;
  setInterval(function () {
    --a < 0 &&
      ((a = 59),
      --o < 0 && jQueryRCT(".RCT-bar,.RCT-topbar-style").remove(),
      (o = o < 10 ? "0" + o : o)),
      (a = a < 10 ? "0" + a : a),
      jQueryRCT(".RCT-bar .timer.minute").html(o + "m"),
      jQueryRCT(".RCT-bar .timer.sec").html(a + "s");
  }, 1e3);
}
function RCTcheckCart(e) {
  var t = "",
    o = "",
    a =
      (null != e &&
        "" != e &&
        ((t = "attributes[RCT-Revenue]=" + e.additional_details),
        (o = "undefined" == e.note ? "" : e.note),
        (o = "" != (rctMainNote = o) ? "note=" + o : "")),
      t + "&" + o);
  (a += "&update"),
    jQueryRCT.ajax({
      method: "GET",
      url: "/cart.js?internal",
      dataType: "json",
      async: !1,
      success: function (e) {
        void 0 !== e.attributes &&
          jQueryRCT.ajax({
            url: "/cart/update.js",
            data: a,
            success: function (e) {},
          });
      },
    });
}
function RCT_social_visitor() {
  var e = RCTgetParameterByName("RCT-media");
  null != e &&
    "" != e &&
    jQueryRCT.ajax({
      url: reconvertAjaxUrl,
      type: "post",
      dataType: "json",
      data: { shop: RCT_shop, action: "social_visitor", refrence: e },
      success: function (e) {
        var t;
        "success" == e.result &&
          ((t = RCTremoveParam("RCT-media", window.location.href)),
          window.history.pushState("", "", t),
          (e.page_name = encodeURIComponent(e.page_name)),
          (t = [
            { Section_name: "Social sharing" },
            { Template_name: e.page_name },
            { Original_order_name: e.order_name },
            { Original_order_id: e.order_id },
            { Section_id: "10" },
            { Template_id: e.page_id },
            { Action: e.action },
          ]),
          RCTSetCookie("RCT-Revenue", JSON.stringify(t), 1));
      },
      error: function (e, t) {},
    });
}
function RCTgetParameterByName(e) {
  e = RegExp("[?&]" + e + "=([^&]*)").exec(window.location.search);
  return e && decodeURIComponent(e[1].replace(/\+/g, " "));
}
function RCTremoveParam(e, t) {
  var o = t.split("?")[0],
    a = [],
    t = -1 !== t.indexOf("?") ? t.split("?")[1] : "";
  if ("" !== t) {
    for (var p = (a = t.split("&")).length - 1; 0 <= p; --p)
      a[p].split("=")[0] === e && a.splice(p, 1);
    o = o + "?" + a.join("&");
  }
  return RCTrtrim(o, "?");
}
function RCTrtrim(e, t) {
  return (t = t || "s"), e.replace(new RegExp("[" + t + "]+$", "g"), "");
}
function RCT_click_buy_now() {
  var t = RCTGetCookie("RCT-page-id", "0"),
    o = RCTGetCookie("RCT-popup", "0"),
    a = RCTGetCookie("RCT-popup-info", "0"),
    p = jQueryRCT("select[name=id]").val() || meta.product.variants[0].id,
    r = jQueryRCT("input[name=quantity]").val() || 1;
  jQueryRCT.getJSON("/cart.js", function (e) {
    jQueryRCT.ajax({
      url: reconvertAjaxUrl,
      type: "post",
      async: !0,
      dataType: "json",
      data: {
        shop: RCT_shop,
        action: "buy_now_discount_update",
        product_id: __st.rid,
        selected_page_id: t,
        cart_data: e,
        variant_id: p,
        quantity: r,
        discount_id: o,
        popupInfo: a,
      },
      success: function (e) {
        "success" == e.result && null != e.cart_url
          ? (console.log(`ReConvert redirect to ${e.cart_url}.`),
            (window.location.href = e.cart_url))
          : ((e = `/cart/${p}:` + r),
            console.log(`ReConvert redirect to ${e}.`),
            (window.location.href = e));
      },
      error: function (e, t) {
        var o = `/cart/${p}:` + r;
        console.log(`ReConvert redirect to ${o}.`), (window.location.href = o);
      },
    });
  });
}
window.jQuery
  ? ((jQueryRCT = window.jQuery), RCTStoreReconMainFun())
  : window.Checkout && window.Checkout.jQuery
  ? ((jQueryRCT = window.Checkout.jQuery), RCTStoreReconMainFun())
  : (((script = document.createElement("SCRIPT")).src =
      "https://code.jquery.com/jquery-3.4.0.min.js"),
    (script.type = "text/javascript"),
    (script.onload = function () {
      (jQueryRCT = window.jQuery), RCTStoreReconMainFun();
    }),
    document.getElementsByTagName("head")[0].appendChild(script)),
  RCT_social_visitor();
var page,
  checkOutfrmBtnObj,
  rctDiscountCode = RCTGetCookie("RCT-popup", "0");
null != rctDiscountCode &&
  "" != rctDiscountCode &&
  ("undefined" != (page = __st.p) &&
    "product" == page &&
    jQueryRCT(document).ready(function () {
      var e = 1,
        t = setInterval(function () {
          var o = document.querySelectorAll(
            'button[data-testid="Checkout-button"],input[data-testid="Checkout-button"]'
          );
          if (0 < o.length || 100 < e) {
            for (let e = 0, t = o.length; e < t; e++)
              o[e].addEventListener(
                "click",
                function (e) {
                  window.stop(),
                    e.preventDefault(),
                    e.stopImmediatePropagation(),
                    e.stopPropagation(),
                    RCT_click_buy_now();
                },
                !0
              );
            clearInterval(t);
          }
          e++;
        }, 100);
    }),
  (checkOutfrmBtnObj = [
    "[name='checkout']",
    "[href='/checkout']",
    "form[action='/checkout'] input[type='submit']",
    "input[name='checkout']",
    "button[name='checkout']",
    "button.new_checkout_button",
    "input[value='Checkout']",
    "input[value='Check out']",
    "button:contains('Checkout'):not(.cart_button)",
    "button:contains('Check out'):not(.cart_button)",
    "a[href='/checkout']",
    "input[name='goto_pp']",
    "button.additional-checkout-button",
    "div.additional-checkout-button",
    "#paypal-express-button",
    ".additional-checkout-button--apple-pay",
    "button.icartCheckoutBtn",
  ].join(", ")),
  setTimeout(function () {
    jQueryRCT(document).on("click.olEvents", checkOutfrmBtnObj, function (e) {
      var t = RCTGetCookie("RCT-page-id", "0");
      if (
        (e.preventDefault(),
        e.stopPropagation(),
        e.stopImmediatePropagation(),
        0 != jQueryRCT('[name="note"]').length &&
          jQueryRCT('[name="note"]').val())
      ) {
        let t = jQueryRCT('[name="note"]').val();
        jQueryRCT.ajax({
          method: "GET",
          url: "/cart.js?internal",
          dataType: "json",
          async: !0,
          success: function (e) {
            void 0 !== e.attributes &&
              (((e = e.attributes).note = t),
              (rctMainNote = rctMainNote
                ? ((rctMainNote = rctMainNote.replaceAll("%23", "#")),
                  decodeURI(rctMainNote) + "\n" + t)
                : t),
              jQueryRCT.ajax({
                url: "/cart/update.js",
                async: !0,
                data: { attributes: e, note: rctMainNote },
                success: function (e) {},
              }));
          },
        });
      }
      var o = RCTGetCookie("RCT-popup", "0"),
        a = RCTGetCookie("RCT-popup-info", "0");
      jQueryRCT.getJSON("/cart.js", function (e) {
        jQueryRCT.ajax({
          url: reconvertAjaxUrl,
          type: "post",
          dataType: "json",
          data: {
            shop: RCT_shop,
            action: "popup_timer_discount_update",
            cart_data: e,
            selected_page_id: t,
            discount_id: o,
            popupInfo: a,
          },
          success: function (e) {
            "success" == e.result &&
              (null != e.discount_code && "" != e.discount_code
                ? (window.location =
                    "https://" +
                    e.domain +
                    "/checkout/?discount=" +
                    e.discount_code)
                : (window.location = "https://" + e.domain + "/checkout/"));
          },
          error: function (e, t) {},
        });
      });
    });
  }, 2e3));
