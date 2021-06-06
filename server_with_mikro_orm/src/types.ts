import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Session } from 'express-session';
import { Redis } from 'ioredis';

declare global {
	namespace Express {
		interface SessionData {
			[key: string]: any;
		}

		interface Session extends SessionData {
			id: string;
			regenerate(callback: (err: any) => void): void;
			destroy(callback: (err: any) => void): void;
			reload(callback: (err: any) => void): void;
			save(callback: (err: any) => void): void;
			touch(): void;
		}
	}
}

export type MyContext = {
	em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
	req: Request & { session?: Session & { userId?: number } };
	redis: Redis;
	res: Response;
};
