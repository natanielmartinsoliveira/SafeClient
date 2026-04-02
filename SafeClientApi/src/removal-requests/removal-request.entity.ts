import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContactType } from '../common/enums/contact-type.enum';

export type RemovalStatus = 'pending' | 'approved' | 'rejected';

@Entity({ name: 'removal_requests' })
export class RemovalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** HMAC-SHA256 do contato normalizado — nenhum dado pessoal armazenado (LGPD) */
  @Column({ length: 64 })
  contactHash: string;

  @Column({ type: 'enum', enum: ContactType })
  contactType: ContactType;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ length: 20, default: 'pending' })
  status: RemovalStatus;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
