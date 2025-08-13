import colors from "picocolors";

const {
  blue,
  blueBright,
  cyan,
  green,
  greenBright,
  magenta,
  red,
  redBright,
  reset,
  yellow,
} = colors;

type ColorFunc = (str: string | number) => string;

type Framework = {
  name: string;
  display: string;
  color: ColorFunc;
  variants: FrameworkVariant[];
};
type FrameworkVariant = {
  name: string;
  display: string;
  color: ColorFunc;
  customCommand?: string;
};

export default [
  {
    name: "default",
    display: "Basic ECS Template",
    color: blue,
  },
  {
    name: "ThirdPerson",
    display: "Third Person Template",
    color: yellow,
  },
  {
    name: "FirstPerson",
    display: "First Person Template",
    color: green,
  },
];
