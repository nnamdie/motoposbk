import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../models/base-response.dto";

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  {
    status,
    type,
    description,
  }: {
    status: number;
    type: TModel;
    description?: string;
  },
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, type),
    ApiOkResponse({
      status,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
          },
        ],
      },
    }),
  );
};
