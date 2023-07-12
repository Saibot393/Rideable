import { RideableUtils, cModuleName } from "./RideableUtils.js";

const cMountedPf2eEffectID = "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp"; //Mounted effects of Pf2e system

var vSystemRidingEffect = null; //saves the systems mounting effects (if any)

class EffectManager {
	//DECLARATIONS
	static async preloadEffects() {} //preloads effects to make things smoother
	
	static getSystemMountingEffect() {} //returns an appropiate Mounting effect if the game system has one
	
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
}

export { EffectManager }