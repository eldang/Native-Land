<?php 
header('Content-type:application/json;charset=utf-8');

// API creation
// People should be able to send a URL with a querystring like:

// http://native-land.ca/api?maps=territories,languages,treaties&name=sioux,metis

// It will return coordinates and I will provide a key for all the "names", which can be languages, nations or treaties
// Can return all by default, or it returns specific ones only asked for
    
// TO ADD
// - Can add 'single vs multiple' parameter to allow getting polygons from different maps at once

$mapsRequest = $_GET['maps'];
$nameRequest = $_GET['name'];
$result = [];

if($mapsRequest) {
    $territories = false;
    $languages = false;
    $treaties = false;
    
    $mapsRequestArray = explode(",", $mapsRequest);
    
    foreach ($mapsRequestArray as $key => $value) {
        if($value=='territories') {
            // Get territories
        }
        if($value=='treaties') {
            // Get treaties
        }
        if($value=='languages') {
            // Get languages
            if($nameRequest) {
                $languagesFile = file_get_contents('http://www.native-land.ca/coordinates/indigenousLanguages.json');
                $languagesJSON = json_decode($languagesFile);
                $nameRequestArray = explode(",", $nameRequest);
                foreach ($nameRequestArray as $key2 => $value2) {
                    foreach ($languagesJSON->features as $arr) {
                        foreach ($arr as $obj) {
                            if($obj->Slug==$value2) {
                                array_push($result,$arr);
                            }
                        }
                    }
                }
            } else {
                $languagesFile = file_get_contents('http://www.native-land.ca/coordinates/indigenousLanguages.json');
                $languagesJSON = json_decode($languagesFile);
                $result = $languagesJSON;
            }
        }
    }
}

$resultJSON = json_encode((array)$result);
echo $resultJSON;

/*
    var indigenousLanguagesGeoJSON = indigenousLanguages;
    var indigenousTerritoriesGeoJSON = indigenousTerritories;
    var indigenousTreatiesGeoJSON = indigenousTreaties;
    
    if(query_string.maps) {
        // Create variables and set to false
        var territories = false;
        var languages = false;
        var treaties = false;
        
        // Check which query strings exist
        if(query_string.maps.indexOf('territories') > -1) {
            console.log(indigenousTerritoriesGeoJSON);
            territories = true;
        }
        if(query_string.maps.indexOf('languages') > -1) {
            console.log(indigenousLanguagesGeoJSON);
            languages = true;
        }
        if(query_string.maps.indexOf('treaties') > -1) {
            console.log(indigenousTreatiesGeoJSON);
            treaties = true;
        }
        
        console.log(territories,languages,treaties)
        
        // If they included specific names (this should only be used when one map is given)
        if(query_string.names) {
            var nameArray = query_string.names.split(',');
            nameArray.forEach(function(element,index,array) {
                if(territories) {
                    indigenousTerritoriesGeoJSON.features.forEach(function(element1,index1,array1) {
                        if(element1.properties.Slug===element)  {
                            console.log(element1);
                        }
                    });
                }
                if(languages) {
                    indigenousLanguagesGeoJSON.features.forEach(function(element1,index1,array1) {
                        if(element1.properties.Slug===element)  {
                            console.log(element1);
                        }
                    });
                }
                if(treaties) {
                    indigenousLanguagesGeoJSON.features.forEach(function(element1,index1,array1) {
                        if(element1.properties.Slug===element)  {
                            console.log(element1);
                        }
                    });
                }
            });
        }
*/
?>