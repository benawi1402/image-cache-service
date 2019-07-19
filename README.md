# image-cache-service
Small node and express js based caching service

Takes an url like this:
http://localhost:3000/image?url=...

Creates an hash of your URL, checks filesystem for file and serves it if it already exists or first downloads file on server and then serves it to user.
