import { Entity } from "./Entity";
import { World } from "./World";
import { Scene } from "@babylonjs/core";

export type ComponentClass = new (...args: any[]) => any;

export abstract class System {
    protected entities: Entity[] = [];
    protected componentClasses: ComponentClass[];
    protected scene: Scene;
    protected world: World;
    public isPauseable: boolean = false;

    constructor(world: World, componentClasses: ComponentClass[]) {
        this.world = world;
        this.scene = world.currentScene;
        this.componentClasses = componentClasses;
    }

    // Updates each entity this system is concerned with
    update(deltaTime: number): void {
        if (this.isPauseable && this.world.isPaused) return;
        const entities = this.world.entitiesWith(this.componentClasses);
        for (const entity of entities) {
            if (this.processEntity) this.processEntity(entity, deltaTime);
        }
    }

    // Abstract method to process each entity. This should be implemented by subclasses.
    protected abstract processEntity(entity: Entity, deltaTime: number): void;
}
