import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

export class SceneManager {
    private static history: string[] = [];

    static goTo(sceneName: string) {
        const current = director.getScene()?.name;
        if (current) {
            SceneManager.history.push(current);
        }
        director.loadScene(sceneName);
    }

    static goBack() {
        const prev = SceneManager.history.pop();
        if (prev) {
            director.loadScene(prev);
        } else {
            console.warn('没有上一页了');
        }
    }
}


