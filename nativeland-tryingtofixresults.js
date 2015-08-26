    var homeTrue = false;
    if(window.location.href==='http://native-land.net/'||window.location.href==='http://native-land.net/#') {
        homeTrue = true;
    }
        
    var map;
    var MY_MAPTYPE_ID = 'custom_style';
    function initialize() {
      // Removing national labels
      var featureOpts = [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
          },
          {
            featureType: "administrative.country",
            elementType: "geometry.fill",
            stylers: [
                { visibility: "off" }
            ]
          },
             {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [
                { visibility: "off" }
            ]
          }
      ];
      // Map options
      var mapOptions = {
        zoom: 3,
        center: new google.maps.LatLng(55.115371, -100.056882),
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DEFAULT,
          mapTypeIds: [
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.ROADMAP,
            MY_MAPTYPE_ID
          ],
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
        
      map = new google.maps.Map(document.getElementById('map-canvas'),
          mapOptions);
        
      var styledMapOptions = {
        name: 'Remove borders'
      };
      var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
     
      map.mapTypes.set('custom_style', customMapType);
        
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
        document.getElementById('currentFN')
      );
        
        // Encode stuff loaded in JS file above
        var tryThisGeoJSON = new GeoJSON(thisGeoJSON);

        // Stuff for search section
        if(homeTrue) {
          var autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('autocomplete')), {
            types: ['geocode']
          });

            // Do the stuff after they enter a place        
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                  return;
                }
                // Making a variety of points all around the central searched point
                var thisLatLng = new google.maps.LatLng(place.geometry.location.G,place.geometry.location.K);
                var thisLatLngEast = new google.maps.LatLng(place.geometry.location.G + 0.1,place.geometry.location.K + 0.1);
                var thisLatLngWest = new google.maps.LatLng(place.geometry.location.G + 0.1,place.geometry.location.K - 0.1);
                var thisLatLngNorth = new google.maps.LatLng(place.geometry.location.G - 0.1,place.geometry.location.K - 0.1);
                var thisLatLngSouth = new google.maps.LatLng(place.geometry.location.G - 0.1,place.geometry.location.K + 0.1);
                var thisLatLngArray = [thisLatLng,thisLatLngEast,thisLatLngWest,thisLatLngNorth,thisLatLngSouth];
                var myOptions = {
                    center:thisLatLng
                }
                map.setOptions(myOptions);
                var resultsArray = []; // Array with objects having Territory, Language, Link
                // Prep search
                var languageArray = [];
                var foundLanguage;
                var treatyArray = [];
                var foundTreaty;
                var territoryArray = [];
                var foundTerritory;
                // If it's just one point
                // I need to search it, and store the results of ALL which should be stacked differently
                // The point will potentially have different language, treaty, and territory, some with blanks
                // If it's multiple points
                // Then I just do the single point thing multiple times
                // And then compare the array to remove anything that's repeating
                // And then print it out at before from the resultsArray
                // Go through all points of coords
                thisLatLngArray.forEach(function(thisLatLng,array2,index2) {
                    //Object that will store array results from this LatLng
                    var pointLanguageArray = [];
                    var pointTreatyArray = [];
                    var pointTerritoryArray = [];
                    // Check all the areas within the language file
                    tryThisGeoJSON.forEach( function(element,array,index) {
                        // This variable checks if, on a previous iteration, there was a language found, and skips to treaties
                        var didLanguageGetFound;
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, element[0])) {
                            if(didLanguageGetFound===true) { } else {
                                // If a language is found, then...
                                var foundLanguage = true;
                                var thisLanguage = element[0].geojsonProperties.Name;
                                // Store results into array
                                var languageLinks = element[0].geojsonProperties.description.split(",");
                                var formattedLanguageLinks = [];
                                languageLinks.forEach(function(element,index,array) {
                                    var thisLink = ' <a target="_blank" href="'+element+'">'+(index+1)+'</a>';
                                    formattedLanguageLinks.push(thisLink);
                                });
                                var finalLanguageLinks = " <i style='font-size:12px;'>(Language links: "+formattedLanguageLinks.join()+")</i>";
                                pointLanguageArray.push({
                                    languageName : thisLanguage,
                                    languageLinks : finalLanguageLinks
                                });
                            }
                        }
                    });
                    // Then search for treaties
                    for(var obj in firstNationsTreaties) {
                        var thisPolygon = new google.maps.Polygon({
                            paths: firstNationsTreaties[obj][1]
                        });
                        // If a treaty is found, then...
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, thisPolygon)) {
                            foundTreaty = true;
                            var thisTreaty = '';
                            var thisTreatyLink = '';
                            thisTreaty = firstNationsTreaties[obj][0];
                            thisTreatyLink = firstNationsTreaties[obj][2];
                            pointTreatyArray.push({
                                treatyName : thisTreaty,
                                treatyLinks : thisTreatyLink
                            });
                        }
                    }
                    // Then search for territories
                    for(var obj in firstNationsTerritories) {
                        var thisPolygon = new google.maps.Polygon({
                            paths: firstNationsTerritories[obj][1]
                        });
                        // If a territory is found, then...
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, thisPolygon)) {
                            var thisTerritory = '';
                            var thisTerritoryLink = '';
                            var finalLanguageLinks = '';
                            var thisLanguage = '';
                            foundTerritory = true;
                            thisTerritory = firstNationsTerritories[obj][0];
                            thisTerritoryLink = firstNationsTerritories[obj][3];
                            if(firstNationsTerritories[obj][4]) {
                                thisLanguage = firstNationsTerritories[obj][4];
                                // Store language link results into array
                                // Check if this nation has a specific language ascribed to it
                                var languageLinks = firstNationsTerritories[obj][5].split(",");
                                var formattedLanguageLinks = [];
                                languageLinks.forEach(function(element,index,array) {
                                    var thisLink = ' <a target="_blank" href="'+element+'">'+(index+1)+'</a>';
                                    formattedLanguageLinks.push(thisLink);
                                });
                                finalLanguageLinks = " <i style='font-size:12px;'>(Language links: "+formattedLanguageLinks.join()+")</i>";
                            }
                            pointTerritoryArray.push({
                                territoryName : thisTerritory,
                                territoryLink : thisTerritoryLink,
                                languageName : thisLanguage,
                                languageLinks : finalLanguageLinks,
                            });
                        }
                    }
                    var thisPoint = [pointLanguageArray,pointTreatyArray,pointTerritoryArray];
                    resultsArray.push(thisPoint);
                });
                console.log(resultsArray);
                var finalResultsArray = [];
                // The Array has 5 points, each with an array containing languages, treaties, and territories
                // So you run through the 5 results, creating arrays to hold FINAL results
                // Same level results should be stored as one array (split up into lines of results)
                // First array simply stored to be checked against
                // Rest of arrays, do the same and make the array line, then check it, if it's different add it
                resultsArray.forEach(function(element,index,array) {
                    // Here it is running over each POINT
                    element.forEach(function(element3,index3,array3) {
                        // In here, it's running over the objects
                        // Check length of each and select the largest one
                        var largestIndex = Math.max(array3[0].length,array3[1].length,array3[2].length);
                        for(var i=0;i<largestIndex;i++) {
                            // Create this line with languages, treaties, and territories in an array
                            var thisLine = [array3[0][i],array3[1][i],array3[2][i]];
                            if($.inArray(thisLine, finalResultsArray)) {
                                finalResultsArray.push(thisLine);
                            }
                        }
                    });
                });
                console.log(finalResultsArray);
                
                // Then go through print out process
                if(resultsArray.length > 0){    
                    var isItTrue = false;
                    resultsArray.forEach(function(element3,array3,index3) {
                        if (element3.territory===thisTerritory) {
                            isItTrue = true;
                        }
                    });
                    if(isItTrue==false) {
                        resultsArray.push({
                            territory    :   thisTerritory,
                            language     :   thisLanguage,
                            treaty       :   thisTreaty,
                            languageLink :   finalLanguageLinks,
                            territoryLink:   thisTerritoryLink,
                            treatyLink   :   thisTreatyLink
                        });
                    }
                } else {
                    // If array is empty
                    resultsArray.push({
                        territory    :   thisTerritory,
                        language     :   thisLanguage,
                        treaty       :   thisTreaty,
                        languageLink :   finalLanguageLinks,
                        territoryLink:   thisTerritoryLink,
                        treatyLink   :   thisTreatyLink
                    });
                }
                if(foundTerritory!==true) {
                    if(foundTreaty!==true) {
                        if(resultsArray.length > 0){   
                            var isItTrue = false;
                            resultsArray.forEach(function(element,array,index) {
                                if(element.language===thisLanguage) {
                                    isItTrue = true;
                                }
                            });
                            if(isItTrue==false) {
                                resultsArray.push({
                                    territory    :   'None entered yet',
                                    language     :   thisLanguage,
                                    treaty       :   'No treaty',
                                    languageLink :   finalLanguageLinks,
                                    territoryLink:   'none',
                                    treatyLink   :   ''
                                });
                            }
                        } else {
                            resultsArray.push({
                                territory    :   'None entered yet',
                                language     :   thisLanguage,
                                treaty       :   'No treaty',
                                languageLink :   finalLanguageLinks,
                                territoryLink:   'none',
                                treatyLink   :   ''
                            });
                        }
                    } else {
                        if(resultsArray.length > 0){   
                            var isItTrue = false;
                            resultsArray.forEach(function(element,array,index) {
                                if(element.treaty===thisTreaty) {
                                    isItTrue = true;
                                }
                            });
                            if(isItTrue==false) {
                                resultsArray.push({
                                    territory    :   'None entered yet',
                                    language     :   thisLanguage,
                                    treaty       :   thisTreaty,
                                    languageLink :   finalLanguageLinks,
                                    territoryLink:   'none',
                                    treatyLink   :   thisTreatyLink
                                });
                            }
                        } else {
                            resultsArray.push({
                                territory    :   'None entered yet',
                                language     :   thisLanguage,
                                treaty       :   thisTreaty,
                                languageLink :   finalLanguageLinks,
                                territoryLink:   'none',
                                treatyLink   :   thisTreatyLink
                            });
                        }
                    }
                }
                console.log(resultsArray);
              $('.results .table').empty();
                // Can add color into results here
              $('.results .table').append('<tr><td><strong>Territory</strong></td><td><strong>Treaty</strong></td><td><strong>Language</strong><span id="clearresults" style="float:right;"><a href="#">Clear results</a></span></td></tr>');
              resultsArray.forEach(function(element,index,array) {
                    $('.results .table').append('<tr><td><a target="_blank" href="'+element.territoryLink+'">'+element.territory+'</a></td>'+
                                                '<td><a target="_blank" href="'+element.treatyLink+'">'+
                                                element.treaty+'</td>'+
                                                '<td>'+element.language+
                                                element.languageLink+'</td></tr>');
              });
              $('.results').show();
              $('.searchbar').hide();
              $('#clearresults').click(function() {
                  $('.results').hide();
              });
            });
        }
        
        // Load areas of language and territories onto map
        var languagePolygons = [];
        var territoryPolygons = [];
        var treatyPolygons = [];
        tryThisGeoJSON.forEach(function(element,array,index) {
            var color = getRandomColor();
            var thisPolygon = element[0];
                thisPolygon.setOptions({strokeWeight:0.1});
                thisPolygon.setOptions({fillColor:color});
                thisPolygon.caption = element[0].geojsonProperties.Name;
                thisPolygon.customInfo = element[0].geojsonProperties.description.split(",");
            languagePolygons.push(thisPolygon);
            // placeLanguages(thisPolygon,map);
        });
      // Define a symbol using SVG path notation, with an opacity of 1.
      var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 0.3,
        scale: 1
      };
        for(var obj in firstNationsTerritories) {
            var color = getRandomColor();
            var thisPolygon = new google.maps.Polygon({
                path: firstNationsTerritories[obj][1],
                strokeOpacity: 1,
                strokeWeight: 0.1,
                fillColor: color,
                fillOpacity: 0.35,
                caption: firstNationsTerritories[obj][0],
                customInfo : firstNationsTerritories[obj][3]
            });
            territoryPolygons.push(thisPolygon);
            // placeTerritories(thisPolygon,map);
        }
        for(var obj in firstNationsTreaties) {
            var color = getRandomColor();
            var thisPolygon = new google.maps.Polygon({
                paths: firstNationsTreaties[obj][1],
                strokeOpacity: 1,
                strokeWeight: 0.1,
                fillColor: color,
                fillOpacity: 0.35,
                caption: firstNationsTreaties[obj][0],
                customInfo : firstNationsTreaties[obj][2]
            });
            treatyPolygons.push(thisPolygon);
            // placeTreaties(thisPolygon,map);
        }
        // Create checkboxes for turning off and on polygons
        $('input[name="languages"]').bootstrapSwitch();
        $('input[name="territories"]').bootstrapSwitch();
        $('input[name="treaties"]').bootstrapSwitch();
        
        $('input[name="languages"]').on('switchChange.bootstrapSwitch', function(event, state) {
            if(state==true) {
                languagePolygons.forEach(function(element,index,array) {
                    placeLanguages(element,map);
                });
            } else {
                languagePolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            }
        });
        $('input[name="territories"]').on('switchChange.bootstrapSwitch', function(event, state) {
            if(state==true) {
                territoryPolygons.forEach(function(element,index,array) {
                    element.setMap(map);
                    placeTerritories(element,map);
                });
            } else {
                territoryPolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            }
        });
        $('input[name="treaties"]').on('switchChange.bootstrapSwitch', function(event, state) {
            if(state==true) {
                treatyPolygons.forEach(function(element,index,array) {
                    element.setMap(map);
                    placeTreaties(element,map);
                });
            } else {
                treatyPolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            }
        });
    }

    google.maps.event.addDomListener(window, 'load', initialize);

// FUNCTIONS
    // Get random color
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
        
    // Place territory polygons
    function placeTerritories(element,map) {
        element.setMap(map);
        google.maps.event.addListener(element, 'click', function() {
            $('#moreCurrentInformation').html('<hr><h4>'+this.caption+'</h2><p><a href="'+this.customInfo+'" target="blank">'+this.customInfo+'</a></p>');
        });
        google.maps.event.addListener(element, 'mouseover', function() {
            this.setOptions({fillOpacity:0.5});
            $('#currentFN').show();
            $('#currentFN').html(this.caption);
            var textWidth = $('#currentFN').width();
            $('#currentFN').css('margin-left',-textWidth/2);
        });
        google.maps.event.addListener(element, 'mouseout', function() {
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').hide();
        });
    }
        
    // Place language polygons
    function placeLanguages(element,map) {
        element.setMap(map);
        google.maps.event.addListener(element, 'click', function() {
            var languageLinks = '';
            this.customInfo.forEach(function(element,index,array) {
                languageLinks += '<a href='+element+' target="blank">'+element+'</a><br>';
            });
            $('#moreCurrentInformation').html('<hr><h4>'+this.caption+'</h2><p>'+languageLinks+'</p>');
        });
        google.maps.event.addListener(element, 'mouseover', function() {
            this.setOptions({strokeOpacity:1});
            this.setOptions({fillOpacity:0.5});
            $('#currentFN').show();
            $('#currentFN').html(this.caption);
            var textWidth = $('#currentFN').width();
            $('#currentFN').css('margin-left',-textWidth/2);
        });
        google.maps.event.addListener(element, 'mouseout', function() {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').hide();
        });
    }
    
    // Place treaty polygons
    function placeTreaties(element,map) {
        element.setMap(map);
        google.maps.event.addListener(element, 'click', function() {
            $('#moreCurrentInformation').html('<hr><h4>'+this.caption+'</h2><p><a href="'+this.customInfo+'" target="blank">'+this.customInfo+'</a></p>');
        });
        google.maps.event.addListener(element, 'mouseover', function() {
            this.setOptions({strokeOpacity:1});
            this.setOptions({fillOpacity:0.5});
            $('#currentFN').show();
            $('#currentFN').html(this.caption);
            var textWidth = $('#currentFN').width();
            $('#currentFN').css('margin-left',-textWidth/2);
        });
        google.maps.event.addListener(element, 'mouseout', function() {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').hide();
        });
    }
    function ColorLuminance(hex, lum) {
      // validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, '');
      if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      lum = lum || 0;

      // convert to decimal and change luminosity
      var rgb = "#", c, i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
      }

      return rgb;
    }
