import { _decorator, Component } from 'cc';
import { StorageManager } from './StorageManager';
const { ccclass } = _decorator;

@ccclass('GameStartup')
export class GameStartup extends Component {
    protected onLoad(): void {
        
        console.log('————脚本已开始执行————');

        // 首次写入测试数据
        const testData = {
            materialList:[{id:1, name:'测试素材'}],
            tagList:[],
            themeList:[],
            artworkList:[]
        };

        StorageManager.inst.setObj('allData', testData);
        console.log('【导入成功】已存入测试数据');


        // const defaultData = {
        //     materialList: [],
        //     tagList: [],
        //     themeList: [],
        //     artworkList: []
        // };

        const result = StorageManager.inst.getObj('allData',{});
        console.log('【读取结果】：', JSON.stringify(result));
    }
}


