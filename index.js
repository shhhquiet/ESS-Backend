require('dotenv').config({ path: './.env' });
const { ApolloServer } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const axios = require('axios')
// const jwt = require('jsonwebtoken');
const express = require('express');

const { isAuth, populateUser, errorHandler } = require('./src/middleware/index');
const { prisma, client } = require('./src/db');
const schema = require('./src/schema');

const apolloServer = new ApolloServer({
	schema,
	context: async ({ req }) => {
		return {
			...req,
			client,
			prisma,
			query: prisma.query,
			mutation: prisma.mutation
		};
	},
	playground: true,
	introspection: true,
	debug: true
});

const corsConfig = {
	origin: ['http://localhost:3000'],
	credentials: true
};

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(isAuth);
app.use(populateUser);
app.use(errorHandler);

app.get('/spotifyauth', async (req, res, next) => {
	res.redirect('https://accounts.spotify.com/authorize?client_id=ed66f7f5f8f047a19630ae6a6ea5f322&redirect_uri=http://localhost:4000/callback&response_type=code')
})

app.get('/callback', (req, res, next) => {
	res.send('hi')
})

apolloServer.applyMiddleware({ app, cors: corsConfig, path: '/' });

const server = createServer(app);

server.listen(process.env.PORT || 4000, () => {
	console.log(`🚀 Server ready!!`);
});
