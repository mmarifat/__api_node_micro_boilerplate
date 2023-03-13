import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class TestEntity extends BaseEntity {
    @Column({ type: 'string', nullable: true })
    value: string;
}
