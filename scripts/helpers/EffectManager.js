import * as FCore from "../CoreVersionComp.js";

import { RideableUtils, cModuleName } from "../utils/RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { RideableCompUtils, cDfredCE, cGrabbedEffectName } from "../compatibility/RideableCompUtils.js";

const cMountedPf2eEffectID = "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp"; //Mounted effects of Pf2e system
const cGrappledPf2eEffectID = "Compendium.pf2e.conditionitems.Item.kWc1fhmv9LBiTuei"; //Grappled effects of Pf2e system

class EffectManager {
	
	//DECLARATIONS
	static async applyMountingEffects(pRider, pRidden) {} //gives the rider all pEffects
	
	static async RecheckforMountEffects(pRidden) {} //rechecks the effect pRidden gains from its riders
	
	static async applyRideableEffects(pTarget, pEffectNames, pInfos = {}) {} //applies effects defined by pEffects to pTarget
	
	static async removeRideableEffects(pRider, pInfos = {}) {} //remove all effects flaged as Rideable effect
	
	//Hooks
	
	static onRiderMount(pRider, pRidden, pRidingOptions) {} //handle creation of mounting effects
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {} //handle deletion of mounting effects
	
	static onRideableEffectDeletion(pEffect, pActor, pInfos, pUserID){} //called when a rideable effect is deleted
	
	//IMPLEMENTATION
	static async applyMountingEffects(pRider, pRidden, pRidingOptions) {
		//Effects applied to pRider
		let vRiderEffectNames = [];
		
		if (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration"))) {
			//for riders effects
			await EffectManager.removeRideableEffects(pRider, {grappleEffect : pRidingOptions.Grappled});
			
			if (pRidingOptions.MountingEffectsOverride) {
				if (pRidingOptions.MountingEffectsOverride instanceof Array) {
					vRiderEffectNames = pRidingOptions.MountingEffectsOverride;
				}
			}
			else {
				if (!pRidingOptions.Familiar) {
					if (!pRidingOptions.Grappled) {
						vRiderEffectNames = RideableFlags.MountingEffects(pRidden);
						
						if (!RideableFlags.OverrideWorldMEffects(pRidden)) {
							//World Mounting effects
							vRiderEffectNames = vRiderEffectNames.concat(RideableUtils.CustomWorldRidingEffects());
							
							//Standard mounting effect
							if (RideableUtils.isPf2e() && game.settings.get(cModuleName, "RidingSystemEffects")) {
								vRiderEffectNames.push(cMountedPf2eEffectID);
							}
						}
						
						if (RideableFlags.SelfApplyCustomEffects(pRider)) {
							vRiderEffectNames.push(RideableFlags.MountingEffects(pRider));
						}
					}
					else {
						if (game.settings.get(cModuleName, "GrapplingSystemEffects")) {
							if (RideableUtils.isPf2e()) {
								vRiderEffectNames.push(cGrappledPf2eEffectID);
							}
							
							if (RideableCompUtils.isactiveModule(cDfredCE)) {
								vRiderEffectNames.push(cGrabbedEffectName);
							}
						}
					}
				}
			}
			
			EffectManager.applyRideableEffects(pRider, vRiderEffectNames, {grappleEffect : pRidingOptions.Grappled});
		}
	}
	
	static async RecheckforMountEffects(pRidden, pRidingOptions) {
		//Effects applied to Mount
		let vMountEffectNames = [];
		
		if ((pRidden.documentName == "Token") && (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")))) {
			await EffectManager.removeRideableEffects(pRidden, {forMountEffect : true});
			
			let vRiders = RideableFlags.RiderTokens(pRidden).filter(vRider => !(RideableFlags.isGrappled(vRider)));
			
			for (let i = 0; i < vRiders.length; i++) {
				vMountEffectNames = vMountEffectNames.concat(RideableFlags.forMountEffects(vRiders[i]));
			}
			
			EffectManager.applyRideableEffects(pRidden, vMountEffectNames, {forMountEffect : true});
		}
	} 
	
	static async applyRideableEffects(pTarget, pEffectNames, pInfos) {
		if (pEffectNames.length > 0) {
			let vEffectDocuments;
			
			if (RideableUtils.isPf2e()) {
				vEffectDocuments = await RideableUtils.ApplicableEffects(pEffectNames);
				
				let vEffects = await pTarget.actor.createEmbeddedDocuments("Item", vEffectDocuments);
				
				for (let i = 0; i < vEffects.length; i++) {
					await RideableFlags.MarkasRideableEffect(vEffects[i], pInfos.forMountEffect);
				}
			}
			
			if (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")) {
				vEffectDocuments = await RideableCompUtils.FilterEffects(pEffectNames);
				
				RideableCompUtils.AddDfredEffect(vEffectDocuments, pTarget, pInfos);
			}
		}
	}
	
	static async removeRideableEffects(pRider, pInfos = {}) {
		if (RideableUtils.isPf2e()) {
			await pRider.actor.deleteEmbeddedDocuments("Item", pRider.actor.itemTypes.effect.concat(pRider.actor.itemTypes.condition).filter(vElement => RideableFlags.isRideableEffect(vElement, pInfos.forMountEffect)).map(vElement => vElement.id));
		}
		
		if (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")) {
			await RideableCompUtils.RemoveRideableDfredEffect(pRider.actor.effects.map(vElement => vElement), pRider, pInfos);
		}
	}
	
	//Hooks
	static onRiderMount(pRider, pRidden, pRidingOptions = {}) {
		if (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration"))) {
			EffectManager.applyMountingEffects(pRider, pRidden, pRidingOptions); //add additional systems here if necessary
			
			EffectManager.RecheckforMountEffects(pRidden, pRidingOptions);
		}
	}
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {
		if (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration"))) {
			EffectManager.removeRideableEffects(pRider, {grappleEffect : pRidingOptions.Grappled}); //add additional systems here if necessary
			
			EffectManager.RecheckforMountEffects(pRidden, pRidingOptions);
		}
	}
	
	static onRideableEffectDeletion(pEffect, pActor, pInfos, pUserID){
		let vRidingEffect = false;
		let vGrappleEffect = false;
		let vforMountEffect = false;
		
		if ((pEffect.flags?.core?.sourceId == cGrappledPf2eEffectID) || (pEffect.name == cGrabbedEffectName)) {
			vGrappleEffect = true;
		}
		
		if (pEffect.origin?.includes("grapple")) {
			vGrappleEffect = true;
		}
		
		switch (RideableFlags.IsActorEffect(pActor, pEffect)) {
			case "riding":
				vRidingEffect = true;
				break;
			case "grapple":
				vGrappleEffect = true;
				break;
			case "forMount":
				vforMountEffect = true;
				break;
		}
		
		Hooks.call(cModuleName + ".RideableEffectDeletion", pEffect, game.users.get(pUserID), {RidingEffect : vRidingEffect, GrappleEffect : vGrappleEffect, forMountEffect : vforMountEffect});
	}
}


Hooks.on("ready", function() {
	/*
	if (RideableUtils.isPf2e()) {
		Hooks.on("deleteItem", (pItem, pInfos, pUserID) => {
			if (["condition", "effect"].includes(pItem.type)) {
				if (RideableFlags.isRideableEffect(pItem)) {
					EffectManager.onRideableEffectDeletion(pItem, pItem.parent, pInfos, pUserID);
				}
			}
		});
	}
	*/
	
	Hooks.on("preDeleteActiveEffect", (pEffect, pInfos, pUserID) => {
		if (pEffect.origin?.includes(cModuleName) || RideableFlags.IsActorEffect(pEffect.parent, pEffect)) {
			EffectManager.onRideableEffectDeletion(pEffect, pEffect.parent, pInfos, pUserID);
		}
	});
});

export { EffectManager }

//Hooks

/*
Hooks.once("init", () => {
	if (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration"))) {
		Hooks.on(cModuleName + "." + "Mount", (...args) => EffectManager.onRiderMount(...args));

		Hooks.on(cModuleName + "." + "UnMount", (...args) => EffectManager.onRiderUnMount(...args));
	}
});
*/