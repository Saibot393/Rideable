import { RideableUtils, cModuleName} from "./RideableUtils.js";
import { MountSelected, UnMountSelected } from "./MountingScript.js";

Hooks.once("init", () => {  
  //Settings
  game.settings.register("Rideable", "mySetting", {
	name: "Register a Module Setting with Choices",
	hint: "A description of the registered setting and its behavior.",
	scope: "client",
	config: RideableUtils.isPf2e,
	type: String,
	choices: {
	"a": "Option A",
	"b": "Option B"
	},
	default: "a",
	onChange: value => console.log(value)
  });

  game.settings.register("Rideable", "mySetting2", {
	name: "Register a Module Setting with Choices",
	hint: "A description of the registered setting and its behavior.",
	scope: "client",
	config: !RideableUtils.isPf2e,
	type: String,
	choices: {
	"a": "Option A",
	"b": "Option B"
	},
	default: "a",
	onChange: value => console.log(value)
  });
  //Keys
  game.keybindings.register(cModuleName, "Mount", {
    name: "Mount",
    hint: "Mount hovered Token",
    editable: [
      {
        key: "KeyM"
      }
    ],
    onDown: () => { MountSelected(true); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
  game.keybindings.register(cModuleName, "UnMount", {
    name: "UnMount",
    hint: "UnMount controlled Tokens",
    editable: [
      {
        key: "KeyN"
      }
    ],
    onDown: () => { UnMountSelected(); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
});

Hooks.on("ready", function() {
  console.log("---Test Check---");
});