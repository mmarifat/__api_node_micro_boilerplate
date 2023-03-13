import { DeleteDateColumn, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class BaseEntity {
    @ObjectIdColumn('uuid')
    id: string;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}
