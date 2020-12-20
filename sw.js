; (function () {
    "use strict";

    /* Using Service worker and cache to cache static files, mainly images*/

    /*SERVICE WORKER*/
    /// is intended for offline page, css, js files
    const criticalResources = [
        "/Offline.html"/*,
        "/Styles/Style.css",
        "/Scripts/Main.js"*/
    ];


    const version = "1-",
        IMAGES_CACHE_NAME = `${version}images`,
        CRITICAL_RESOURCES_CACHE_NAME = `${version}critical`,
        OTHERS_CACHE_NAME = `${version}others`;
        
        const OFFLINE_PAGE_URL = "/Offline.html";


    /*===========================
        Adding Event Listeners
    =============================*/
    self.addEventListener("install", onInstall);
    self.addEventListener("activate", onActivate);
    self.addEventListener("fetch", onFetch);


    /*===================
        Event Listeners
    =====================*/

    /*
    *  Fired only once in worker’s lifecycle.
    *  It is responsible for installing the service worker
    *  and initially caching the most important pages and assets of a website
    */
    function onInstall(e) {
        // When `waitUntil` runs, if the Promise is resolved, nothing happens. If the Promise is rejected, the state of the installing or active worker is set to redundant.
        e.waitUntil(
            cacheInitialResources().then( 
    // forces the waiting service worker to become the active service worker.
            () => self.skipWaiting()));
    };

    /*
    * Fired only once in a lifecycle after the `install` event.
    * It is used for deleting the old documents and files from the cache
    */
    function onActivate(e) {
        e.waitUntil(  
           clearOldCaches().then(
           /// allows an active Service Worker to set itself as the active worker
                () => self.clients.claim())
        );
    };

    /*
    * Fired every time the request is made.
    * Intercepts request and send it to the server or provided response from the cache
    */
    function onFetch(e) {
        // Do not handle request if it is not GET request
        if(e.request.method !== "GET") { console.log("REQUEST METHOD IS: ", e.request.method); return; }
        // type of the file being requested
        const type = e.request.headers.get("Accept");
        console.log("[ServiceWorker Fetch] requested url " + e.request.url, " | requested type: ", type);
        // network-first for the HTML documents
      if(type.includes("text/html")) {
          e.respondWith(
              fetch(e.request).then(
              function (response) {
                  // we can add cloned copy of response to the cache if we're willing so
                  // e.g. const responseCopy = response.clone(); addToCache(e.request, responseCopy); return response;
                  return response;
              }).catch(function (err) {
                  console.log("[ServiceWorker] error during response [text/html] in network-first: ", err);
                  return caches.match(OFFLINE_PAGE_URL); // offline page is served from the cache
              })
          );  // end respondWith
        /// cache-first for other resources namely images and fonts (for the time being)
      } else {
          e.respondWith(
              caches.match(e.request).then(
              function (response) {
                  return response /// if response is in the cache we return it
                      ||  
                      fetch(e.request).then( // otherwise we send request to the server
                       function (response) {
                           // if response was not successful i.e. status code is not 200
                           // (status in the range 200-299 is considered successful, but with some conditionals)
                           if(response.status !== 200) { return response; } // we do not cache, just return it to the browser
                           // Cloning the response is necessary because request & response streams can only be read once.
                           const responseClone = response.clone();
                           const type = response.headers.get("Content-Type") || "";

                           if(type.startsWith("image/")) { /// cache images
                               addToCache(IMAGES_CACHE_NAME, e.request, responseClone).catch(function (err) {
                                   console.log("[ServiceWorker] error during adding item into `images` cache: ", err);
                               });
                           } else if(criticalResources.includes(e.request.url.pathname)) {
                               addToCache(CRITICAL_RESOURCES_CACHE_NAME, e.request, responseClone).catch(function (err) {
                                   console.log("[ServiceWorker] error during adding item into `critical resources` cache: ", err);
                               });
                           } 
                           // the original response is returned to the browser to be given to the page that called it.
                           return response;
                       }).catch(function (err) {

                           console.log("[ServiceWorker] error during fetch in cache-first: ", err);

                           if(type.startsWith("image/")) { // if error was during request for the image, we return offline image placeholder 
                               return offlineImage();
                           };
                           //// here we can serve an offline.html page if request dosen't reside in the cache & there is network problem
                           // e.g. return caches.match("/Offline.html");
                           return caches.match(OFFLINE_PAGE_URL); // offline page is served from the cache
                       }); 
              }).catch(function (err) {
                  console.log("Error during cache.matches in cache-first: ", err);
             })
          ); // end respondWith
      }
    };
    
    /*=========================
         Utility Functions
    ===========================*/
    /*
    * Caches initial resources like css, js, fonts etc....
    */
    function cacheInitialResources() {
        return getInitialResources(criticalResources, CRITICAL_RESOURCES_CACHE_NAME)
        .catch(function (err) {
            console.log("error during cache initial resources: ", err);
            // The Promise returned by catch() is rejected if onRejected throws an error or returns a Promise which is itself rejected; otherwise, it is resolved.
            return Promise.reject();
        });
    };

    /*
    * Clears old data from cache
    */
    function clearOldCaches() {
        return caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function (currentCacheName) {             
                 /*if it doesn't start with {version} e.g. 1- like in 1-images*/
                 return currentCacheName.startsWith(version) === false;
            }).map(function (oldCacheName) { /// delete old cache items
                return caches.delete(oldCacheName);
            }));
        }).catch(function (err) {
            console.log("error during clears old caches: ", err);
        });

    };


    /*
    * Adds files into cache
    * @param {String} cacheName - Name of the cache to put file into.
    * @param {Request} request - Request being made, use it as the cache key.
    * @param {Response} response - Response from the server to save it into the cache.
    */
    function addToCache(cacheName, request, response) {
        return caches.open(cacheName).then(
            function (cache) {
            return cache.put(request, response);
        });
    };

    // Create a somehow helpful offline image as a fallback (could be anything but SVG is great for this)
    function offlineImage () {
        var offlineSVG = '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="offline-title"'
     + 'preserveAspectRatio="none" viewBox="0 0 400 300">' 
     + '<title id="offline-title">Offline Placeholder</title>'
     + '<path id="rect-offline" fill="rgb(175, 175, 175)" stroke-width="1.5" d="M.5-2h581v400H.5z"/>'
     + '<path stroke="rgb(200, 200, 200)" stroke-width="4" d="M0 0l400 300M0 300L400 0" vector-effect="non-scaling-stroke"/></svg>';
        return new Response(offlineSVG,
          { headers: { 'Content-Type': 'image/svg+xml' } }
        );
    };

    
    /*
    *  Get URL change it in order to send it to the server and not to get it from HTTP Cache
    * @param {String} url - requested URL
    * @return {Request} request object with cache: reload option (if supported) or with attached query string (e.g. url.com?cachebust=34342423)
    */
    function createCacheBustedRequest(url) {
        // Fetch behaves as if there is no HTTP cache on the way to the network.
        // Ergo, it creates a normal request & updates the HTTP cache with the response.
        let request = new Request(url, {cache: 'reload'});
        // See https://fetch.spec.whatwg.org/#concept-request-mode
        // This is not yet supported in Chrome as of M48, so we need to explicitly check to see
        // if the cache: 'reload' option had any effect.
        if ('cache' in request) {
            return request;
        }

        // If {cache: 'reload'} didn't have any effect, append a cache-busting URL parameter instead.
        let bustedUrl = new URL(url, self.location.href);
        bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
        return new Request(bustedUrl);
    };

    /*
    NOTE FOR CreateCacheBustedRequest
    FROM: https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=en#invalidating-and-updating-cached-responses
    -----------------------------------
    All HTTP requests that the browser makes are first routed to the browser cache 
    to check whether there is a valid cached response that can be used to fulfill the request. 
    If there's a match, the response is read from the cache,
    which eliminates both the network latency and the data costs that the transfer incurs.
    */
    
    /*
    * Fetch resources and save them in cache.
    * @param {Array} initResources - URLs of the initial resources to fetch
    * @param {String} cacheName - Name for the cache in which fetched resources should be saved
    * @return {Promise} Array of promises after resources have been cached
    */
    function getInitialResources(initResources, cacheName) {
        return Promise.all(
            initResources.map(function (resourceURL) {
                return fetch(createCacheBustedRequest(resourceURL)).then(function (response) {
                    return addToCache(cacheName, resourceURL, response);
                });
            })
        );
    };


})();