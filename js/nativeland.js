    $('.nl-results').hide();
    $('.nl-close-results').click(function() {
      $('.nl-results').hide();
    });
    // Load areas of language and territories onto map
    var languagePolygons = [];
    var territoryPolygons = [];
    var treatyPolygons = [];
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

      map.controls[google.maps.ControlPosition.LEFT_TOP].push(
        document.getElementById('nl-search')
      );
        
        // Encode stuff loaded in JS file above
        var tryThisGeoJSON = new GeoJSON(thisGeoJSON);

        // Stuff for search section
        if(typeof homeTrue !=='undefined') {
          var autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('autocomplete')), {
            types: ['geocode']
          });

            // Do the stuff after they enter a place        
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                console.log(place);
                $.ajax({
                    url: '/writeToFile.php',
                    type: 'POST',
                    dataType: "json",
                    data: {
                        search_address: place.formatted_address,
                    },
                    success: function(data){}
                });
                if (!place.geometry) {
                  return;
                }
                // Making a variety of points all around the central searched point
                var thisLatLng = new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng());
                var thisLatLngEast = new google.maps.LatLng(place.geometry.location.lat() + 0.1,place.geometry.location.lng() + 0.1);
                var thisLatLngWest = new google.maps.LatLng(place.geometry.location.lat() + 0.1,place.geometry.location.lng() - 0.1);
                var thisLatLngNorth = new google.maps.LatLng(place.geometry.location.lat() - 0.1,place.geometry.location.lng() - 0.1);
                var thisLatLngSouth = new google.maps.LatLng(place.geometry.location.lat() - 0.1,place.geometry.location.lng() + 0.1);
                var thisLatLngArray = [thisLatLng,thisLatLngEast,thisLatLngWest,thisLatLngNorth,thisLatLngSouth];
                var myOptions = {
                    center:thisLatLng
                }
                map.setOptions(myOptions);
                var resultsArray = []; // Array with objects having Territory, Language, Link
                var resultsArray2 = [];
                var resultsLanguages = [];
                var resultsTreaties = [];
                var resultsTerritories = [];
                // This results array should change instead to have an object with foundTerritories, foundLanguages, foundTreaties
                // These each get pushed in as they are found, unless they already exist
                // Then displayed as a simple list with commas
                // Language search
                var thisLanguage = '';
                var foundLanguage;
                tryThisGeoJSON.forEach( function(element,array,index) {
                    thisLatLngArray.forEach(function(thisLatLng,array2,index2) {
                        // If language is found
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, element[0])) {
                            thisLanguage = element[0].geojsonProperties.Name;
                            // Store results into array
                            var languageLinks = element[0].geojsonProperties.description.split(",");
                            var formattedLanguageLinks = [];
                            languageLinks.forEach(function(element,index,array) {
                                var thisLink = '<a target="_blank" href="'+element+'">'+(index+1)+'</a>';
                                formattedLanguageLinks.push(thisLink);
                            });
                            var finalLanguageLinks = " <i>("+formattedLanguageLinks.join()+")</i>";
                            var thisLanguageObject = {
                                name    :   thisLanguage,
                                link   :   finalLanguageLinks
                            }
                            if(resultsLanguages.length===0) {
                                resultsLanguages.push(thisLanguageObject);
                            } else {
                                var alreadyExists = false;
                                resultsLanguages.forEach(function(element,index,array) {
                                    if(_.isEqual(element, thisLanguageObject)) {
                                        alreadyExists = true;
                                    }
                                });
                                if(alreadyExists!==true) {
                                    resultsLanguages.push(thisLanguageObject);
                                }
                            }
                        }
                    });
                });
                thisLatLngArray.forEach(function(thisLatLng,array,index) {
                    // Then search for treaties
                    var thisTreaty = '';
                    var thisTreatyLink = '';
                    for(var obj in firstNationsTreaties) {
                        var thisPolygon = new google.maps.Polygon({
                            paths: firstNationsTreaties[obj][1]
                        });
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, thisPolygon)) {
                            thisTreaty = firstNationsTreaties[obj][0];
                            thisTreatyLink = firstNationsTreaties[obj][2];
                            var thisTreatyObject = {
                                name    :   thisTreaty,
                                link    :   thisTreatyLink
                            }
                            if(resultsTreaties.length===0) {
                                resultsTreaties.push(thisTreatyObject);
                            } else {
                                var alreadyExists = false;
                                resultsTreaties.forEach(function(element,index,array) {
                                    if(_.isEqual(element, thisTreatyObject)) {
                                        alreadyExists = true;
                                    }
                                });
                                if(alreadyExists!==true) {
                                    resultsTreaties.push(thisTreatyObject);
                                }
                            }
                        }
                    }
                    // Then search for territories
                    var thisTerritory = '';
                    var thisTerritoryLink = '';
                    for(var obj in firstNationsTerritories) {
                        var thisPolygon = new google.maps.Polygon({
                            paths: firstNationsTerritories[obj][1]
                        });
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, thisPolygon)) {
                            thisTerritory = firstNationsTerritories[obj][0];
                            thisTerritoryLink = firstNationsTerritories[obj][3];
                            var thisTerritoryObject = {
                                name    :   thisTerritory,
                                link    :   thisTerritoryLink
                            }
                            if(resultsTerritories.length===0) {
                                resultsTerritories.push(thisTerritoryObject);
                            } else {
                                var alreadyExists = false;
                                resultsTerritories.forEach(function(element,index,array) {
                                    if(alreadyExists!==true) {
                                        if(_.isEqual(element, thisTerritoryObject)) {
                                            alreadyExists = true; 
                                        }
                                    }
                                });
                                if(alreadyExists!==true) {
                                    resultsTerritories.push(thisTerritoryObject);
                                }
                            }
                        }
                    }
                });
                resultsArray2.push(resultsTerritories);
                resultsArray2.push(resultsLanguages);
                resultsArray2.push(resultsTreaties);
                var htmlToAppend = '';
                resultsArray2.forEach(function(element,index,array) {
                  // Territories
                  if(index===0) {
                      htmlToAppend += '<div class="tresult"><strong>Territories</strong>: ';
                      element.forEach(function(element2,index2,array2) {
                          // Adding or removing comma from end
                          if(index2===(array2.length-1)) {
                               htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>';
                          } else {
                               htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>, ';
                          }
                      });
                      htmlToAppend += '</div>';
                  }
                  // Languages
                  if(index===1) {
                      htmlToAppend += '<div class="lresult"><strong>Languages</strong>: ';
                      element.forEach(function(element2,index2,array2) {
                          // Adding or removing comma from end
                          if(index2===(array2.length-1)) {
                                htmlToAppend += element2.name+element2.link;
                          } else {
                                htmlToAppend += element2.name+element2.link+', ';
                          }
                      });
                      htmlToAppend += '</div>';
                  }
                  // Treaties
                  if(index===2) {
                      // If no treaties
                      if(element.length===0) {
                          htmlToAppend += '<div class="t2result"><strong>Treaties</strong>: ';
                          htmlToAppend += 'No treaties listed. This may be unceded territory, or the area is yet to be mapped.</div>';
                      } else {
                          // If treaties
                          htmlToAppend += '<div class="t2result"><strong>Treaties</strong>: ';
                          element.forEach(function(element2,index2,array2) {
                              // Adding or removing comma from end
                              if(index2===(array2.length-1)) {
                                    htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>';
                              } else {
                                    htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>, ';
                              }
                          });
                      }
                      htmlToAppend += '</div>';
                  }
              });
              $('#results').empty();
              $('#results').append(htmlToAppend);
              $('.nl-results').show();
            });
        }
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
        $('#territories').click(function() {
            if($($(this).parent()).hasClass('is-checked')) {
                territoryPolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            } else {
                territoryPolygons.forEach(function(element,index,array) {
                    element.setMap(map);
                    placeTerritories(element,map);
                });
            }
        });
        $('#languages').click(function() {
            if($($(this).parent()).hasClass('is-checked')) {
                languagePolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            } else {
                languagePolygons.forEach(function(element,index,array) {
                    placeLanguages(element,map);
                });
            }
        });
        $('#treaties').click(function() {
            if($($(this).parent()).hasClass('is-checked')) {
                treatyPolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            } else {
                treatyPolygons.forEach(function(element,index,array) {
                    element.setMap(map);
                    placeTreaties(element,map);
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
            $('#results').html(this.caption+': <a href="'+this.customInfo+'" target="blank">'+this.customInfo+'</a>');
            $('.nl-results').show();
        });
        printNations(element,firstNationsTerritories,territoryPolygons);
    }
        
    // Place language polygons
    function placeLanguages(element,map) {
        element.setMap(map);
        google.maps.event.addListener(element, 'click', function() {
            var languageLinks = '';
            this.customInfo.forEach(function(element,index,array) {
                languageLinks += '<a href='+element+' target="blank">'+element+'</a><br>';
            });
            $('#results').html(this.caption+': '+languageLinks);
            $('.nl-results').show();
        });
        google.maps.event.addListener(element, 'mouseover', function() {
            this.setOptions({strokeOpacity:1});
            this.setOptions({fillOpacity:0.5});
            $('#currentFN').show();
            $('#currentFN').html('<div style="text-align:center;display:inline-block;margin-right:10px;">'+this.caption+'</div>');
        });
        google.maps.event.addListener(element, 'mouseout', function() {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').html('Type your address or city into the search box<br>and select from the menu of addresses that appear.');
        });
    }
    
    // Place treaty polygons
    function placeTreaties(element,map) {
        element.setMap(map);
        google.maps.event.addListener(element, 'click', function() {
            $('#results').html(this.caption+': <a href="'+this.customInfo+'" target="blank">'+this.customInfo+'</a>');
            $('.nl-results').show();
        });
        printNations(element,firstNationsTreaties,treatyPolygons);
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
    
    function printNations(thisPolygon,thisTypeObject,theseTypePolygons) {
        google.maps.event.addListener(thisPolygon, 'mousemove', function(event) {
            this.setOptions({strokeOpacity:1});
            this.setOptions({fillOpacity:0.5});
            var mouseLocation = event.latLng;
            var thisFinding = '';
            var theseFindings = [];
            for(var obj in thisTypeObject) {
                var thisPolygon = new google.maps.Polygon({
                    paths: thisTypeObject[obj][1]
                });
                if (google.maps.geometry.poly.containsLocation(mouseLocation, thisPolygon)) {
                    var color;
                    thisFinding = thisTypeObject[obj][0];
                    theseTypePolygons.forEach(function(element,index,array) {
                        if(element.caption===thisFinding) {
                            color = element.fillColor;
                        }
                    });
                    theseFindings.push('<div style="text-align:center;display:inline-block;margin-right:10px;"><div style="width:10px;height:10px;margin:0 auto;background-color:'+color+';"></div>'+thisFinding+'</div>');
                }
            }
            $('#currentFN').show();
            $('#currentFN').html(theseFindings);
        });
        google.maps.event.addListener(thisPolygon, 'mouseout', function(event) {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').html('Type your address or city into the search box<br>and select from the menu of addresses that appear.');
        });
    }
