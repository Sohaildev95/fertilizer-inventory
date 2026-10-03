export const ApiTags = () => () => {};
export const ApiOperation = () => () => {};
export const ApiResponse = () => () => {};
export const ApiProperty = () => () => {};
export const ApiBearerAuth = () => () => {};
export const ApiBody = () => () => {};
export const ApiParam = () => () => {};
export const ApiQuery = () => () => {};

export class DocumentBuilder {
  setTitle() { return this; }
  setDescription() { return this; }
  setVersion() { return this; }
  addBearerAuth() { return this; }
  addTag() { return this; }
  build() { return {}; }
}

export const SwaggerModule = {
  createDocument: () => ({}),
  setup: () => {},
};
