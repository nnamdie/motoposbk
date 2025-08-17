import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { BaseResponseDto } from "../models/base-response.dto";

export const ApiBaseResponse = <TModel extends Type<any>>(
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
    ApiExtraModels(BaseResponseDto, type),
    ApiOkResponse({
      status,
      description,
      schema: {
        $ref: getSchemaPath(BaseResponseDto),
        properties: {
          data: {
            $ref: getSchemaPath(type),
          },
        },
      },
    }),
  );
};
