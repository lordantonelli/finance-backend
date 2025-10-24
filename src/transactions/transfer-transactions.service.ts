import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppContextService } from '@shared/services/app-context.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransferTransaction } from './entities/transfer-transaction.entity';

@Injectable()
export class TransferTransactionsService extends BaseService<TransferTransaction> {
  constructor(
    @InjectRepository(TransferTransaction)
    protected readonly repository: Repository<TransferTransaction>,
    protected appContext: AppContextService,
    protected readonly accountsService: AccountsService,
  ) {
    super(repository, appContext);
  }

  async create(
    createDto: DeepPartial<TransferTransaction>,
  ): Promise<TransferTransaction> {
    // Create "Transferência de Saída" (from source account)
    const outgoingTransfer = await super.create({
      ...createDto,
      description: createDto.description
        ? `Transferência de Saída - ${createDto.description}`
        : 'Transferência de Saída',
    });

    // Create "Transferência de Entrada" (to destination account)
    const incomingTransfer = await super.create({
      ...createDto,
      account: createDto.toAccount,
      toAccount: createDto.account,
      description: createDto.description
        ? `Transferência de Entrada - ${createDto.description}`
        : 'Transferência de Entrada',
      relatedTransaction: outgoingTransfer,
    });

    // Link the outgoing transfer to the incoming one
    outgoingTransfer.relatedTransaction = incomingTransfer;
    await this.repository.save(outgoingTransfer);

    // Update balances: decrease from source, increase to destination
    await this.accountsService.updateBalance(
      outgoingTransfer.account,
      -outgoingTransfer.amount,
    );
    await this.accountsService.updateBalance(
      outgoingTransfer.toAccount,
      outgoingTransfer.amount,
    );

    return outgoingTransfer;
  }

  async update(
    id: number,
    dto: Partial<TransferTransaction>,
  ): Promise<TransferTransaction> {
    // Load the outgoing transfer with its related incoming transfer
    const outgoing = await this.findOne(id, [
      'account',
      'toAccount',
      'relatedTransaction',
    ]);
    const incoming = outgoing.relatedTransaction;

    if (!incoming) {
      throw new Error('Transfer not found or incomplete');
    }

    const originalFrom = outgoing.account;
    const originalTo = outgoing.toAccount;
    const originalAmount = outgoing.amount;

    // Resolve new accounts if provided
    type IdRef = { id: number };
    const newFromId = dto.account
      ? (dto.account as unknown as IdRef).id
      : originalFrom.id;
    const newToId = dto.toAccount
      ? (dto.toAccount as unknown as IdRef).id
      : originalTo.id;

    const newFrom =
      newFromId !== originalFrom.id
        ? await this.accountsService.findOne(newFromId)
        : originalFrom;
    const newTo =
      newToId !== originalTo.id
        ? await this.accountsService.findOne(newToId)
        : originalTo;
    const newAmount = dto.amount ?? originalAmount;
    const newDate = dto.date ?? outgoing.date;
    const baseDescription =
      dto.description ??
      outgoing.description?.replace(/^Transferência de (Saída|Entrada) - /, '');

    // Adjust balances
    const sameFrom = newFrom.id === originalFrom.id;
    const sameTo = newTo.id === originalTo.id;

    if (sameFrom && sameTo) {
      const delta = newAmount - originalAmount;
      if (delta !== 0) {
        await this.accountsService.updateBalance(originalFrom, -delta);
        await this.accountsService.updateBalance(originalTo, delta);
      }
    } else {
      // Revert original effect
      await this.accountsService.updateBalance(originalFrom, originalAmount);
      await this.accountsService.updateBalance(originalTo, -originalAmount);
      // Apply new effect
      await this.accountsService.updateBalance(newFrom, -newAmount);
      await this.accountsService.updateBalance(newTo, newAmount);
    }

    // Update outgoing transfer
    outgoing.account = newFrom;
    outgoing.toAccount = newTo;
    outgoing.amount = newAmount;
    outgoing.date = newDate;
    outgoing.description = baseDescription
      ? `Transferência de Saída - ${baseDescription}`
      : 'Transferência de Saída';

    await this.repository.save(outgoing);

    // Update incoming transfer
    incoming.account = newTo;
    incoming.toAccount = newFrom;
    incoming.amount = newAmount;
    incoming.date = newDate;
    incoming.description = baseDescription
      ? `Transferência de Entrada - ${baseDescription}`
      : 'Transferência de Entrada';

    await this.repository.save(incoming);

    return outgoing;
  }

  async remove(id: number): Promise<void> {
    const outgoing = await this.findOne(id, [
      'account',
      'toAccount',
      'relatedTransaction',
    ]);

    // Reverse the transfer effect on balances
    await this.accountsService.updateBalance(outgoing.account, outgoing.amount);
    await this.accountsService.updateBalance(
      outgoing.toAccount,
      -outgoing.amount,
    );

    // Remove both transfers (related transaction will cascade if configured, otherwise explicit)
    if (outgoing.relatedTransaction) {
      await this.repository.remove(outgoing.relatedTransaction);
    }
    await this.repository.remove(outgoing);
  }
}
