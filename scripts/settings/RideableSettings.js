import * as FCore from "../CoreVersionComp.js";

import { RideableCompUtils, cWallHeight, cArmReach, cArmReachold, cLocknKey, cTagger, cDfredCE } from "../compatibility/RideableCompUtils.js";
import { RideableUtils, cModuleName, Translate} from "../utils/RideableUtils.js";
import { MountSelected, MountSelectedFamiliar, GrappleTargeted, UnMountSelected, ToggleMountselected} from "../MountingScript.js";

Hooks.once("init", () => {  // game.settings.get(cModuleName, "")
  //Settings
  game.settings.register(cModuleName, "defaultRideable", {
	name: Translate("Settings.defaultRideable.name"),
	hint: Translate("Settings.defaultRideable.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  }); 
  
  game.settings.register(cModuleName, "allowTileRiding", {
	name: Translate("Settings.allowTileRiding.name"),
	hint: Translate("Settings.allowTileRiding.descrp"),
	scope: "world",
	config: FCore.Fversion() > 10,
	type: Boolean,
	default: false
  }); 
  
  game.settings.register(cModuleName, "allowMountingonEntering", {
	name: Translate("Settings.allowMountingonEntering.name"),
	hint: Translate("Settings.allowMountingonEntering.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  }); 
  
  game.settings.register(cModuleName, "LocknKeyintegration", {
	name: Translate("Settings.LocknKeyintegration.name"),
	hint: Translate("Settings.LocknKeyintegration.descrp"),
	scope: "world",
	config: RideableCompUtils.isactiveModule(cLocknKey),
	type: Boolean,
	default: false
  });   
  
  game.settings.register(cModuleName, "DFredsEffectsIntegration", {
	name: Translate("Settings.DFredsEffectsIntegration.name"),
	hint: Translate("Settings.DFredsEffectsIntegration.descrp"),
	scope: "world",
	config: RideableCompUtils.isactiveModule(cDfredCE) && !RideableUtils.isPf2e(),
	type: Boolean,
	default: false,
	requiresReload: true
  }); 
  
  game.settings.register(cModuleName, "TaggerMountingIntegration", {
	name: Translate("Settings.TaggerMountingIntegration.name"),
	hint: Translate("Settings.TaggerMountingIntegration.descrp"),
	scope: "world",
	config: RideableCompUtils.isactiveModule(cTagger),
	type: Boolean,
	default: false
  }); 
  
  game.settings.register(cModuleName, "RidingHeight", {
	name: Translate("Settings.RidingHeight.name"),
	hint: Translate("Settings.RidingHeight.descrp"),
	scope: "world",
	config: true,
	type: Number,
	default: "5"
  });
  
  game.settings.register(cModuleName, "useRiddenTokenHeight", {
	name: Translate("Settings.useRiddenTokenHeight.name"),
	hint: Translate("Settings.useRiddenTokenHeight.descrp"),
	scope: "world",
	config: RideableCompUtils.isactiveModule(cWallHeight),
	type: Boolean,
	default: true
  });

  game.settings.register(cModuleName, "MountingDistance", {
	name: Translate("Settings.MountingDistance.name"),
	hint: Translate("Settings.MountingDistance.descrp"),
	scope: "world",
	config: true,
	type: Number,
	default: "15"
  });
  
  game.settings.register(cModuleName, "UseArmReachDistance", {
	name: Translate("Settings.UseArmReachDistance.name"),
	hint: Translate("Settings.UseArmReachDistance.descrp"),
	scope: "world",
	config: (RideableCompUtils.isactiveModule(cArmReach) || RideableCompUtils.isactiveModule(cArmReachold)),
	type: Boolean,
	default: false
  });
  
  game.settings.register(cModuleName, "BorderDistance", {
	name: Translate("Settings.BorderDistance.name"),
	hint: Translate("Settings.BorderDistance.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
  });
  
  game.settings.register(cModuleName, "MaxRiders", {
	name: Translate("Settings.MaxRiders.name"),
	hint: Translate("Settings.MaxRiders.descrp"),
	scope: "world",
	config: true,
	type: Number,
	default: -1
  });
  
  game.settings.register(cModuleName, "RiderRotation", {
	name: Translate("Settings.RiderRotation.name"),
	hint: Translate("Settings.RiderRotation.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  });   
  
  game.settings.register(cModuleName, "RidingSystemEffects", {
	name: Translate("Settings.RidingSystemEffects.name"),
	hint: Translate("Settings.RidingSystemEffects.descrp"),
	scope: "world",
	config: RideableUtils.isPf2e(),
	type: Boolean,
	default: true
  }); 

  game.settings.register(cModuleName, "CustomRidingEffects", {
	name: Translate("Settings.CustomRidingEffects.name"),
	hint: Translate("Settings.CustomRidingEffects.descrp"),
	scope: "world",
	config: RideableUtils.isPf2e() || game.settings.get(cModuleName, "DFredsEffectsIntegration"),
	type: String,
	default: ""
  });    
  
  game.settings.register(cModuleName, "RideableTag", {
	name: Translate("Settings.RideableTag.name"),
	hint: Translate("Settings.RideableTag.descrp"),
	scope: "world",
	config: RideableUtils.isPf2e(),
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "FamiliarRiding", {
	name: Translate("Settings.FamiliarRiding.name"),
	hint: Translate("Settings.FamiliarRiding.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "FamiliarRidingFirstCorner", {
	name: Translate("Settings.FamiliarRidingFirstCorner.name"),
	hint: Translate("Settings.FamiliarRidingFirstCorner.descrp"),
	scope: "world",
	config: true,
	type: String,
	choices: {
		0: Translate("Settings.FamiliarRidingFirstCorner.options.tl"),
		1: Translate("Settings.FamiliarRidingFirstCorner.options.tr"),
		2: Translate("Settings.FamiliarRidingFirstCorner.options.bl"),
		3: Translate("Settings.FamiliarRidingFirstCorner.options.br")
	},
	default: 0
  });
  
  game.settings.register(cModuleName, "Grappling", {
	name: Translate("Settings.Grappling.name"),
	hint: Translate("Settings.Grappling.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "GrapplingSystemEffects", {
	name: Translate("Settings.GrapplingSystemEffects.name"),
	hint: Translate("Settings.GrapplingSystemEffects.descrp"),
	scope: "world",
	config: RideableUtils.isPf2e() || game.settings.get(cModuleName, "DFredsEffectsIntegration"),
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "PreventEnemyRiding", {
	name: Translate("Settings.PreventEnemyRiding.name"),
	hint: Translate("Settings.PreventEnemyRiding.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "FitRidersize", {
	name: Translate("Settings.FitRidersize.name"),
	hint: Translate("Settings.FitRidersize.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "RiderMovementworlddefault", {
	name: Translate("Settings.RiderMovementworlddefault.name"),
	hint: Translate("Settings.RiderMovementworlddefault.descrp"),
	scope: "world",
	config: true,
	type: String,
	choices: {
		"RiderMovement-disallow": Translate("Settings.RiderMovement.options.disallow"),
		"RiderMovement-dismount": Translate("Settings.RiderMovement.options.dismount"),
		"RiderMovement-moveridden": Translate("Settings.RiderMovement.options.moveridden")
	},
	default: "RiderMovement-disallow"
  });
  
  game.settings.register(cModuleName, "MountButtonDefaultPosition", {
	name: Translate("Settings.MountButtonDefaultPosition.name"),
	hint: Translate("Settings.MountButtonDefaultPosition.descrp"),
	scope: "world",
	config: true,
	type: String,
	choices: {
		"none": Translate("Settings.MountButtonPosition.options.none"),
		"left": Translate("Settings.MountButtonPosition.options.left"),
		"right": Translate("Settings.MountButtonPosition.options.right")
	},
	default: "none"
  });
  
  //client settings
  
  game.settings.register(cModuleName, "RiderMovement", {
	name: Translate("Settings.RiderMovement.name"),
	hint: Translate("Settings.RiderMovement.descrp"),
	scope: "client",
	config: true,
	type: String,
	choices: {
		"RiderMovement-worlddefault": Translate("Settings.RiderMovement.options.worlddefault"),
		"RiderMovement-disallow": Translate("Settings.RiderMovement.options.disallow"),
		"RiderMovement-dismount": Translate("Settings.RiderMovement.options.dismount"),
		"RiderMovement-moveridden": Translate("Settings.RiderMovement.options.moveridden")
	},
	default: "RiderMovement-worlddefault"
  });
  
  game.settings.register(cModuleName, "MountButtonPosition", {
	name: Translate("Settings.MountButtonPosition.name"),
	hint: Translate("Settings.MountButtonPosition.descrp"),
	scope: "world",
	config: true,
	type: String,
	choices: {
		"default" : Translate("Settings.MountButtonPosition.options.default"),
		"none": Translate("Settings.MountButtonPosition.options.none"),
		"left": Translate("Settings.MountButtonPosition.options.left"),
		"right": Translate("Settings.MountButtonPosition.options.right")
	},
	default: "default"
  });
  
  game.settings.register(cModuleName, "MessagePopUps", {
	name: Translate("Settings.MessagePopUps.name"),
	hint: Translate("Settings.MessagePopUps.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false
  });  
  
   game.settings.register(cModuleName, "OnlyownedMessagePopUps", {
	name: Translate("Settings.OnlyownedMessagePopUps.name"),
	hint: Translate("Settings.OnlyownedMessagePopUps.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false
  });  
  
  //Keys
  game.keybindings.register(cModuleName, "Mount", {
    name: Translate("Keys.Mount.name"),
    hint: Translate("Keys.Mount.descrp"),
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
    name: Translate("Keys.UnMount.name"),
    hint: Translate("Keys.UnMount.descrp"),
    editable: [
      {
        key: "KeyN"
      }
    ],
    onDown: () => { UnMountSelected(); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
  game.keybindings.register(cModuleName, "MountFamiliar", {
    name: Translate("Keys.MountFamiliar.name"),
    hint: Translate("Keys.MountFamiliar.descrp"),
    editable: [
      {
        key: "KeyJ"
      }
    ],
    onDown: () => { MountSelectedFamiliar(true); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
   game.keybindings.register(cModuleName, "GrappleTarget", {
    name: Translate("Keys.GrappleTarget.name"),
    hint: Translate("Keys.GrappleTarget.descrp"),
    editable: [
      {
        key: "KeyH"
      }
    ],
    onDown: () => { GrappleTargeted(true); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
   game.keybindings.register(cModuleName, "ToggleMount", {
    name: Translate("Keys.ToggleMount.name"),
    hint: Translate("Keys.ToggleMount.descrp"),
    onDown: () => { ToggleMountselected(true); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
});

//Hooks
Hooks.on("renderSettingsConfig", (pApp, pHTML, pData) => {
	//add a few titles	
	let vnewHTML;
	
	if (game.user.isGM) {
		//first world setting
		vnewHTML = `<h3 class="border">${Translate("Titles.WorldSettings")}</h3>`;
		 
		pHTML.find('input[name="' + cModuleName + '.defaultRideable"]').closest(".form-group").before(vnewHTML);
		
		//first client setting
		vnewHTML = `
					<hr>
					<h3 class="border">${Translate("Titles.ClientSettings")}</h3>
					`;
		 
		pHTML.find('select[name="' + cModuleName + '.RiderMovement"]').closest(".form-group").before(vnewHTML);
	}
});