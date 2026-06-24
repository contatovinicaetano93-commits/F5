/**
 * Abstração de armazenamento XML NF-e — Postgres hoje, S3 depois (P2).
 */

export interface XmlStorage {
  save(tenantId: string, nfKey: string, xmlContent: string): Promise<void>;
  read(tenantId: string, nfKey: string): Promise<string | null>;
}

/** Implementação atual: conteúdo fica em `NotaFiscal.xmlContent` via Prisma. */
export const postgresXmlStorage: XmlStorage = {
  async save() {
    // Persistido em internalData.nfs.createFromXml — noop aqui.
  },
  async read() {
    return null;
  },
};

export function getXmlStorage(): XmlStorage {
  return postgresXmlStorage;
}
