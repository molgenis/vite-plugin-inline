export interface SourceMap {
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent: string[];
  version: number;
  toString(): string;
  toUrl(): string;
}

export interface RenderedModule {
  code: string | null;
  originalLength: number;
  removedExports: string[];
  renderedExports: string[];
  renderedLength: number;
}

export interface PreRenderedAsset {
  name: string | undefined;
  source: string | Uint8Array;
  type: "asset";
}

export interface OutputAsset extends PreRenderedAsset {
  fileName: string;
  isAsset: true;
}

export interface PreRenderedChunk {
  exports: string[];
  facadeModuleId: string | null;
  isDynamicEntry: boolean;
  isEntry: boolean;
  isImplicitEntry: boolean;
  modules: {
    [id: string]: RenderedModule;
  };
  name: string;
  type: "chunk";
}

export interface RenderedChunk extends PreRenderedChunk {
  code?: string;
  dynamicImports: string[];
  fileName: string;
  implicitlyLoadedBefore: string[];
  importedBindings: {
    [imported: string]: string[];
  };
  imports: string[];
  map?: SourceMap;
  referencedFiles: string[];
}

export interface OutputChunk extends RenderedChunk {
  code: string;
}
