"use strict";

/**
 * Helpers for the Ofsted Search page
 */
(function (OFSTED, $) {
    var ORAC = OFSTED.Autocomplete = {
        /**
         * The init function is called on page load.
         *
         * Add any methods in here that should be run on page load.
         * e.g the dropdowns util will automatically add an expand / collapse where needed.
         */
        init: function () {
            console.log('=== [OFSTED SEARCH] init ===');
            // Check to see if there's an initMap funciton already defined; if not we'll just fire an init event for us.
            if (typeof (window.initMap) === 'undefined') {
                window.initMap = function () {
                    $(window).trigger('OR.ACInit');
                };
            }

            $(window).on('OR.ACInit', ORAC.locationAC);


            // Accessible GOV.uk autocomplete
            var autocompletes = [].slice.call(document.querySelectorAll('.js-autocomplete'));
            if (autocompletes.length) {
                ORAC.setupAutocomplete(autocompletes);
            }
        },

        /**
         * Set up an autocomplete API instance for location search
         */
        locationAC: function () {
            // Options for the autocomplete widget.
            var options = {
                componentRestrictions: {
                    country: ['gb']
                },
                // types: ['(regions)']
                types: ['geocode']
            },
                autocomplete,
                autocompleteService,
                placesService;

            ORAC.latField = document.querySelector('#place_lat');
            ORAC.lngField = document.querySelector('#place_lng');
            ORAC.radiusField = document.querySelector('#place_radius');
            ORAC.searchField = document.querySelector('#search_location');

            if (ORAC.searchField) {

                ORAC.searchField.setAttribute('autocomplete', 'off');
                var placesWrapper = document.createElement('div');
                placesWrapper.id = 'search_places';
                ORAC.searchField.parentNode.appendChild(placesWrapper);
                autocompleteService = new google.maps.places.AutocompleteService();
                placesService = new google.maps.places.PlacesService(placesWrapper);
                OFSTED.Autocomplete.placesService = placesService;

                /**
                 * Debounce the change event so we're not firing multiple calls
                 * more than every 250ms
                 *
                 * Also only make a request to the Places API if the search query is
                 * more than 3 characters long.
                 */
                var handleSearchUpdate = OFSTED.Utils.debounce(function (e) {
                    var MINIMUM_SEARCH_LENGTH = 3,
                        target = e.currentTarget,
                        searchLength = ORAC.searchField.value.length;

                    if (searchLength < MINIMUM_SEARCH_LENGTH) {
                        return;
                    }

                    autocompleteService.getPlacePredictions({
                        componentRestrictions: {
                            country: ['gb']
                        },
                        types: ['geocode'],
                        input: ORAC.searchField.value,
                    }, OFSTED.Autocomplete.handleQueryResults);
                }, 250);

                ORAC.searchField.addEventListener('keyup', handleSearchUpdate);

                $(ORAC.searchField).on('change', function () {
                    if (this.value.length < 1) {
                        if (ORAC.latField) {
                            ORAC.latField.value = '';
                        }

                        if (ORAC.lngField) {
                            ORAC.lngField.value = '';
                        }

                        if (ORAC.radiusField) {
                            ORAC.radiusField.value = '';
                        }
                    }
                });

                // TODO: Add keyboard events
                document.body.addEventListener('click', function (e) {
                    if (e.target.className.indexOf('autocomplete-result') !== -1
                        || e.target.className.indexOf('autocomplete__option') !== -1) {
                        var link = e.target,
                            field, value;

                        field = document.querySelector(link.getAttribute('data-href'));
                        value = link.textContent;

                        if (!field) {
                            return;
                        }

                        field.value = value;

                        var list = document.querySelector('.js-autocomplete-results');
                        list.innerHTML = '';
                        list.style.display = 'none';
                        ORAC.updateSearchInformation(field, link.getAttribute('data-place-id'));
                        e.preventDefault();
                    }
                });
            }
        },

        /**
         * Update the hidden search fields to pass through lat / lng etc
         */
        updateSearchInformation: function (field, data) {
            if (!ORAC.placesService) {
                ORAC.placesService = new google.maps.places.PlacesService(document.querySelector('#search_places'));
            }

            ORAC.placesService.getDetails({
                placeId: data,
                fields: ['geometry']
            },
                function (results, status) {
                    if (ORAC.latField) {
                        ORAC.latField.value = '';
                    }
                    if (ORAC.lngField) {
                        ORAC.lngField.value = '';
                    }
                    if (ORAC.radiusField) {
                        ORAC.radiusField.value = '';
                    }

                    // Get the place object from Google.
                    var place = results,
                        lat = (place && place.geometry) ? place.geometry.location.lat() : '',
                        lng = (place && place.geometry) ? place.geometry.location.lng() : '',
                        views = (place && place.geometry) ? place.geometry.viewport : '';
                    if (ORAC.latField) {
                        ORAC.latField.value = lat;
                    }
                    if (ORAC.lngField) {
                        ORAC.lngField.value = lng;
                    }
                    if (ORAC.radiusField) {
                        if (views) {
                            var swDistance = ORAC.calculateLatLongDistance(lat, lng, views.getSouthWest().lat(), views.getSouthWest().lng());
                            var neDistance = ORAC.calculateLatLongDistance(lat, lng, views.getNorthEast().lat(), views.getNorthEast().lng());
                            ORAC.radiusField.value = Math.max(swDistance, neDistance);
                            $(window).trigger('OR.distanceEnable', { enabled: true })
                        } else {

                        }
                    }

                    $(ORAC.searchField).focus();
                });
        },

        /**
         * Process the results that come back from the Places API.
         *
         * @param data List of PlaceResult items.
         */
        handleQueryResults: function (data) {
            var resultsList = document.querySelector('.js-autocomplete-results');
            // searchField = document.querySelector('#search_location');
            if (!resultsList) {
                resultsList = document.createElement('ul');
                resultsList.className = 'js-autocomplete-results';
                resultsList.className += ' autocomplete-results';
                resultsList.className += ' autocomplete__menu autocomplete__menu--inline';
                ORAC.searchField.parentNode.appendChild(resultsList);
            }
            var resultsHTML = '';
            if (!data) {
                return;
            }
            data.forEach(function (result) {
                var resultItem = '<li class="autocomplete__option" data-href="#search_location"';
                resultItem += ' data-place-id="' + result.place_id + '"';
                resultItem += '>';
                resultItem += result.description;
                resultItem += '</li>';

                resultsHTML += resultItem;
            });

            resultsList.innerHTML = resultsHTML;
            resultsList.style.display = 'block';
        },
        calculateLatLongDistance: function (lat1, lon1, lat2, lon2) {
            var dLat = (lat1 - lat2) * (Math.PI / 180);
            var dLon = (lon1 - lon2) * (Math.PI / 180);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat2 * (Math.PI / 180)) * Math.cos(lat1 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
                ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return Math.round(6371 * c * 0.62);
        },

        /**
         * For each autocomplete item on the page, set up a new instance of the GOV.uk Accessible Autocomplete
         * @param ac   {Array}    all the autocomplete items.
         */
        setupAutocomplete: function (autocompletes) {
            autocompletes.forEach(function (ac) {
                var select = ac.querySelector('select');
                var wrapper = $(select).closest('.govuk-option-select');
                var options = wrapper.find('option:not(:disabled)');
                var labelName = $('label[for="' + $(select).attr('id') + '"] > span').text();
                window.OFSTED.autocompleteResults = options.map(function (index, option) {
                    return option.textContent;
                });
                var inputVal = $(select).find(':selected').text();
                var newHTML = '<div data-widget="accessible-autocomplete">\n' +
                    '<label for="search" class="form-label heading--alt"><span>' + labelName + '</span>\n' +
                    '<input type="text" id="search" autocomplete="off" class="form-control autocomplete-search-field autocomplete__input" aria-describedby="initInstr" aria-owns="results" aria-expanded="false" aria-autocomplete="both" aria-activedescendant="" value="' + inputVal + '"> \n' +
                    '</label>\n' +
                    '<ul id="results" class="autocomplete__menu autocomplete__menu--inline autocomplete__menu--hidden" role="listbox" tabindex="0" style="display: none;"></ul>\n' +
                    '<span id="initInstr" style="display: none;">When autocomplete results are available use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures.</span>\n' +
                    '<div aria-live="assertive" class="screen-reader-text"></div>\n' +
                    '</div>';

                $(select).hide().after(newHTML);
                $(select).prev('label').hide();

                $(window).on('OR.updateAutocomplete', function (e, value) {

                    var matches = options.filter(function (i, el) {
                        return $(el).text().toLowerCase() == value.toLowerCase();
                    });

                    if (matches.length) {
                        $(select).val(matches.first().val());
                    }
                });
            });
        }
    };
})(window.OFSTED, window.jQuery);
