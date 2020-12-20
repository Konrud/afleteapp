; (function () {
    "use strict";

    const html = document.documentElement;

    if (html) {
        html.classList.add("u-has-js");
    }


    /*INTERSECTION OBESERVER*/
    function setIntersectionObserver() {

        const isIntersectionObserverSupported = "IntersectionObserver" in window;

        if (isIntersectionObserverSupported === false) {
            console.log("Intersection Observer is not supported");
            return false;
        }

        const sectionsToAnimate = Array.from(document.querySelectorAll('[data-animated="true"]'));

        const observerOptions = {
            threshold: 0.75 // when visibility passes the N% mark, i.e. when observer element is visible within its parent on N% at least.
        };
        
        /// Initialize Observer object
        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        sectionsToAnimate.forEach(function (section) {
            /// Start observing
            observer.observe(section);
        });
    };

    /*===============================
       IntersectionObserver Handler
      ===============================*/
    function handleIntersection(entries, observerObj) {

        entries.forEach(function (entry, i, arr) {

            if (!entry.isIntersecting) return; /// the target is no longer as visible as the given threshold      
            
            const section = entry.target; /// the real HTML Element

            section.classList.add("is-animated");

            /// we can instruct Intersetion observer to stop observing particular section that has been already downloaded.
            observerObj.unobserve(section); /// instructs the IntersectionObserver to stop observing the specified target element
        });

    };

    setIntersectionObserver();
    /*END INTERSECTION OBSERVER*/


    /**Scroll Element onScroll event**/
    window.addEventListener("scroll", throttle(onScroll), false);


     /*===============================
              Scroll Handler
      ===============================*/
    function onScroll(e) {
        document.body.style.setProperty("--scroll", window.pageYOffset / (document.body.offsetHeight));
    }
    /**Scroll Element onScroll event**/


    /**UTILITY FUNCTIONS**/
    /*====================================
     Throttle using requestAnimationFrame
    ======================================*/
    /**
    * Generates an event handler wrapper
    * that throttles it
    * @param {Function} action - Function to be called
    * @return {Function} - Function that wraps provided @action for throttling
    */
    function throttle(action) {
        var isActive = false;
        return function (e) {
            if (isActive) return;
            isActive = true;
            requestAnimationFrame(function () {
                action(e);
                isActive = false;
            });
        };
    };

    /*END UTILITY FUNCTIONS*/


    /**SERVICE WORKER**/
    window.addEventListener("load", documentOnDomContentLoaded);

    /*Event Listeners*/
    function documentOnDomContentLoaded(e) {
        if ("serviceWorker" in navigator) { // register service worker after the content has been loaded.
            /// service worker file resides in root directory
            navigator.serviceWorker.register("/sw.js", { scope: "/" })
                .then(function (reg) {
                    /// When the Service Worker is successfully registered
                    console.log("service worker registered. ", reg.scope);
                }).catch(function (err) {
                    console.log("error during service worker registration: ", err);
                });
        }
    };
    /**END SERVICE WORKER**/


})();