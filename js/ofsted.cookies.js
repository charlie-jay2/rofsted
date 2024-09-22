"use strict";

/**
 * Ofsted reports cookie handling
 *
 * Add the 'cookie_opt_in' if the user accepts all cookies.
 *
 */
(function (OFSTED, $) {
    var ORCookies = OFSTED.ORCookies = {
        init: function () {
            ORCookies.bannerListeners();
            ORCookies.cookieForm();
        },

        /**
        * Method to create cookie.
        */
        createCookie: function (name, value, mins) {
            if (mins) {
                var date = new Date();

                date.setTime(date.getTime() + (mins * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            } else {
                var expires = "";
            }

            // Not including expires to have cookie last as long as session in browser
            return document.cookie = name + '=' + value + '; path=/' + expires;
        },

        /**
         * Method to check for a cookie value
         *
         * @see https://gist.github.com/litodam/3048775
         */
        readCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        /**
        * Setup accept all button for cookie banner.
        */
        bannerListeners: function () {
            var bannerCookie = ORCookies.readCookie('cookie_opt_in');
            if (!bannerCookie && bannerCookie !== 0) {
                OFSTED.Utils.clearCookies();
            }

            $('.cookie-banner__close').click(function (e) {
                $(this).closest('.cookie-banner').hide();
                // Create cookie for accepting cookies banner
                ORCookies.createCookie('cookie_opt_in', 1, 525600);
                OFSTED.Utils.fireGtm();
                e.preventDefault();
            });
        },

        /**
         * Update the cookie value when the user changes their preferences on the
         * cookie page (/cookies)
         */
        cookieForm: function () {
            var $form = $('.cookie-form');
            var backLink = $form.find('.js-referrer-link');
            var referrer = OFSTED.Utils.getReferrer();
            backLink.attr('href', referrer);

            $form.on('submit', function (e) {
                var checked = $(this).find('input:checked');
                if (checked.val() == 1) {
                    ORCookies.createCookie('cookie_opt_in', 1, 525600);
                    OFSTED.Utils.fireGtm();
                } else {
                    ORCookies.createCookie('cookie_opt_in', 0, 525600);
                    // Delete all the cookies; the user has opted-out.
                    OFSTED.Utils.clearCookies();
                    window.ga = null
                }
                e.preventDefault();
                $form.find('.confirmation-message').show();
            });
        },

    }
})(window.OFSTED, window.jQuery);
