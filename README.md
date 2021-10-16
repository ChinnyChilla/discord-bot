# Chinny's Discord Bot

**[Click to add me to server!](https://discord.com/api/oauth2/authorize?client_id=807085572388421682&permissions=8&scope=bot%20applications.commands)**

### How to use:
1. Go [here](https://discord.com/developers/applications/) and create a new application
2. Fill out .env.example with your discord token and client and then rename the file to .env
3. Put it on a server (or your own computer)
**Note: Must Use Node version 16.6.2**
5. Run 'npm install' (or 'npm i')
6. Make sure there is no errors
7. After all that, run 'node main.js' and there you go!

### Current Bugs and Fixes:

#### **Youtube music stops seconds after starting**

Problem: Issue with old codecs
 > Fix (Temporary): Replace file in node_modules/discord-player/dist/Structures/Queue.js with Queue.js in folder 'temporary files'
 [Credit](https://github.com/Androz2091/discord-player/issues/794#issue-1000772967)

 #### **Spotify music stops seconds after starting**
 > No Fix

#### **Queue stops playing after a song**
 
 Problem: discord-player emits ConnectionError and PlayerError
 (trying to find reason)
 > Fix: Quit the queue (/quit) and readd the music