import { _decorator, Component } from 'cc';
import { StorageManager } from './common/StorageManager';
import { AllData, STORAGE_KEY, createDefaultData } from './common/DataTypes';
const { ccclass } = _decorator;

@ccclass('GameStartup')
export class GameStartup extends Component {
    protected onLoad(): void {
        
        console.log('————脚本已开始执行————');

        const testData: AllData = createDefaultData();
        testData.tagList = [
                { id:1, name:'风景'},
                { id:2, name:'人物'},
                { id:3, name:'建筑'}
            ];
        testData.nextIds.tag = 4;

        testData.materialList = [
            { id:1, name: 'textures/bag/spriteFrame'}
        ];
        testData.nextIds.material = 2;

        StorageManager.inst.setObj(STORAGE_KEY, testData);
    }
}


