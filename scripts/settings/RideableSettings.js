import * as FCore from "../CoreVersionComp.js";

import { RideableCompUtils, cWallHeight, cArmReach, cArmReachold, cLocknKey, cTagger, cDfredCE, cRoutingLib } from "../compatibility/RideableCompUtils.js";
import { RideableUtils, cModuleName, Translate} from "../utils/RideableUtils.js";
import { MountSelected, MountSelectedFamiliar, GrappleTargeted, UnMountSelected, ToggleMountselected, ToggleGrapplePlacementSelected, TogglePilotingSelected} from "../MountingScript.js";
import { cPlacementPatterns, cGrapplePlacements } from "../RidingScript.js";
import { SelectedToggleFollwing } from "../FollowingScript.js";

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
  
  game.settings.register(cModuleName, "useRidingHeight", {
	name: Translate("Settings.useRidingHeight.name"),
	hint: Translate("Settings.useRidingHeight.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true
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
  
  game.settings.register(cModuleName, "StopGrappleonEffectRemoval", {
	name: Translate("Settings.StopGrappleonEffectRemoval.name"),
	hint: Translate("Settings.StopGrappleonEffectRemoval.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: false
  });  
  
  let vChoices = {};
  
  for (let i = 0; i < cGrapplePlacements.length; i++) {
	  vChoices[cGrapplePlacements[i]] = Translate("Settings.GrappleplacementDefault.options." + cGrapplePlacements[i])
  }
  
  game.settings.register(cModuleName, "GrappleplacementDefault", {
	name: Translate("Settings.GrappleplacementDefault.name"),
	hint: Translate("Settings.GrappleplacementDefault.descrp"),
	scope: "world",
	config: true,
	type: String,
	choices: vChoices,
	default: cGrapplePlacements[0]
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
  
  game.settings.register(cModuleName, "FitRiderSizeFactor", {
	name: Translate("Settings.FitRiderSizeFactor.name"),
	hint: Translate("Settings.FitRiderSizeFactor.descrp"),
	scope: "world",
	config: true,
	type: Number,
	range: {
		min: 0,
		max: 1,
		step: 0.05
	},
	default: 0.65
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
  
  game.settings.register(cModuleName, "EnableFollowing", {
	name: Translate("Settings.EnableFollowing.name"),
	hint: Translate("Settings.EnableFollowing.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true,
	requiresReload: true
  });  
  
  //
  let vFollowOptions = {
	  "SimplePathHistory" : Translate("Settings.FollowingAlgorithm.options.SimplePathHistory")
  };
  
  if (RideableCompUtils.isactiveModule(cRoutingLib)) {
	  vFollowOptions[cRoutingLib] = Translate("Settings.FollowingAlgorithm.options." + cRoutingLib);
  }
  
  game.settings.register(cModuleName, "FollowingAlgorithm", {
	name: Translate("Settings.FollowingAlgorithm.name"),
	hint: Translate("Settings.FollowingAlgorithm.descrp"),
	scope: "world",
	config: game.settings.get(cModuleName, "EnableFollowing"),
	type: String,
	choices: vFollowOptions,
	default: Object.keys(vFollowOptions)[0]
  });  
  
  game.settings.register(cModuleName, "FollowingCombatBehaviour", {
	name: Translate("Settings.FollowingCombatBehaviour.name"),
	hint: Translate("Settings.FollowingCombatBehaviour.descrp"),
	scope: "world",
	config: game.settings.get(cModuleName, "EnableFollowing"),
	type: String,
	choices: {
		"stop" : Translate("Settings.FollowingCombatBehaviour.options.stop"),
		"resumeafter": Translate("Settings.FollowingCombatBehaviour.options.resumeafter"),
		"continue": Translate("Settings.FollowingCombatBehaviour.options.continue")
	},
	default: "stop"
  });  
  
  game.settings.register(cModuleName, "OnlyfollowViewed", {
	name: Translate("Settings.OnlyfollowViewed.name"),
	hint: Translate("Settings.OnlyfollowViewed.descrp"),
	scope: "world",
	config: game.settings.get(cModuleName, "EnableFollowing"),
	type: Boolean,
	default: false
  });  
  
  game.settings.register(cModuleName, "PreventFollowerStacking", {
	name: Translate("Settings.PreventFollowerStacking.name"),
	hint: Translate("Settings.PreventFollowerStacking.descrp"),
	scope: "world",
	config: game.settings.get(cModuleName, "EnableFollowing"),
	type: Boolean,
	default: false
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
	scope: "client",
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
  
   game.settings.register(cModuleName, "OnFollowerMovement", {
	name: Translate("Settings.OnFollowerMovement.name"),
	hint: Translate("Settings.OnFollowerMovement.descrp"),
	scope: "client",
	config: game.settings.get(cModuleName, "EnableFollowing"),
	type: String,
	choices: {
		"stopfollowing" : Translate("Settings.OnFollowerMovement.options.stopfollowing"),
		"updatedistance": Translate("Settings.OnFollowerMovement.options.updatedistance")
	},
	default: "stopfollowing"
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
  
  game.keybindings.register(cModuleName, "ToggleGrapplePlacement", {
    name: Translate("Keys.ToggleGrapplePlacement.name"),
    hint: Translate("Keys.ToggleGrapplePlacement.descrp"),
    onDown: () => { ToggleGrapplePlacementSelected(); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
  game.keybindings.register(cModuleName, "TogglePiloting", {
    name: Translate("Keys.TogglePiloting.name"),
    hint: Translate("Keys.TogglePiloting.descrp"),
    onDown: () => { TogglePilotingSelected(); },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
  
  game.keybindings.register(cModuleName, "ToggleFollowing", {
    name: Translate("Keys.ToggleFollowing.name"),
    hint: Translate("Keys.ToggleFollowing.descrp"),
	editable: [
      {
        key: "KeyF"
      }
    ],
    onDown: () => { SelectedToggleFollwing(); },
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
		
		/*
		if (!RideableCompUtils.isactiveModule(cRoutingLib)) {
			vnewHTML = `<p>${Translate("Titles.RequiresRL")}</p>`;
			
			pHTML.find('select[name="' + cModuleName + '.MountButtonDefaultPosition"]').closest(".form-group").after(vnewHTML);
		}
		*/
	}
});