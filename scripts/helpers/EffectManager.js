import { RideableUtils, cModuleName } from "../utils/RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";

const cMountedPf2eEffectID = "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp"; //Mounted effects of Pf2e system

var vSystemRidingEffect = null; //saves the systems mounting effects (if any)

class EffectManager {
	//DECLARATIONS
	static async preloadEffects() {} //preloads effects to make things smoother
	
	static getSystemMountingEffect() {} //returns an appropiate Mounting effect if the game system has one
	
	//Hooks
	static onRiderMount(pRider, pRidden, pRidingOptions) {} //handle creation of mounting effects
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {} //handle deletion of mounting effects
	
	//IMPLEMENTATION
	static async preloadEffects() {
		if (RideableUtils.isPf2e()) {
			vSystemRidingEffect = (await fromUuid(cMountedPf2eEffectID)).toObject();
		} 
	}
	static getSystemMountingEffect() {
		
		if (vSystemRidingEffect) {
			return vSystemRidingEffect;
		}
		
		return;
	}
	
	//Hooks
	static onRiderMount(pRider, pRidden, pRidingOptions) {
		console.log("here");
		if (game.settings.get(cModuleName, "RidingSystemEffects") && !(RideableFlags.isFamiliarRider(pRider) || RideableFlags.isGrappled(pRider))) {
			if (EffectManager.getSystemMountingEffect()) {
				pRider.actor.createEmbeddedDocuments("Item", [EffectManager.getSystemMountingEffect()]);
			}
		}		
	}
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {
		if (game.settings.get(cModuleName, "RidingSystemEffects")) {
			if (EffectManager.getSystemMountingEffect()) {
				pRider.actor.deleteEmbeddedDocuments("Item", pRider.actor.itemTypes.effect.filter(vElement => vElement.sourceId == EffectManager.getSystemMountingEffect().flags.core.sourceId).map(vElement => vElement.id));
			}
		}
	}
}

export { EffectManager }

//Hooks

Hooks.on("ready", function() { EffectManager.preloadEffects(); });

Hooks.on(cModuleName + "." + "Mount", (...args) => EffectManager.onRiderMount(...args));

Hooks.on(cModuleName + "." + "UnMount", (...args) => EffectManager.onRiderUnMount(...args));