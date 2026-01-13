import { IsNumber, IsArray, ValidateNested, IsPositive, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemVendaDto {
  @IsNumber()
  @IsPositive()
  produto_id: number;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsNumber()
  @Min(0)
  preco_unitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number;
}

export class CriarVendaDto {
  @IsNumber()
  @IsPositive()
  vendedor_id: number;

  @IsNumber()
  @IsPositive()
  cliente_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemVendaDto)
  itens: ItemVendaDto[];
}