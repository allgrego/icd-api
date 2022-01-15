/**
 * ICD-10 TypeScript  interfaces
 */

// Disease, also known as Diagnosis or Subcategory
export interface Disease {
  code: string,
  name: string,
  category?: string | undefined,
  block?: string | undefined,
  chapter?: string | undefined,
}

export interface Category {
  id: string,
  label: string,
  blockId: string,
  chapterId?: string,
  subcategories?: Disease[],
}

export interface Block {
  id: string,
  label: string,
  chapterId: string,
  categories?: Category[],
}

export interface Chapter {
  id: string,
  label: string
  blocks?: Block[]
}
