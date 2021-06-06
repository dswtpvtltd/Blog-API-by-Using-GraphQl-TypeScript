import { Field, Int, ObjectType } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';
import { Updoot } from './Updoot';

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => String)
	@Column({ unique: true })
	email!: string;

	@Field(() => String)
	@Column({ unique: true })
	username!: string;

	@Field(() => String)
	@Column()
	firstname: string;

	@Field(() => String)
	@Column()
	lastname: string;

	// we do not use @Field() here becuase we can not show show password
	@Column()
	password: string;

	@OneToMany(() => Updoot, (updoot) => updoot.user)
	updoots: Updoot[];

	@OneToMany(() => Post, (post) => post.creator)
	posts: Post[]; // this is reference of Post moded ManyToMany

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
