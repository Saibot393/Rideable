import { RideableUtils, cModuleName } from "../utils/RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";

const cMountedPf2eEffectID = "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp"; //Mounted effects of Pf2e system

class EffectManager {
	
	//DECLARATIONS
	static applyMountingEffects(pRider, pRidden) {} //gives the rider all pEffects
	
	static removeMountingEffects(pRider) {} //remove all effects flaged as Rideable effect
	
	//Hooks
	
	static onRiderMount(pRider, pRidden, pRidingOptions) {} //handle creation of mounting effects
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {} //handle deletion of mounting effects
	
	//IMPLEMENTATION
	static async applyMountingEffects(pRider, pRidden) {
		//Ridden Mounting Effects
		let vEffectNames = RideableFlags.MountingEffects(pRidden);
		
		if (!RideableFlags.OverrideWorldMEffects(pRidden)) {
			//World Mounting effects
			vEffectNames = vEffectNames.concat(RideableUtils.CustomWorldRidingEffects());
			
			//Standard mounting effect
			if (game.settings.get(cModuleName, "RidingSystemEffects")) {
				vEffectNames.push(cMountedPf2eEffectID);
			}
		}
		
		let vEffects = await pRider.actor.createEmbeddedDocuments("Item", await RideableUtils.ApplicableEffects(vEffectNames));
		
		for (let i = 0; i < vEffects.length; i++) {
			
			await RideableFlags.MarkasRideableEffect(vEffects[i]);
		}
	}
	
	static removeMountingEffects(pRider) {
		pRider.actor.deleteEmbeddedDocuments("Item", pRider.actor.itemTypes.effect.filter(vElement => RideableFlags.isRideableEffect(vElement)).map(vElement => vElement.id));
	}
	
	//Hooks
	static onRiderMount(pRider, pRidden, pRidingOptions) {
		if (!(RideableFlags.isFamiliarRider(pRider) || RideableFlags.isGrappled(pRider))) {
			EffectManager.applyMountingEffects(pRider, pRidden); //add additional systems here if necessary
		}
	}
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {
		if (!(RideableFlags.isFamiliarRider(pRider) || RideableFlags.isGrappled(pRider))) {
			EffectManager.removeMountingEffects(pRider); //add additional systems here if necessary
		}
	}
}

export { EffectManager }

//Hooks

Hooks.once("init", () => {
	if (RideableUtils.isPf2e()) {
		Hooks.on(cModuleName + "." + "Mount", (...args) => EffectManager.onRiderMount(...args));

		Hooks.on(cModuleName + "." + "UnMount", (...args) => EffectManager.onRiderUnMount(...args));
	}
});