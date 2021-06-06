import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
	@Field(() => Int)
	@PrimaryKey()
	id: number;

	@Field(() => String)
	@Property({ type: 'text', unique: true })
	email!: string;

	@Field(() => String)
	@Property({ type: 'text', unique: true })
	username!: string;

	@Field(() => String)
	@Property({ type: 'text' })
	firstname: string;

	@Field(() => String)
	@Property({ type: 'text' })
	lastname: string;

	// we do not use @Field() here becuase we can not show show password
	@Property({ type: 'text' })
	password: string;

	@Field(() => Date)
	@Property({ type: 'date' })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
	updatedAt = new Date();
}
