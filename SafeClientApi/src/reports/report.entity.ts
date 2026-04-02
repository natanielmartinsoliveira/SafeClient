import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContactType } from '../common/enums/contact-type.enum';
import { FlagType } from '../common/enums/flag-type.enum';

@Entity({ name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** HMAC-SHA256 do contato normalizado — nenhum dado pessoal armazenado (LGPD) */
  @Column({ length: 64 })
  contactHash: string;

  @Column({ type: 'enum', enum: ContactType })
  contactType: ContactType;

  @Column('simple-array')
  flags: FlagType[];

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 64, nullable: true })
  ipHash: string | null;

  /**
   * Soft-delete: false quando desativado por solicitação de remoção aprovada.
   * O histórico é preservado e reativado automaticamente se um novo relato chegar.
   */
  @Column({ default: true })
  active: boolean;

  /** UUID do usuário web que criou o relato (null = app mobile anônimo) */
  @Column({ nullable: true })
  userId: string | null;

  /** E-mail do usuário para identificação rápida sem join */
  @Column({ nullable: true })
  userEmail: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
