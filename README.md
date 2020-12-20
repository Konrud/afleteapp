# afleteapp
AFLETE APP Project

For this project I’ve decided to challenge myself and go “vanilla” way. That is, I’ve decided to use only HTML, CSS and JS without any Framework or NPM packages. As we implement landing page, it should be as light as possible in order to be loaded fast.

## HTML
I used hand written HTML without any framework. I’ve tried to make it accessible even for users who use “web readers”.
I set all <img> tags with the “aria-hidden” attribute as they are solely for the UI purposes and don’t carry any valuable information for the “screen readers”. On each image (except the one in the “jumbo” section) I used new attribute “loading=lazy” which tells to browser to load images in the lazy manner. In the <head> HTMLElement I used <link preload> in order to preload image which is set in “jumbo” section. This way image will be preloaded faster and use will be able to see it without any glitches. I also set up favicon for all common platforms (IOS, Android, Browser)

## CSS
I used “vanilla” css without any framework. For the font parts (as I haven’t been provided with the specific font for the APP) I used system font-stack that uses font that can be found in user’s OS. This way it would pick up font faster because font would be taken from the user’s OS rather than downloaded. In font-size I used fluid typography (https://goo.gl/o9sRyq) which also can be used to set other CSS properties with “rem” instead of the “px”. This way those properties will depend on the “root” font-size value (which on the web is HTML Element [<html>]). It gives us fluid responsive font-size and overall design. For setting CSS classes I use my own methodology which is based on the BEM methodology (https://codepen.io/Konrud/pen/dRyVpY). In “Going Digital” Section I used “Flexbox holy albatross technique” (https://heydonworks.com/article/the-flexbox-holy-albatross/) to make it responsive. For the other parts I mainly used flexbox and @media queries where needed. As I haven’t been given any strict rules regarding browser support, I assumed that we’re talking about ever green browsers like Firefox, Chrome, Opera, Safari and latest Microsoft Edge (the one which based on the Chromium). 


## JS
For the JS part I again went with “vanilla” Javascript. I used it mainly for setting up animations (only if user enabled JS in its browser) and Service worker. Service worker has been added in order to be able to cache all images, so on the subsequent visit, site will be load much faster as all images will be sent straight from the cache instead of being downloaded from the network.
