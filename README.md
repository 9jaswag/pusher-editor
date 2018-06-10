Build a realtime collaborative editor with Gatsby, Draft.js and Pusher
------

A tutorial to showcase realtime functionality of Pusher Channels in Gatsby


Getting Started
------

Make sure that you have the Gatsby CLI program installed:
```sh
npm install --global gatsby-cli
```

#### Clone The Repository
`$ https://github.com/9jaswag/pusher-editor.git`


#### Change directory
`$ cd pusher-editor`


#### Install dependencies
`$ yarn install`


#### Setup up Figaro and Env variables
- Create a `.env` file in your root directory and add the following to it:
```
PUSHER_APP_ID: 'your Pusher app ID'
PUSHER_APP_KEY: 'your pusher kep'
PUSHER_APP_SECRET: 'your pusher secret'
PUSHER_APP_CLUSTER: 'your pusher cluster'
```


#### Start the app
- Open the app in two terminals, in one run `node server.js` and `gatsby develop` in the other.


Prerequisites
------
A basic knowledge of React


Built With
------
- [Pusher](https://pusher.com) - A hosted service that makes it super-easy to add real-time data and functionality to web and mobile applications
- [Gatsby](https://www.gatsbyjs.org/) - A static site generator for React
- [Draft.js](https://draftjs.org/) - An open source framework from Facebook for building rich texts editors in React
