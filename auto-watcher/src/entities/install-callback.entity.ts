import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('install_callbacks')
export class InstallCallback {
  @PrimaryColumn()
  installation_id: string;

  @Column()
  org_id: string;

  @Column()
  ones_base_url: string;

  @Column()
  shared_secret: string;

  @Column()
  callback_type: string;

  @Column('bigint')
  time_stamp: number;

  @Column({ nullable: true })
  app_id: string;

  @Column({ nullable: true })
  app_version: string;

  @CreateDateColumn()
  created_at: Date;
}
