import { RideableUtils, cModuleName } from "../utils/RideableUtils.js";
import { RideableFlags } from "./RideableFlags.js";
import { RideableCompUtils, cDfredCE, cGrabbedEffectName } from "../compatibility/RideableCompUtils.js";

const cMountedPf2eEffectID = "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp"; //Mounted effects of Pf2e system
const cGrappledPf2eEffectID = "Compendium.pf2e.conditionitems.Item.kWc1fhmv9LBiTuei"; //Grappled effects of Pf2e system

class EffectManager {
	
	//DECLARATIONS
	static applyMountingEffects(pRider, pRidden) {} //gives the rider all pEffects
	
	static async removeMountingEffects(pRider) {} //remove all effects flaged as Rideable effect
	
	//Hooks
	
	static onRiderMount(pRider, pRidden, pRidingOptions) {} //handle creation of mounting effects
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {} //handle deletion of mounting effects
	
	//IMPLEMENTATION
	static async applyMountingEffects(pRider, pRidden, pRidingOptions) {
		let vEffectDocuments;
		//Ridden Mounting Effects
		let vEffectNames = [];
		
		if (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration"))) {
			await EffectManager.removeMountingEffects(pRider);
			
			if (!pRidingOptions.Familiar) {
				if (!pRidingOptions.Grappled) {
					vEffectNames = RideableFlags.MountingEffects(pRidden);
					
					if (!RideableFlags.OverrideWorldMEffects(pRidden)) {
						//World Mounting effects
						vEffectNames = vEffectNames.concat(RideableUtils.CustomWorldRidingEffects());
						
						//Standard mounting effect
						if (RideableUtils.isPf2e() && game.settings.get(cModuleName, "RidingSystemEffects")) {
							vEffectNames.push(cMountedPf2eEffectID);
						}
					}
					
					if (RideableFlags.SelfApplyCustomEffects(pRider)) {
						vEffectNames.push(RideableFlags.MountingEffects(pRider));
					}
				}
				else {
					if (game.settings.get(cModuleName, "GrapplingSystemEffects")) {
						if (RideableUtils.isPf2e()) {
							vEffectNames.push(cGrappledPf2eEffectID);
						}
						
						if (RideableCompUtils.isactiveModule(cDfredCE)) {
							vEffectNames.push(cGrabbedEffectName);
						}
					}
				}
			}
			
			if (RideableUtils.isPf2e()) {
				vEffectDocuments = await RideableUtils.ApplicableEffects(vEffectNames);
				
				let vEffects = await pRider.actor.createEmbeddedDocuments("Item", vEffectDocuments);
				
				for (let i = 0; i < vEffects.length; i++) {
					
					await RideableFlags.MarkasRideableEffect(vEffects[i]);
				}
			}
			
			if (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")) {
				vEffectDocuments = RideableCompUtils.FilterEffects(vEffectNames);
				
				RideableCompUtils.AddDfredEffect(vEffectDocuments, pRider);
			}
		}
	}
	
	static async removeMountingEffects(pRider) {
		if (RideableUtils.isPf2e()) {
			await pRider.actor.deleteEmbeddedDocuments("Item", pRider.actor.itemTypes.effect.concat(pRider.actor.itemTypes.condition).filter(vElement => RideableFlags.isRideableEffect(vElement)).map(vElement => vElement.id));
		}
		
		if (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration")) {
			await RideableCompUtils.RemoveRideableDfredEffect(pRider.actor.effects.map(vElement => vElement), pRider);
		}
	}
	
	//Hooks
	static onRiderMount(pRider, pRidden, pRidingOptions) {
		EffectManager.applyMountingEffects(pRider, pRidden, pRidingOptions); //add additional systems here if necessary
	}
	
	static onRiderUnMount(pRider, pRidden, pRidingOptions) {
		EffectManager.removeMountingEffects(pRider); //add additional systems here if necessary
	}
}

export { EffectManager }

//Hooks

Hooks.once("init", () => {
	if (RideableUtils.isPf2e() || (RideableCompUtils.isactiveModule(cDfredCE) && game.settings.get(cModuleName, "DFredsEffectsIntegration"))) {
		Hooks.on(cModuleName + "." + "Mount", (...args) => EffectManager.onRiderMount(...args));

		Hooks.on(cModuleName + "." + "UnMount", (...args) => EffectManager.onRiderUnMount(...args));
	}
});