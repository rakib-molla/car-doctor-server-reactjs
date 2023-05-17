/* ========= create token ===============

1. client: after user login send user basic info to create token 
2. in the server side: install npm i jsonwebtoken
3. import jsonwebtoken
4. jwt.sign(payload, secret, {expire})
5. return token to the client side
6. after receviving the token store it either httponly cookies or localstorage (second best solution)
7. use a general space onAuthStateChange > AuthProvider

== send token to server==
1. for sensitive api call () send authorization header {authorization: bearer token}

=== verify token ====
1. create a function called verifyjwt (middleware)
2. this function will have three params: req, res, next
3. first check whether the authorization headers exists 
4. if not send 401
5. get the token out of the authorization header 
6. call jwt.verify(tokenm sefcret, (err, decoded))
7. if err=> send 401
8. set decoded to the req object so that we can retrieve it later 
9. call the next() to go to the next function 

=====
1. check weather token has the email that matches with the request email






*/