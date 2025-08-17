import { EntityRepository, EntityManager, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { User } from '../../auth/entities/user.entity';
import { PaginatedQueryDto } from '../../common/models/paginated-query.dto';
import { generateSKU } from '../../common/utils/helpers';
import { Item } from '../entities/item.entity';
import { ItemAttribute } from '../entities/item-attribute.entity';
import { Reservation } from '../entities/reservation.entity';
import { StockEntry } from '../entities/stock-entry.entity';
import { ItemStatus } from '../enums/item-status.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { StockEntryStatus } from '../enums/stock-entry-status.enum';
import { StockEntryType } from '../enums/stock-entry-type.enum';
import { AddStockRequestDto } from '../models/add-stock.request.dto';
import { CreateItemRequestDto } from '../models/create-item.request.dto';
import { CreateReservationRequestDto } from '../models/create-reservation.request.dto';
import { ItemResponseDto } from '../models/item.response.dto';
import { StockEntryResponseDto } from '../models/stock-entry.response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: EntityRepository<Item>,
    @InjectRepository(ItemAttribute)
    private readonly itemAttributeRepository: EntityRepository<ItemAttribute>,
    @InjectRepository(StockEntry)
    private readonly stockEntryRepository: EntityRepository<StockEntry>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: EntityRepository<Reservation>,
    private readonly em: EntityManager,
  ) {}

  async createItem(
    businessId: string,
    dto: CreateItemRequestDto,
    createdBy: User,
  ): Promise<ItemResponseDto> {
    // Create item without SKU first
    const item = this.itemRepository.create({
      business: { ggId: businessId } as any,
      name: dto.name,
      modelNo: dto.modelNo,
      description: dto.description,
      category: dto.category,
      brand: dto.brand,
      images: dto.images,
      costPrice: dto.costPrice,
      sellingPrice: dto.sellingPrice,
      discountPrice: dto.discountPrice,
      unit: dto.unit,
      minimumStock: dto.minimumStock || 0,
      trackStock: dto.trackStock ?? true,
      allowPreOrder: dto.allowPreOrder ?? false,
      barcode: dto.barcode,
      createdBy: createdBy,
      // SKU will be generated after attributes are created
    });

    await this.em.persistAndFlush(item);

    // Create attributes if provided
    const attributeData: Array<{ name: string; value: string }> = [];

    if (dto.attributes && dto.attributes.length > 0) {
      const attributes = dto.attributes.map((attrDto) => {
        attributeData.push({ name: attrDto.name, value: attrDto.value });
        return this.itemAttributeRepository.create({
          business: { ggId: businessId } as any,
          item,
          name: attrDto.name,
          value: attrDto.value,
          dataType: attrDto.dataType || 'string',
          displayOrder: attrDto.displayOrder,
          isActive: attrDto.isActive ?? true,
          createdBy: createdBy,
        });
      });

      await this.em.persistAndFlush(attributes);
    }

    // Generate SKU with access to attributes
    item.sku = generateSKU(item.name, item.modelNo, attributeData);
    await this.em.persistAndFlush(item);

    // Reload item with attributes
    await this.em.populate(item, ['attributes']);

    return this.mapToItemResponse(item);
  }

  async getItems(
    businessId: string,
    query: PaginatedQueryDto,
  ): Promise<{ items: ItemResponseDto[]; total: number }> {
    const filter: any = { business: { ggId: businessId } };
    const [items, total] = await this.itemRepository.findAndCount(
      {
        ...filter,
        status: { $ne: ItemStatus.DISCONTINUED },
        ...(query.search && {
          $or: [
            { name: { $ilike: `%${query.search}%` } },
            { sku: { $ilike: `%${query.search}%` } },
            { modelNo: { $ilike: `%${query.search}%` } },
            { brand: { $ilike: `%${query.search}%` } },
            { category: { $ilike: `%${query.search}%` } },
          ],
        }),
      },
      {
        limit: query.limit,
        offset: query.offset,
        orderBy: { [query.sortBy]: query.sortOrder },
        populate: ['attributes'],
      },
    );

    return {
      items: items.map((item) => this.mapToItemResponse(item)),
      total,
    };
  }

  async getItemById(
    businessId: string,
    itemId: number,
  ): Promise<ItemResponseDto> {
    const item = await this.itemRepository.findOne(
      {
        id: itemId,
        business: { ggId: businessId },
      },
      {
        populate: ['attributes'],
      },
    );

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.mapToItemResponse(item);
  }

  async addStock(
    businessId: string,
    itemId: number,
    dto: AddStockRequestDto,
    processedBy: User,
  ): Promise<StockEntryResponseDto> {
    return this.em.transactional(async (em) => {
      // Get item with lock to prevent concurrent modifications
      const item = await em.findOne(
        Item,
        {
          id: itemId,
          business: { ggId: businessId },
        },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      if (!item.trackStock && dto.type !== StockEntryType.ADJUSTMENT) {
        throw new BadRequestException(
          'Cannot modify stock for non-tracked items',
        );
      }

      const previousStock = item.totalStock;
      const newStock = Math.max(0, previousStock + dto.quantity);

      // Create stock entry
      const stockEntry = em.create(StockEntry, {
        business: { ggId: businessId } as any,
        item,
        type: dto.type,
        quantity: dto.quantity,
        previousStock,
        newStock,
        unitCost: dto.unitCost,
        reference: dto.reference,
        notes: dto.notes,
        supplier: dto.supplier,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        batchNumber: dto.batchNumber,
        processedBy,
        processedAt: new Date(),
        status: StockEntryStatus.COMPLETED,
        createdBy: processedBy,
      });

      // Update item stock
      item.totalStock = newStock;

      // If stock increased, try to fulfill pending reservations
      if (dto.quantity > 0) {
        await this.fulfillReservations(em, item, processedBy);
      }

      await em.persistAndFlush([stockEntry, item]);

      return this.mapToStockEntryResponse(stockEntry);
    });
  }

  async createReservation(
    businessId: string,
    dto: CreateReservationRequestDto,
    reservedBy: User,
  ): Promise<any> {
    return this.em.transactional(async (em) => {
      const item = await em.findOne(
        Item,
        {
          id: dto.itemId,
          business: { ggId: businessId },
        },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      if (!item.allowPreOrder && item.availableStock < dto.quantity) {
        throw new BadRequestException(
          'Insufficient stock and pre-orders not allowed',
        );
      }

      const reservation = em.create(Reservation, {
        business: { ggId: businessId } as any,
        item,
        quantity: dto.quantity,
        type: dto.type,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        reference: dto.reference,
        notes: dto.notes,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        reservedBy,
        createdBy: reservedBy,
      });

      // If stock is available, fulfill immediately
      if (item.availableStock >= dto.quantity) {
        reservation.fulfilledQuantity = dto.quantity;
        reservation.status = ReservationStatus.FULFILLED;
        reservation.fulfilledAt = new Date();
        reservation.fulfilledBy = reservedBy;
      } else {
        // Reserve available stock
        item.reservedStock += dto.quantity;
      }

      await em.persistAndFlush([reservation, item]);

      return {
        id: reservation.id,
        status: reservation.status,
        fulfilledQuantity: reservation.fulfilledQuantity,
        remainingQuantity: reservation.remainingQuantity,
      };
    });
  }

  private async fulfillReservations(
    em: EntityManager,
    item: Item,
    processedBy: User,
  ): Promise<void> {
    // Get oldest active reservations first
    const reservations = await em.find(
      Reservation,
      {
        item: item,
        status: ReservationStatus.ACTIVE,
      },
      {
        orderBy: { createdAt: 'ASC' as any },
      },
    );

    let availableStock = item.availableStock;

    for (const reservation of reservations) {
      if (availableStock <= 0) break;

      const fulfillableQuantity = Math.min(
        reservation.remainingQuantity,
        availableStock,
      );

      if (fulfillableQuantity > 0) {
        reservation.fulfilledQuantity += fulfillableQuantity;
        item.reservedStock -= fulfillableQuantity;
        availableStock -= fulfillableQuantity;

        if (reservation.isFullyFulfilled) {
          reservation.status = ReservationStatus.FULFILLED;
          reservation.fulfilledAt = new Date();
          reservation.fulfilledBy = processedBy;
        }
      }
    }

    await em.flush();
  }

  private mapToItemResponse(item: Item): ItemResponseDto {
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      modelNo: item.modelNo,
      description: item.description,
      category: item.category,
      brand: item.brand,
      images: item.images,
      attributes: item.attributes.getItems().map((attr) => ({
        id: attr.id,
        name: attr.name,
        value: attr.value,
        dataType: attr.dataType,
        displayOrder: attr.displayOrder,
        isActive: attr.isActive,
        createdAt: attr.createdAt,
        updatedAt: attr.updatedAt,
      })),
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      discountPrice: item.discountPrice,
      currency: item.currency,
      unit: item.unit,
      totalStock: item.totalStock,
      reservedStock: item.reservedStock,
      availableStock: item.availableStock,
      minimumStock: item.minimumStock,
      status: item.status,
      trackStock: item.trackStock,
      allowPreOrder: item.allowPreOrder,
      inStock: item.inStock,
      isLowStock: item.isLowStock,
      canOrder: item.canOrder,
      barcode: item.barcode,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private mapToStockEntryResponse(
    stockEntry: StockEntry,
  ): StockEntryResponseDto {
    return {
      id: stockEntry.id,
      itemId: stockEntry.item.id,
      itemName: stockEntry.item.name,
      itemSku: stockEntry.item.sku,
      type: stockEntry.type,
      quantity: stockEntry.quantity,
      previousStock: stockEntry.previousStock,
      newStock: stockEntry.newStock,
      unitCost: stockEntry.unitCost,
      reference: stockEntry.reference,
      notes: stockEntry.notes,
      status: stockEntry.status,
      processedByName: stockEntry.processedBy?.fullName,
      processedAt: stockEntry.processedAt?.toISOString(),
      supplier: stockEntry.supplier,
      expiryDate: stockEntry.expiryDate?.toISOString(),
      batchNumber: stockEntry.batchNumber,
      createdAt: stockEntry.createdAt.toISOString(),
    };
  }
}
