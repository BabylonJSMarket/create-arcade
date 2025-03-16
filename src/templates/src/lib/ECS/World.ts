import { AbstractEngine, Engine, Scene } from "@babylonjs/core";
import { ComponentClass, System } from "./System";
import { Entity } from "./Entity";
import { Component } from "./Component";

export class World {
    entities: Map<String, Entity>;
    engine: AbstractEngine;
    scenes: any;
    currentScene: Scene;
    originalSceneData: any;
    sceneCode: any | undefined;
    isPaused: boolean = false;

    private componentCache: Map<
        string,
        { component: ComponentClass; system: any }
    > = new Map(); // Cache for components and their systems

    constructor(scene: Scene) {
        this.entities = new Map();
        this.currentScene = scene;
        this.engine = scene.getEngine();
    }

    async loadSceneData(
        sceneName: string,
        gameName: string,
        onSceneLoaded = null,
    ) {
        const scenePath = `/GameData/${gameName}/scenes/${sceneName}.json`;

        const response = await fetch(scenePath, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const sceneData = await response.json();
        // Load scene resources (e.g., meshes, textures, sounds)
        if (!sceneData) return;
        this.originalSceneData = sceneData;
        this.sceneCode = await this.loadSceneCode(sceneData);

        this.currentScene.executeWhenReady(() => {
            this.currentScene.onBeforeRenderObservable.addOnce(() => {
                this.engine.hideLoadingUI();
            });
        });
    }

    async loadSceneCode(data: any) {
        // Process entities and components
        const entities: any = {};
        const componentTypes = new Set();
        const systems: System[] = [];
        const components: Map<string, ComponentClass> = new Map();

        // 1. Load and cache component/system modules
        const requiredSystems: string[] = this.deriveRequiredSystems(
            new Set(
                Object.keys(data.entities).flatMap((entityName) =>
                    Object.keys(data.entities[entityName].components),
                ),
            ),
        ); //derive required systems, based on all components in the scene.

        // 2. Pre-import all components and their system.
        for (const componentType of new Set(
            Object.keys(data.entities).flatMap((entityName) =>
                Object.keys(data.entities[entityName].components),
            ),
        )) {
            try {
                const { component, system } =
                    await this.importComponentAndSystem(componentType);
                if (component) {
                    this.componentCache.set(componentType, {
                        component,
                        system,
                    });
                }
            } catch (error) {
                console.error(
                    `Failed to import component/system: ${componentType}`,
                    error,
                );
            }
        }

        //Process each entity and component
        for (const entityName in data.entities) {
            const entityData = data.entities[entityName];
            if (entityData)
                entities[entityName] = this.createEntity(entityName);

            for (const componentType in entityData.components) {
                const componentData = entityData.components[componentType];

                // Use cached component and create new instance.
                const cachedComponent = this.componentCache.get(componentType);
                if (cachedComponent && cachedComponent.component) {
                    components.set(componentType, cachedComponent.component);
                    entities[entityName].addComponent(
                        new cachedComponent.component(componentData),
                    );
                    componentTypes.add(componentType);
                } else {
                    console.error(`Failed to load component: ${componentType}`);
                }
            }
        }

        // 3. Instantiate Systems - AFTER all components are loaded
        for (const systemName of requiredSystems) {
            const cachedComponent = this.componentCache.get(
                systemName.replace("System", "Component"),
            ); //Look for the component for the system

            if (cachedComponent && cachedComponent.system) {
                const system = new cachedComponent.system(this, [
                    cachedComponent.component,
                ]); //Pass in the component class to the system.
                systems.push(system);
            } else {
                console.warn(`System not found in cache for: ${systemName}`); //Handle missing system appropriately
            }
        }

        return { entities, componentTypes, systems, components }; // Return processed scene data
    }

    // Modified import function to handle both component and system from a single file
    private async importComponentAndSystem(
        componentType: string,
    ): Promise<{ component: Component; system: System }> {
        try {
            const module = await import(
                /* @vite-ignore */ `../Components/${componentType}.ts`
            );

            const component = module[`${componentType}Component`] as Component;
            const system = module[`${`${componentType}System`}`];
            return { component, system };
        } catch (error) {
            console.error(
                `Failed to import component/system: ${componentType}`,
                error,
            );
            return { component: null, system: null };
        }
    }

    updateSystems(deltaTime: number) {
        const fps = document.getElementById("fps");
        if (!this.sceneCode || !this.currentScene.isReady()) return;
        this.sceneCode.systems.forEach((system: System) => {
            if (system.update) system.update(deltaTime);
        });
        if (this.currentScene && fps)
            fps.innerHTML = this.currentScene.getEngine().getFps().toFixed();
    }

    deriveRequiredSystems(componentTypes: Set<string>): string[] {
        const requiredSystems = new Set<string>();
        for (const componentType of componentTypes) {
            const systemName = componentType.replace("Component", "System");
            requiredSystems.add(systemName);
        }
        return Array.from(requiredSystems);
    }

    search(name: string[] | string): Entity | Entity[] | undefined {
        if (Array.isArray(name)) {
            return name
                .map((n) => {
                    return this.entities.get(n);
                })
                .filter((e) => !!e);
        }
        return this.entities.get(name);
    }

    // Refreshes the entities this system is concerned with
    entitiesWith(componentClasses: ComponentClass[]): Entity[] {
        const entities = this.entities.values();
        const e = Array.from(entities).filter((entity: Entity) =>
            componentClasses.every((comp) => entity.hasComponent(comp)),
        );
        const m = new Map();
        e.forEach((entity) => m.set(entity.name, entity));
        return e;
    }

    createEntity(name: string) {
        const entity = new Entity(name);
        this.entities.set(entity.name, entity);
        return entity;
    }

    removeEntity(entity: Entity) {
        this.entities.delete(entity.name);
    }

    serialize() {
        const entitiesData = [];
        for (const entity of this.entities) {
            entitiesData.push(entity.serialize());
        }
        return entitiesData;
    }
}
