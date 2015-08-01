A web app with Google Maps API for mapping Indigenous territories, languages, and treaties across Turtle Island (North America).

<h2>To Do</h2>
<ul>
<li>Immediate fixes</li>
<li>Add legend</li>
<li>Begin work on app version</li>
</ul>

<h2>Upcoming fixes</h2>
<ul>
<li>Tsimshian territory fixes</li>
<li>Quebec Cree treaty</li>
<li>Western New Brunswick is Maliseet (Wolastoqiyik )</li>
<li>Cowichan tribes and Hulqiminum treaty group</li>
<li>Adding languages with colour-coding, that nice map (http://store.universalworkshop.com/product_p/mapi.htm)</li>
<li>Adding American nations</li>
</ul>

<h2>Notes</h2>
<ul>
<li>Different JSONs are kind of a mess, some KML, GeoJSON, etc... gotta clean up</li>
<li>Territories have optional space for specified languages, otherwise it searches by location</li>
</ul>

<h2>Design</h2>
<ul>
<li>Make the layers distinct as groups visually</li>
<li>Adding share buttons, having FB page or Twitter account to shoot out updates?</li>
</ul>

<h2>Technical</h2>
<ul>
<li>Get US-friendly domain name, host on Github</li>
<li>Add legend for map on front page (modal, have explanation more about map colours etc)</li>
<li>Hover-through ability for layers</li>
<li>Adding another variable that shows type of territory (treaty, land claim, traditional, etc), time of language (current day, past, etc)</li>
<li>Standardize the different collections of coordinates into GeoJSONs</li>
</ul>

<h5>Long term ideas and goals</h5>
<ul>
<li>Make app form of the site, for travellers or even alternative to "normal" maps</li>
<li>Add place names in local languages</li>
<li>Use a map that allows redrawing/removal of national boundaries (OpenStreetMap? Others?) </li>
<li>Adding ability to scroll over time</li>
</ul>

<p>This app is simply meant to sit on top of Google maps and provide a map of native land. This is starting in British Columbia, Canada, but if I establish a good framework it should work anywhere.</p>
<p>I got the idea for this app while driving along the Sea-to-Sky highway between Vancouver and Squamish in BC. Many of the road signs had the local language place names for rivers, towns, and more, in brackets underneath the English names. I thought "why isn't the English in brackets...?"</p>
