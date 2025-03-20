import {
  AdvancedDynamicTexture,
  TextBlock,
  Control,
  Rectangle,
  StackPanel,
  Container,
  TextWrapping,
  TextWrapper,
} from "@babylonjs/gui";
import { Scene } from "@babylonjs/core";
import { DebugComponent } from "../Components/Debug";
import { Entity } from "~/lib/ECS";

export class LabelStack {
  private labels: Map<string, TextBlock>;
  private ui: StackPanel;
  private debugComponent: DebugComponent;
  private entity: Entity;
  private column: number = 1;

  constructor(entity: Entity, scene: Scene, container: StackPanel) {
    container;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.height = `${window.innerHeight}px`;
    const control = new StackPanel("CONTROL");
    this.ui = control;
    container.addControl(control);
    control.spacing = 2;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.width = `250px`;
    container.paddingTop = "4px";
    this.labels = new Map<string, TextBlock>();
    const debugComponent = entity.getComponent(DebugComponent);
    this.debugComponent = debugComponent;
    this.entity = entity;
  }

  fromObject(obj) {
    const a = JSON.stringify(obj, null, 2).replace(/"|\{|\}/g, "");
    return a;
  }

  public unpack(variableToTrack: string | array | Object): string {
    if (Array.isArray(variableToTrack)) {
      return variableToTrack.join(", ");
    } else if (typeof variableToTrack === "object") {
      return this.fromObject(variableToTrack);
    } else {
      return variableToTrack;
    }
  }

  // Adds a new label to the stack, or updates the existing label with new value
  public addLabel(n: string, variableToTrack: string | array | Object) {
    let label: TextBlock;
    const entity = this.entity;
    const name = `${entity.name}_${n}`;
    const text = name + ": " + this.unpack(variableToTrack);
    if (this.labels.has(name)) {
      // If the label already exists, just update its text
      label = this.labels.get(name)!;
      label.text = text;
      const l = label.text.length;
      label.width = `250px`;
    } else {
      // If the label doesn't exist, create a new one
      const bg = new Rectangle(name + "_bg");
      bg.background = this.debugComponent.bgColor;
      bg.thickness = 0;
      bg.paddingLeft = "15px";
      bg.paddingTop = "5px";
      bg.cornerRadius = 5;
      bg.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      label = new TextBlock();
      label.width = `${window.innerWidth / 3 - 20}px`;
      // label.parent ?? label.parent.width = label.width;
      label.text = text;
      const l = label.text.length;
      bg.adaptHeightToChildren = true;
      label.fontFamily = "Monospace";
      // bg.width = `${l * 12}px`;
      label.color = this.debugComponent.textColor;
      label.fontSize = 15;
      label.paddingLeft = "5px";
      label.paddingRight = "5px";
      label.paddingTop = "5px";
      label.paddingBottom = "5px";
      label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      label.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      label.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      label.textWrapping = TextWrapping.WordWrap;
      label.text = name + ": " + this.unpack(variableToTrack);
      bg.addControl(label);
      bg.backgroundColor = this.debugComponent.bgColor || [0, 0, 0];
      bg.alpha = this.debugComponent.bgAlpha || 1;
      this.ui.addControl(bg);
      this.ui.adaptHeightToChildren = true;
      this.labels.set(name, label);
      label.resizeToFit = true;
    }
  }

  // Removes a label from the stack by its name
  public removeLabel(name: string) {
    if (this.labels.has(name)) {
      const label = this.labels.get(name)!;
      this.ui.removeControl(label);
      this.labels.delete(name);

      // Re-adjust the positions of the labels in the stack
      let index = 0;
      this.labels.forEach((lbl) => {
        lbl.top = `${index * 30}px`;
        index++;
      });
    }
  }

  public update = (name, value) => {
    if (this.labels.has(name)) {
      this.labels.set(name, value);
    }
  };
}
