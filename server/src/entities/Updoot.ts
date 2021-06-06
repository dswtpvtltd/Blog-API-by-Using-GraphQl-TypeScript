import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { Post } from './Post';

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	@Field()
	@Column({ type: 'int' })
	value: number;

	@Field()
	@PrimaryColumn()
	userId: number;

	// it is forgien key
	@Field(() => User) /// this fields enable only when we use show user data with post
	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@Field()
	@PrimaryColumn()
	postId: number;

	// it is forgien key
	@Field(() => Post) /// this fields enable only when we use show user data with post
	@ManyToOne(() => Post, (post) => post.updoots, {
		onDelete: 'CASCADE', // this is way to implement delete cascade
	})
	post: Post;
}
