import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../models/base-response.dto";

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  {
    model,
    description,
  }: {
    model: TModel;
    description?: string;
  },
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, model),
    ApiOkResponse({
      status: 200,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
