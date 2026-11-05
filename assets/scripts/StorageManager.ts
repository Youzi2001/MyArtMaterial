// 封装最简单的工具类，构建setStr/getStr/setObj/getObj/del五个方法

/*
从Cocos引擎核心模块导入 sys 系统对象和装饰器 _decorator,
sys 是引擎提供的跨平台系统能力入口，内置了 localStorage 持久化存储接口。
提取了 ccclass 装饰器，标记这个类为Cocos可识别的组件类，后续可以直接在编辑器节点上挂载使用
*/
import { _decorator, sys } from 'cc'; 
const { ccclass } = _decorator;



@ccclass('StorageManager')
// export 关键字把这个类标记为公开可导出，项目里其他脚本文件都可以导入并使用这个类
export class StorageManager {

    // 单例全局实例实现，保证整个项目全局只会生成一个 StorageManager 实例，避免多处实例化导致的数据读写冲突
    // 可以在项目任意脚本里，直接调用 StorageManager.inst 就能拿到整个全局唯一实例，不需要反复new对象
    // 定义一个私有静态变量_inst，用来存储这个类的全局唯一实例，private修饰符保证外部代码无法直接修改这个变量，避免实例被意外篡改
    private static _inst: StorageManager;
    // 定义一个公开的静态只读访问器inst，外部代码只能通过 StorageManager.inst来获取实例，不能直接给它赋值
    public static get inst() {
        // 懒加载逻辑：
        // 当第一次访问inst属性时，如果_inst还没有被实例化，就自动new一个新的StorageManager对象赋值给它，后续再访问时直接复用已经创建好的实例
        if (!this._inst) this._inst = new StorageManager();
        // 把全局唯一的实例返回给调用方，保证整个项目全程只会用到同一个存储管理对象，不会出现按多处实例化导致的数据读写冲突
        return this._inst;
    }


    // 写入纯字符串数据
    // 接收两个字符串参数，直接调用引擎原生 sys.localStorage.setItem， 原生平台下自动写入SQLite数据库持久化落盘
    // 把数据以键值对的形式存入本地持久化存储
    setStr(key: string, val: string) {
        sys.localStorage.setItem(key, val);
    }

    
    // 读取纯字符串数据
    // 调用 sys.localStorage.getItem，找不到数据时直接返回传入的默认值，避免返回null引发代码报错
    // 调用引擎接口读取对应key的存储内容，赋值给临时变量res
    // 做非空判断：如果读取结果是null（说明本地没有这个key的数据），就返回传入的默认空字符串，否则直接返回读取到的内容
    getStr(key: string, def = '') {
        const res = sys.localStorage.getItem(key);
        return res == null ? def : res;
    }


    // 写入JSON对象数据
    // 自动把传入的任意类型对象序列化为JSON字符串，再调用setStr存入，省去每次手动写序列化代码的步骤
    setObj(key: string, val: any) {
        this.setStr(key, JSON.stringify(val));
    }


    // 读取JSON对象数据
    // 先读出存储的字符串，自动反序列化为对象返回，用try-catch包裹解析逻辑，解析失败时返回默认空对象，防止数据损坏导致APP闪退
    getObj(key: string, def = {}) {
        const str = this.getStr(key);
        try {
            return JSON.parse(str);
        } catch {
            return def;
        }
    }


    // 删除指定数据
    // 调用 sys.localStorage.removeItem，彻底清除对应key的所有本地存储内容，用来实现素材、标签等数据的删除功能
    del(key: string) {
        sys.localStorage.removeItem(key);
    }
}



