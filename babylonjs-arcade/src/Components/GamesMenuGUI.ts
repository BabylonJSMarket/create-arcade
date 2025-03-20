import { Mesh } from "@babylonjs/core";

import { Component, World, Entity, System } from "~/lib/ECS";
import {
  AdvancedDynamicTexture,
  TextBlock,
  Control,
  Rectangle,
  StackPanel,
  Container,
  Button,
} from "@babylonjs/gui";

import { Color3, Vector3, Scene } from "@babylonjs/core";

interface MenuButton {
  text: string;
  action: string;
}

export interface GamesMenuGUIData {
  options: MenuButton[];
}

export class GamesMenuGUIComponent extends Component {
  options: MenuButton[];
  ui: AdvancedDynamicTexture | undefined;
  buttons: Map<string, Control> = new Map();
  loading = false;

  constructor(data: GamesMenuGUIData) {
    super(data);
    this.options = data.options;
  }
}

export class GamesMenuGUISystem extends System {
  constructor(world: World, componentClasses = [GamesMenuGUIComponent]) {
    super(world, componentClasses);
    console.log("GamesMenuGUI initialized");
  }
  processEntity(entity: Entity, deltaTime: number) {
    const menuComponent = entity.getComponent(GamesMenuGUIComponent);
    if (!menuComponent.ui && !menuComponent.loading) {
      this.createGamesMenuGUI(menuComponent);
    }
  }

  createGamesMenuGUI(menuComponent: GamesMenuGUIComponent) {
    menuComponent.ui = AdvancedDynamicTexture.CreateFullscreenUI(
      "GamesMenu_UI",
      true,
      this.scene,
    );
    const stack = new StackPanel("StackPanel");
    menuComponent.ui.addControl(stack);
    menuComponent.loading = true;
    const scene = this.scene;
    const buttonWidth = 200;
    const buttonHeight = 100;
    const buttonColor = new Color3(0.5, 0.5, 0.5);
    const buttonMargin = 0.1;
    const buttonCount = menuComponent.options.length;
    const totalHeight =
      buttonCount * (buttonHeight + buttonMargin) - buttonMargin;
    const buttonY = totalHeight / 2 - buttonHeight / 2;
    for (let i = 0; i < buttonCount; i++) {
      const option = menuComponent.options[i];
      const button = this.createButton(
        scene,
        "Button" + i,
        option.text,
        option.action,
        new Vector3(0, buttonY - i * (buttonHeight + buttonMargin), 0),
        buttonWidth,
        buttonHeight,
        buttonColor,
        buttonCount,
      );
      stack.addControl(button);
    }
  }

  createButton(
    scene: Scene,
    name: string,
    text: string,
    action: string,
    position: Vector3,
    width: number,
    height: number,
    color: Color3,
    size = 0,
  ) {
    let label: TextBlock;
    // If the label doesn't exist, create a new one
    const bg = new Button(name + "bg");
    // const l = variableToTrack.length;
    bg.width = `${width}px`;
    bg.height = `${height}px`;
    bg.background = "black";
    bg.thickness = 0;
    bg.paddingLeft = "15px";
    bg.paddingBottom = "15px";
    bg.cornerRadius = 5;
    bg.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    label = new TextBlock();
    label.text = text; //variableToTrack;
    label.color = "white";
    label.fontSize = 30;
    label.width = `${width}px`;
    label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    label.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    label.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    bg.addControl(label);
    // bg.top = `${size * height}px`; // Stack labels vertically
    bg.onPointerUpObservable.add(function () {
      // Add hover effect
      console.log("Button: " + action);
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      const game = params.get("game");
      let loc;
      if (game) {
        loc = "game=" + game + "&scene=" + action;
      } else {
        loc = "game=" + action;
      }
      window.location.search = loc;
    });
    return bg;
  }
}
