## Pet Gallery

Glitch: https://a3-19kmunz.glitch.me

**Summary**
Pet Gallery is a simple application to view images of your pets! Submit a link to any image and see it clear as day! Underneath the image will be a randomized tag line for your critter. CUrently only explicitly support Dog, Cats, Birds, and Snakes, the site also allows of "Other" pets with their own more generic tag lines.

Images are encouraged (Add Image)

**Challenges**
- challenges you faced in realizing the application FINISH
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