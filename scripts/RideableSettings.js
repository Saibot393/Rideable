import { RideableUtils, cModuleName} from "./RideableUtils.js";
import { MountSelected, UnMountSelected } from "./MountingScript.js";

Hooks.once("init", () => {  
  //Settings
  game.settings.register(cModuleName, "RidingHeight", {
	name: "Riding height",
	hint: "The z-height which a riding token has compared to its mount (recommended to be above 0)",
	scope: "world",
	config: true,
	type: Number,
	default: "5"
  });

  game.settings.register(cModuleName, "MountingDistance", {
	name: "Mounting distance",
	hint: "The maximum distance a token can have to its mounting target (0 for an unlimited range)",
	scope: "world",
	config: true,
	type: Number,
	default: "15"
  });
  
  game.settings.register(cModuleName, "BorderDistance", {
	name: "Border to border distance",
	hint: "If the mounting distance should be calculated from the tokens border instead of the middle point (only works correctly for circular/square tokens)",
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  });
  
  game.settings.register(cModuleName, "RiderMovement", {
	name: "Rider movement",
	hint: "What should happen if a riding token tries to move on its own",
	scope: "world",
	config: true,
	type: String,
	choices: {
		"RiderMovement-disallow": "Prevent movement",
		"RiderMovement-dismount": "Unmount rider"
	},
	default: "RiderMovement-disallow"
  });
  
  game.settings.register(cModuleName, "RidingSystemEffects", {
	name: "Apply \"Mounted\" effect",
	hint: "If a token starts riding, a system dependent effect will be applied to the token (only works if the game system has a known \"Mounted\" effect. Compatible systems: Pf2e)",
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  });  
  
  game.settings.register(cModuleName, "RideableTag", {
	name: "Mounts require \"Rideable\" tag",
	hint: "Allows only tokens which have the 'Rideable' tag to be ridden (the \"Rideable\" tag has to be manually added under settings>Pathfinder 2nd Edition>Manage Honebrew Elements>Creature Traits",
	scope: "world",
	config: RideableUtils.isPf2e(),
	type: Boolean,
	default: false
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