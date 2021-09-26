## Pet Gallery

Glitch: https://a3-19kmunz.glitch.me

**Summary**

Pet Gallery is a simple application to view images of your pets! Submit a link to any image and see it clear as day! Underneath the image will be a randomized tag line for your critter. Currently only explicitly supports Dog, Cats, Birds, and Snakes, the site also allows of "Other" pets with their own more generic tag lines.
![Image of Pet Gallery Page](https://i.imgur.com/R2tJuxd.png)

**Challenges**
The first challenge I faced was covnerting my non express server to an express server. Particularily, the get and post requests. Previously, I had not need to include "headers:{ "Content-Type": "application/json" }," so silent falling request drove me a little insane for a while. 
My next real challenge was working with cookies. I have never had to use them before and it took a while to adjust. It took a while to figure out my default pet data insert statements werent working because i was wrapping an ObjectId object in another ObjectId. Once those kinks were worked out, I reformatted my code and suddenly nothing seemed to work! Turns out the browser I am using, Opera, suddenly decided I was saving cookies too often on one site. Once I switched over to Edge for live testing (and repaired all my debug "fixes"), cookeis were back up an running!

**Authentication**
This website is autheticated with a simple login form, cookies, and a mongodb collection. The user inputs their username and password, which sends to the database to check the validity. If the entry exists in the users table, the user will recieve their id in the cookie session and move onto the main page. The main gallery uses their stashed cookie id to submit new pets to the gallery and note their owner. This way of authenticationg was relitivaly easy and straight forward. Additionally, my mongodb-santitize middleware will also ensure this method of authentication will be mostly safe.

**CSS**
I used the pico.css framework. I liked it because it was easy to install and has a dark/light mode built in. It, also, automatically works on my phone. I modified some CSS for centering formatting and to add the flexbox formatting.

**Middleware**
- serve-favicon: provides a favicon for the page. mine is a cat emoji.
- body-parser: parses request body strings to json
- cookie-session: enables cookie storage to save login information
- mongodb-sanitize: cleans requests to prevent sql injection attacks to mongodb
- custom: I also created a function to ensure unauthenticated cookie users were redirected back to the login page. It is place after all the login auth code to ensure these legitmate authentication requests are not skipped. It checks that the request isnt a /login request within the body aswell to doubly ensure this. I was having issues with css files loading, so the middleware also ensures not to skip any of my css files. If the user does have cookies or is not making a request that doesnt require authentication, the middleware just goes next(). Otherwise it re-sends the login file to further prompt the user.


## Technical Achievements
- **Tech Achievement 1**: I hosted my site on heroku. What was better about using the service you chose as compared to Glitch? What (if anything) was worse?
- **Tech Achievement 2**: I recieved 100% on lighthouse. Add screenshot

### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative...
  - Writing:
    - Provide Informative and Unique Page Titles: I added the title 'Login | Pet Gallery | CS4241 A3' to the login page and 'Pet Gallery | CS4241 A3'