    // Load areas of language and territories onto map
    var languagePolygons = [];
    var territoryPolygons = [];
    var treatyPolygons = [];
    var map;
    var MY_MAPTYPE_ID = 'custom_style';
    function initialize() {
        console.log('what');
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
                console.log(place);
                var thisLatLng = new google.maps.LatLng(place.geometry.location.lng(),place.geometry.location.lat());
                var thisLatLngEast = new google.maps.LatLng(place.geometry.location.lng() + 0.1,place.geometry.location.lat() + 0.1);
                var thisLatLngWest = new google.maps.LatLng(place.geometry.location.lng() + 0.1,place.geometry.location.lat() - 0.1);
                var thisLatLngNorth = new google.maps.LatLng(place.geometry.location.lng() - 0.1,place.geometry.location.lat() - 0.1);
                var thisLatLngSouth = new google.maps.LatLng(place.geometry.location.lng() - 0.1,place.geometry.location.lat() + 0.1);
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
                var htmlToAppend = '<div class="pull-right" style="color:#ccc;"><a href="mailto:tempranova@gmail.com">Email Corrections</a></div>';
                htmlToAppend += '<p style="color:#ccc;"><small>Results for '+place.formatted_address+'</small></p>';
                resultsArray2.forEach(function(element,index,array) {
                  // Territories
                  if(index===0) {
                      htmlToAppend += '<h5>Nations</h5><p><small>This also may include treaty assocations and others.</small></p>';
                      element.forEach(function(element2,index2,array2) {
                          // Adding or removing comma from end
                          if(index2===(array2.length-1)) {
                               htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>';
                          } else {
                               htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>, ';
                          }
                      });
                  }
                  // Languages
                  if(index===1) {
                      htmlToAppend += '<h5>Languages</h5>';
                      element.forEach(function(element2,index2,array2) {
                          // Adding or removing comma from end
                          if(index2===(array2.length-1)) {
                                htmlToAppend += element2.name+element2.link;
                          } else {
                                htmlToAppend += element2.name+element2.link+', ';
                          }
                      });
                  }
                  // Treaties
                  if(index===2) {
                      // If no treaties
                      if(element.length===0) {
                          htmlToAppend += '<h5>Treaties</h5>';
                          htmlToAppend += '<p><small>No treaties listed. This may be unceded territory, or the area is yet to be mapped.</small></p>';
                      } else {
                          // If treaties
                          htmlToAppend += '<h5>Treaties</h5>';
                          element.forEach(function(element2,index2,array2) {
                              // Adding or removing comma from end
                              if(index2===(array2.length-1)) {
                                    htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>';
                              } else {
                                    htmlToAppend += '<a href="'+element2.link+'" target="_new">'+element2.name+'</a>, ';
                              }
                          });
                      }
                  }
              });
              $('.results').empty();
              $('.results').append(htmlToAppend);
              $('.results').show();
              $('.searchbar').hide();
              $('#clearresults').click(function() {
                  $('.results').hide();
              });
              $(function () {
                  $('[data-toggle="tooltip"]').tooltip()
              })
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
    
    function printNations(thisPolygon) {
        google.maps.event.addListener(thisPolygon, 'mousemove', function(event) {
            this.setOptions({strokeOpacity:1});
            this.setOptions({fillOpacity:0.5});
            var mouseLocation = event.latLng;
            var thisTerritory = '';
            var theseTerritories = [];
            var foundTerritory;
            for(var obj in firstNationsTerritories) {
                var thisPolygon = new google.maps.Polygon({
                    paths: firstNationsTerritories[obj][1]
                });
                if (google.maps.geometry.poly.containsLocation(mouseLocation, thisPolygon)) {
                    var color;
                    thisTerritory = firstNationsTerritories[obj][0];
                    territoryPolygons.forEach(function(element,index,array) {
                        if(element.caption===thisTerritory) {
                            color = element.fillColor;
                        }
                    });
                    theseTerritories.push('<div style="width:10px;height:10px;float:left;margin-right:5px;background-color:'+color+';"></div>'+thisTerritory+'<br>');
                }
            }
            $('#currentFN').show();
            $('#currentFN').html(theseTerritories);
        });
        google.maps.event.addListener(thisPolygon, 'mouseout', function(event) {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').hide();
        });
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
                    theseFindings.push('<div style="width:10px;height:10px;float:left;margin-right:5px;background-color:'+color+';"></div>'+thisFinding+'<br>');
                }
            }
            $('#currentFN').show();
            $('#currentFN').html(theseFindings);
        });
        google.maps.event.addListener(thisPolygon, 'mouseout', function(event) {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').hide();
        });
    }
