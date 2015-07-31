NATIVE LAND DOT CA

<<<<<<< Updated upstream
A web app with Google Maps API for mapping Indigenous territories, languages, and treaties across Turtle Island (North America).

<h2>Upcoming fixes</h2>
<ul>
<li>Fix language of Squamish to their actual language, not Halqemelem</li>
<li>Fix language boundary of Squamish (http://squamishlanguage.com/about/territory/)</li>
<li>Markham Ontario as huron-wendat</li>
<li>Fisher River Cree nation is Cree, not Ojibway</li>
<li>Fixing Sinixt beyond Greenwood to Kettle Valley</li>
<li>Kaska Dene fixes</li>
<li>The Pas, Manitoba and Cumberland House, Sask -- is Swampy Cree, not Plains Cree</li>
<li>Opaskwayak Cree Nation territory</li>
<li>Fixing Wsanec on Southern Vancouver island</li>
<li>Tsimshian territory fixes</li>
<li>Quebec Cree treaty</li>
<li>Western New Brunswick is Maliseet (Wolastoqiyik )</li>
<li>Cowichan tribes and Hulqiminum treaty group</li>
<li>Drawing broad nation boundaries (“Cree”)</li>
<li>Adding languages with colour-coding, that nice map (http://store.universalworkshop.com/product_p/mapi.htm)</li>
<li>Adding American nations</li>
</ul>

<h2>Design</h2>
<li>Make the layers distinct as groups visually</li>
<li>Adding share buttons, having FB page or Twitter account to shoot out updates?</li>

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
=======
This is a resource mainly aimed at settlers, to help "them" get more familiar with the land they live on.

It's meant to be a little easy and friendly so as to coax them into being a bit more interested - the "nice" ones - and 
trying to effectively lead them down a path to a kind of self-investigation, at the least.

DESIGN
- FRONT PAGE (including MAP)
    - It's a long, big search bar next to a little text excerpt encouraging them
    - It fades out (a little "search again?" button appears), then replaced by a list
        - Territory (table item should link to sources)
        - Language (should link to sources page with language links)
        - Learn more (should link to sources page with band website, etc)
    - MAP
        - Mousing over creates a little popup encouraging them to click for more, then link to band resources/language/etc
    - Little information thing at bottom that it's a private project, not associated with any agency or institution
- SOURCES PAGE
    - This page simply talks about how the site was made, disclaimers, map sources, problematizing things
    - Has a giant list of sources on languages, bands, etc, that can keep growing and getting more
    - If it gets huge, have a side menu like on the framework site
    
CODING
- FRONT PAGE
    - To incorporate sourcing so it happens more or less dynamically, I should put everything into basic objects/arrays
    - territory name / excerpt / associated websites array [{ name, URL }] / coordinates
    - language name / excerpt / associated websites array [{ name, URL }] / coordinates
- SOURCES PAGE
    - Just iterate over the same polygon objects and spit it out into unordered lists, headings, anchor links, etc
>>>>>>> Stashed changes
