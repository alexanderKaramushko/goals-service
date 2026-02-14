import { DocumentBuilder } from '@nestjs/swagger';

type createDocumentBuilderFactoryParams = {
  title: string;
  description: string;
  version: string;
  tag: string;
  secure: boolean;
};

export function createDocumentBuilderFactory(
  params: createDocumentBuilderFactoryParams,
) {
  const builder = new DocumentBuilder()
    .setTitle(params.title)
    .setDescription(params.description)
    .setVersion(params.version)
    .addTag(params.tag);

  if (params.secure) {
    builder.addCookieAuth();
  }

  return builder;
}
