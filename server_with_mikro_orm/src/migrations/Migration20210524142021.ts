import { Migration } from '@mikro-orm/migrations';

export class Migration20210524142021 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `user` add `email` text not null;');
    this.addSql('alter table `user` add unique `user_email_unique`(`email`);');

    this.addSql('alter table `user` add unique `user_email_unique`(`email`);');

    this.addSql('alter table `user` add unique `user_username_unique`(`username`);');
  }

}
