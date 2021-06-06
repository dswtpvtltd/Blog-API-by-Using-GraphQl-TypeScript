import path from 'path';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './contants';
import { Post } from './entities/Post';
import { User } from './entities/User';

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post, User],
	dbName: 'cat',
	type: 'mysql',
	debug: !__prod__,
	user: 'root',
	password: 'root',
	port: 8889,
} as Parameters<typeof MikroORM.init>[0];
