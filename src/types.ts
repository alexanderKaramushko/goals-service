export type CursorPagePayload<Payload extends Record<string, any>> = Payload & {
  cursorSettings: {
    id: number;
    createdAt: string;
  } | null;
  pageSettings: {
    limit: number;
  };
};

/**
 * @description Идентификатор курсора в формате base64: created_at + id
 */
export type PaginationCursor = string | null;

export type CursorPageResponse<Response extends Record<string, any>> = {
  pages: Response;
  pageInfo: {
    hasNextPage: boolean;
    paginationCursor: PaginationCursor;
  };
};

export type ClientCursorPagePayload<Payload extends Record<string, any>> =
  Payload & {
    paginationCursor: PaginationCursor;
    limit: number;
  };
