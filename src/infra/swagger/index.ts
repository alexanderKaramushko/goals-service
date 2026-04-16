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
    .addGlobalParameters({
      name: 'x-user-timezone',
      in: 'header',
      required: false,
      description: 'Таймзона пользователя',
      schema: {
        type: 'string',
        enum: ['Europe/Moscow', 'Canada/Yukon', 'Europe/Samara'],
      },
    })
    .addTag(params.tag);

  if (params.secure) {
    builder.addCookieAuth();
  }

  return builder;
}
