    $('.nl-results').hide();
    $('.nl-close-results').click(function() {
      $('.nl-results').hide();
    });
    // Create bounds from polygon
    google.maps.Polygon.prototype.getBounds = function() {
        var bounds = new google.maps.LatLngBounds();
        var paths = this.getPaths();
        var path;        
        for (var i = 0; i < paths.getLength(); i++) {
            path = paths.getAt(i);
            for (var ii = 0; ii < path.getLength(); ii++) {
                bounds.extend(path.getAt(ii));
            }
        }
        return bounds;
    }
    // Load areas of language and territories onto map
    var languagePolygons = [];
    var treatyPolygons = [];
    var territoryPolygons = [];
    var polygonArray = [languagePolygons,territoryPolygons,treatyPolygons];

    // Encode stuff loaded in coordinates files
    var indigenousLanguagesGeoJSON, indigenousTerritoriesGeoJSON, indigenousTreatiesGeoJSON;
    $.getJSON("/coordinates/indigenousLanguages.json", function(data){
        var indigenousLanguages = data;
        indigenousLanguagesGeoJSON = new GeoJSON(indigenousLanguages);
        $.getJSON("/coordinates/indigenousTerritories.json", function(data){
            var indigenousTerritories = data;
            indigenousTerritoriesGeoJSON = new GeoJSON(indigenousTerritories);
            $.getJSON("/coordinates/indigenousTreaties.json", function(data){
                var indigenousTreaties = data;
                indigenousTreatiesGeoJSON = new GeoJSON(indigenousTreaties);
                initialize();
            });
        });
    });


    var map;
    var MY_MAPTYPE_ID = 'custom_style';
    function initialize() {
      var indigenousMapArray = [indigenousLanguagesGeoJSON,indigenousTerritoriesGeoJSON,indigenousTreatiesGeoJSON];
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

      map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
        document.getElementById('legend')
      );
        

        // Stuff for search section
        if(typeof homeTrue !=='undefined') {
          var autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('autocomplete')), {
            types: ['geocode']
          });

            // Do the stuff after they enter a place        
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
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
                    center:thisLatLng,
                    zoom:9
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
                indigenousLanguagesGeoJSON.forEach( function(element,array,index) {
                    thisLatLngArray.forEach(function(thisLatLng,array2,index2) {
                        // If language is found
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, element[0])) {
                            thisLanguage = element[0].geojsonProperties.Name;
                            // Store results into array
                            var languageLinks = element[0].geojsonProperties.description.split(",");
                            var formattedLanguageLinks = [];
                            languageLinks.forEach(function(element,index,array) {
                                var thisLink = ' <a target="_blank" href="'+element+'">'+(index+1)+'</a>';
                                formattedLanguageLinks.push(thisLink);
                            });
                            var finalLanguageLinks = " <i>(Links:"+formattedLanguageLinks.join()+")</i>";
                            var thisLanguageObject = {
                                name    :   thisLanguage,
                                link   :   finalLanguageLinks
                            }
                            if(resultsLanguages.length===0) {
                                resultsLanguages.push(thisLanguageObject);
                            } else {
                                var alreadyExists = false;
                                resultsLanguages.forEach(function(element3,index3,array3) {
                                    if(_.isEqual(element3, thisLanguageObject)) {
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
                // Treaty search
                var thisTreaty = '';
                var foundTreaty;
                indigenousTreatiesGeoJSON.forEach(function(element,array,index) {
                    thisLatLngArray.forEach(function(thisLatLng,array2,index2) {
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, element[0])) {
                            thisTreaty = element[0].geojsonProperties.Name;
                            var thisTreatyLink = element[0].geojsonProperties.description;
                            var thisTreatyObject = {
                                name    :   thisTreaty,
                                link    :   thisTreatyLink
                            }
                            if(resultsTreaties.length===0) {
                                resultsTreaties.push(thisTreatyObject);
                            } else {
                                var alreadyExists = false;
                                resultsTreaties.forEach(function(element3,index3,array3) {
                                    if(_.isEqual(element3, thisTreatyObject)) {
                                        alreadyExists = true;
                                    }
                                });
                                if(alreadyExists!==true) {
                                    resultsTreaties.push(thisTreatyObject);
                                }
                            }
                        }
                    });
                });
                var thisTerritory = '';
                indigenousTerritoriesGeoJSON.forEach(function(element,array,index) {
                    thisLatLngArray.forEach(function(thisLatLng,array2,index2) {
                        if (google.maps.geometry.poly.containsLocation(thisLatLng, element[0])) {
                            thisTerritory = element[0].geojsonProperties.Name;
                            var thisTerritoryLink = element[0].geojsonProperties.description;
                            var thisTerritoryObject = {
                                name    :   thisTerritory,
                                link    :   thisTerritoryLink
                            }
                            if(resultsTerritories.length===0) {
                                resultsTerritories.push(thisTerritoryObject);
                            } else {
                                var alreadyExists = false;
                                resultsTerritories.forEach(function(element3,index3,array3) {
                                    if(_.isEqual(element3, thisTerritoryObject)) {
                                        alreadyExists = true;
                                    }
                                });
                                if(alreadyExists!==true) {
                                    resultsTerritories.push(thisTerritoryObject);
                                }
                            }
                        }
                    });
                });
                resultsArray2.push(resultsTerritories);
                resultsArray2.push(resultsLanguages);
                resultsArray2.push(resultsTreaties);
                var htmlToAppend = '';
                resultsArray2.forEach(function(element,index,array) {
                  // Territories
                  if(index===0) {
                      htmlToAppend += '<div class="tresult"><span class="lead"><strong>Territories</strong></span>: ';
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
                      htmlToAppend += '<div class="lresult"><span class="lead"><strong>Languages</strong></span>: ';
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
                          htmlToAppend += '<div class="t2result"><span class="lead"><strong>Treaties</strong></span>: ';
                          htmlToAppend += 'No treaties listed. This may be unceded territory, or the area is yet to be mapped.</div>';
                      } else {
                          // If treaties
                          htmlToAppend += '<div class="t2result"><span class="lead"><strong>Treaties</strong></span>: ';
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
        indigenousMapArray.forEach(function(element,index,array) {
            element.forEach(function(element2,index2,array2) {
                var color = getRandomColor();
                var thisPolygon = element2[0];
                    thisPolygon.setOptions({strokeWeight:0.1});
                    thisPolygon.setOptions({fillColor:color});
                    thisPolygon.caption = element2[0].geojsonProperties.Name;
                    if(element2[0].geojsonProperties.description) {
                        thisPolygon.customInfo = element2[0].geojsonProperties.description.split(",");
                    }
                polygonArray[index].push(thisPolygon);
            });
        });
      // Define a symbol using SVG path notation, with an opacity of 1.
      var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 0.3,
        scale: 1
      };
        // Create checkboxes for turning off and on polygons
        $('#territories').on('switchChange.bootstrapSwitch', function(event, state) {
            if(!state) {
                territoryPolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            } else {
                territoryPolygons.forEach(function(element,index,array) {
                    placePolygons(element,map,'territories');
                });
            }
        });
        $('#languages').on('switchChange.bootstrapSwitch', function(event, state) {
            if(!state) {
                languagePolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            } else {
                languagePolygons.forEach(function(element,index,array) {
                    placePolygons(element,map,'languages');
                });
            }
        });
        $('#treaties').on('switchChange.bootstrapSwitch', function(event, state) {
            if(!state) {
                treatyPolygons.forEach(function(element,index,array) {
                    element.setMap(null);
                });
            } else {
                treatyPolygons.forEach(function(element,index,array) {
                    placePolygons(element,map,'treaties');
                });
            }
        });
        
        // Set up selected menus to load appropriate polygon
        for(i=0;i<indigenousMapArray.length;i++) {
            for(k=0;k<indigenousMapArray[i].length;k++) {
                if(i===0) {
                    $('#languageSelect').append('<option value="'+k+'">'+indigenousMapArray[i][k][0].geojsonProperties.Name+'</option>');
                } else if(i===1) {
                    $('#territorySelect').append('<option value="'+k+'">'+indigenousMapArray[i][k][0].geojsonProperties.Name+'</option>');
                } else if(i===2) {
                    $('#treatySelect').append('<option value="'+k+'">'+indigenousMapArray[i][k][0].geojsonProperties.Name+'</option>');
                }
            }
        }
        // Alphabetize
        $("#languageSelect").append($("#languageSelect option").remove().sort(function(a, b) {
            var at = $(a).text(), bt = $(b).text();
            return (at > bt)?1:((at < bt)?-1:0);
        }));
        $("#territorySelect").append($("#territorySelect option").remove().sort(function(a, b) {
            var at = $(a).text(), bt = $(b).text();
            return (at > bt)?1:((at < bt)?-1:0);
        }));
        $("#treatySelect").append($("#treatySelect option").remove().sort(function(a, b) {
            var at = $(a).text(), bt = $(b).text();
            return (at > bt)?1:((at < bt)?-1:0);
        }));
        $('#languageSelect').prepend('<option value="">Select a language</option>');
        $('#territorySelect').prepend('<option value="">Select a territory</option>');
        $('#treatySelect').prepend('<option value="">Select a treaty</option>');
        // Individual selection
        $("#languageSelect").on('change', function() {
            var thisIndex = $( "#languageSelect option:selected" ).val();
            if(thisIndex!=='') {
                placePolygons(languagePolygons[thisIndex],map);
                map.fitBounds(languagePolygons[thisIndex].getBounds());
            }
        });
        $("#territorySelect").on('change', function() {
            var thisIndex = $( "#territorySelect option:selected" ).val();
            if(thisIndex!=='') {
                placePolygons(territoryPolygons[thisIndex],map);
                map.fitBounds(territoryPolygons[thisIndex].getBounds());
            }
        });
        $("#treatySelect").on('change', function() {
            var thisIndex = $( "#treatySelect option:selected" ).val();
            if(thisIndex!=='') {
                placePolygons(treatyPolygons[thisIndex],map);
                map.fitBounds(treatyPolygons[thisIndex].getBounds());
            }
        });
        
        // Clear map polygons
        $('#reset_map').click(function() {
            for(i=0;i<polygonArray.length;i++) {
                for(k=0;k<polygonArray[i].length;k++) {
                    map.setCenter({lat:55.115371, lng: -100.056882});
                    map.setZoom(3);
                    polygonArray[i][k].setMap(null);
                }
            }
        });
        
        // Send out PDF
    }

//    google.maps.event.addDomListener(window, 'load', initialize);

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
        
    // Place all polygons
    function placePolygons(element,map,type) {
        element.setMap(map);
        google.maps.event.addListener(element, 'click', function() {
            var theseLinks = '';
            if(this.customInfo&&typeof this.customInfo!=='string') {
                this.customInfo.forEach(function(element,index,array) {
                    theseLinks += '<a href='+element+' target="blank">'+element+'</a><br>';
                });
            } else if(this.customInfo&&typeof this.customInfo==='string') {
                theseLinks = '<a href='+element+' target="blank">'+element+'</a><br>';
            } else {
                theseLinks = "No resources added.";
            }
            $('#results').html(this.caption+': '+theseLinks);
            $('.nl-results').show();
        });
        var jsonToCheck = '';
        if(type==='languages') { jsonToCheck = indigenousLanguagesGeoJSON;
        } else if(type==='territories') { jsonToCheck = indigenousTerritoriesGeoJSON;
        } else if(type==='treaties') { jsonToCheck = indigenousTreatiesGeoJSON;
        }
        google.maps.event.addListener(element, 'mousemove', function(event) {
            var mouseLocation = event.latLng;
            var theseFindings = [];
            // If it's an individual polygon, just get the name directory
            if(jsonToCheck) {
                jsonToCheck.forEach(function(element,array,index) {
                    if (google.maps.geometry.poly.containsLocation(mouseLocation, element[0])) {
                        var thisFinding = element[0].geojsonProperties.Name;
                        var color = element[0].fillColor;
                        theseFindings.push('<div style="text-align:center;display:inline-block;margin-right:10px;"><div style="width:10px;height:10px;margin:0 auto;background-color:'+color+';"></div>'+thisFinding+'</div>');
                    }
                });
            } else {
                if (google.maps.geometry.poly.containsLocation(mouseLocation, element)) {
                    var thisFinding = element.geojsonProperties.Name;
                    var color = element.fillColor;
                    theseFindings.push('<div style="text-align:center;display:inline-block;margin-right:10px;"><div style="width:10px;height:10px;margin:0 auto;background-color:'+color+';"></div>'+thisFinding+'</div>');
                }
            }
            $('#currentFN').show();
            $('#currentFN').html(theseFindings);
        });
        google.maps.event.addListener(element, 'mouseout', function() {
            this.setOptions({strokeOpacity:0.8});
            this.setOptions({fillOpacity:0.35});
            $('#currentFN').html('Load polygons and mouse over them or click to see more.');
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
    function sortUnorderedList(ul, sortDescending) {
      if(typeof ul == "string")
        ul = document.getElementById(ul);

      // Idiot-proof, remove if you want
      if(!ul) {
        alert("The UL object is null!");
        return;
      }

      // Get the list items and setup an array for sorting
      var lis = ul.getElementsByTagName("LI");
      var vals = [];

      // Populate the array
      for(var i = 0, l = lis.length; i < l; i++)
        vals.push(lis[i].innerHTML);

      // Sort it
      vals.sort();

      // Sometimes you gotta DESC
      if(sortDescending)
        vals.reverse();

      // Change the list on the page
      for(var i = 0, l = lis.length; i < l; i++)
        lis[i].innerHTML = vals[i];
    }