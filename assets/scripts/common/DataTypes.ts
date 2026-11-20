/** 素材数据 */
export interface MaterialData {
    id: number;
    fileName: string;
    tags: number[];
    createTime: number;
    width: number;
    height: number;
}

/** 标签数据 */
export interface TagData {
    id: number;
    name: string;
}

/** 主题数据 */
export interface ThemeData {
    id: number;
    name: string;
}

/** 作品数据 */
export interface ArtworkData {
    id: number;
    name: string;
    materialIds: number[];
}

/** 自增计数器 */
export interface NextIds {
    material: number;
    tag: number;
    theme: number;
    artwork: number;
}

/** 顶层存储结构 */ 
export interface AllData {
    materialList: MaterialData[];
    tagList: TagData[];
    themeList: ThemeData[];
    artworkList:ArtworkData[];
    nextIds: NextIds;
}


/** 存储常量： key 和默认值集中管理 */
export const STORAGE_KEY = 'allData';

export function createDefaultData(): AllData {
    return {
        materialList: [],
        tagList: [],
        themeList: [],
        artworkList: [],
        nextIds: { material:1, tag: 1, theme: 1, artwork: 1}
    };
}