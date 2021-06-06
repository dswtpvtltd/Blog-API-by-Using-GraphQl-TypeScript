import { COOKIE_NAME, __prod__ } from './contants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import path from 'path';

import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

import { Post } from './entities/Post';
import { User } from './entities/User';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

const main = async () => {
	//const conn =
	await createConnection({
		type: 'mysql',
		database: 'autotrader',
		username: 'root',
		password: 'root',
		logging: true,
		multipleStatements: true,
		migrations: [path.join(__dirname, './migrations/*')],
		synchronize: true, // this is synchronise run every time when changes made
		entities: [Post, User, Updoot],
		port: 8889,
	});

	//conn.runMigrations();

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();

	app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTTL: true,
				disableTouch: true,
			}),
			saveUninitialized: false,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
				httpOnly: true,
				secure: __prod__,
				sameSite: 'lax',
			},
			secret: '3432423fvfgfddfvdfgrt756765vfgdgfdg45',
			resave: false,
		})
	);

	app.get('/', (_, res) => {
		res.send('Hello');
	});

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			updootLoader: createUpdootLoader(),
		}),
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('server started at localhost:4000');
	});
};

main().catch((error) => {
	console.error(error.message);
});
