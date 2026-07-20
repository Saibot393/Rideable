import {cDnD5e, cStairways, cTagger, cWallHeight, cArmReach, cArmReachold, cLocknKey, cLockTypeRideable, cLibWrapper, cDfredCE, cTokenAttacher, cTokenZ, cRoutingLib, cMATT, cCPR, cTerrainMapper, cTerrainMapperOLD, cPf1e} from "../compatibility/RideableCompUtils.js";

import {cModuleName} from "../utils/RideableUtils.js";

const cIsRideableFlag = "isRideableFlag";
const cRideableEffectTypes = "RideableEffectsTypes";

const cEffectTypeReach = "reach";

export {cEffectTypeReach};

const cEffectLibrary = {
	[cPf1e] : {
		effectIsItem : true,
		reach : {
		  "img": "systems/pf1/icons/feats/animal-affinity.jpg",
		  "name": "Riding",
		  "system": {
			"description": {
			  "value": "<p>Adjusts:</p><ul><li>Makes large (mounting will adjust visual size, you will remain large and centered while mounted)</li><li>Adjusts carry modifier to reflect not actually being large.</li><li>Adjust skills, attack, ac, cmb, etc. to reflect not actually being large.</li><li>Macro on toggle to change between long/tall to enforce correct reach rules.</li></ul>",
			  "instructions": ""
			},
			"tags": [],
			"changes": [
			  {
				"_id": "6vyr9Ovl",
				"formula": "-0.5",
				"target": "carryMult",
				"type": "untyped"
			  },
			  {
				"_id": "BJwfC9C3",
				"formula": "1",
				"target": "size",
				"type": "untyped",
				"operator": "add",
				"priority": 0
			  },
			  {
				"type": "size",
				"_id": "VRWk1gcD",
				"operator": "add",
				"priority": 0,
				"formula": "1",
				"target": "ac"
			  },
			  {
				"type": "size",
				"operator": "add",
				"priority": 0,
				"formula": "1",
				"target": "attack",
				"_id": "rJNiRIrd"
			  },
			  {
				"type": "size",
				"operator": "add",
				"priority": 0,
				"formula": "-1",
				"target": "cmb",
				"_id": "wEhBQ6Vk"
			  },
			  {
				"type": "size",
				"operator": "add",
				"priority": 0,
				"formula": "-1",
				"target": "cmd",
				"_id": "5uRkhiiG"
			  },
			  {
				"type": "size",
				"operator": "add",
				"priority": 0,
				"formula": "+2",
				"target": "skill.fly",
				"_id": "B8gml9LI"
			  },
			  {
				"type": "size",
				"operator": "add",
				"priority": 0,
				"formula": "+4",
				"target": "skill.ste",
				"_id": "GrvyMx88"
			  }
			],
			"changeFlags": {
			  "immuneToMorale": false,
			  "loseDexToAC": false,
			  "noMediumEncumbrance": false,
			  "noHeavyEncumbrance": false,
			  "mediumArmorFullSpeed": false,
			  "heavyArmorFullSpeed": false,
			  "lowLightVision": false,
			  "seeInvisibility": false,
			  "seeInDarkness": false
			},
			"contextNotes": [],
			"actions": [],
			"attackNotes": [],
			"effectNotes": [],
			"uses": {
			  "value": null,
			  "per": "",
			  "autoDeductChargesCost": "",
			  "maxFormula": "",
			  "rechargeFormula": ""
			},
			"links": {
			  "children": []
			},
			"tag": "",
			"flags": {
			  "boolean": {},
			  "dictionary": {}
			},
			"scriptCalls": [
			  {
				"category": "toggle",
				"type": "script",
				"_id": "Yo2HTwDi",
				"name": "make long",
				"img": null,
				"value": "const stature = actor.system.traits.stature === \"tall\" ? \"long\" : \"tall\";\nactor.update({ \"system.traits.stature\": stature });",
				"hidden": false
			  }
			],
			"subType": "misc",
			"active": true,
			"level": 1,
			"duration": {
			  "value": "@item.level",
			  "units": "",
			  "end": "turnStart",
			  "start": 1747440169
			},
			"conditions": [],
			"hideFromToken": false,
			"sources": [
			  {
				"id": "PZO1110",
				"pages": "277, 278"
			  }
			],
			"showInQuickbar": false
		  },
		  "type": "buff",
		  "effects": [
			{
			  "name": "Riding",
			  "img": "systems/pf1/icons/feats/animal-affinity.jpg",
			  "origin": ".Item.e6hU7GQCwJUqorcr",
			  "duration": {
				"startTime": 1747440169,
				"seconds": 60,
				"combat": null
			  },
			  "disabled": false,
			  "type": "buff",
			  "system": {
				"end": "turnStart"
			  },
			  "transfer": true,
			  "flags": {
				"pf1": {
				  "tracker": true
				}
			  },
			  "_id": "SFkpmqMuPHXYtEim",
			  "changes": [],
			  "description": "",
			  "tint": "#ffffff",
			  "statuses": [],
			  "sort": 0,
			  "_stats": {
				"compendiumSource": null,
				"duplicateSource": null,
				"exportSource": null,
				"coreVersion": "13.351",
				"systemId": "pf1",
				"systemVersion": "11.11",
				"lastModifiedBy": null
			  }
			}
		  ],
		  "flags": {},
		  "ownership": {
			"default": 0
		  }
		}
	}
}

export class EffectManagerv2 {
	static async applyEffects(pRider, pRidden, pOptions = {reach : false}) {
		if (cEffectLibrary[game.system.id]) {
			if (cEffectLibrary[game.system.id].effectIsItem) {
				let vEffects = [];
				
				for (let vKey of Object.keys(pOptions).filter(vKey => pOptions[vKey])) {
					//Here to adjust library entry type (id or object)
					let vEffect = cEffectLibrary[game.system.id][vKey];
					//
					
					if (vEffect) {
						EffectManagerv2.markRideableEffect(vEffect, pOptions);
						
						vEffects.push(vEffect);
					}
				}
				
				if (vEffects.length) {
					await pRider.actor.createEmbeddedDocuments("Item", vEffects);
					
					return vEffects.length;
				}
			}
		}
		
		return false;
	}
	
	static async deleteRideableEffects(pRider, pOptions = {reach : true}) {
		let vEffects = pRider.actor.items.filter(vItem => EffectManagerv2.isRideableEffect(vItem, pOptions));
		
		if (vEffects.length) {
			await pRider.actor.deleteEmbeddedDocuments("Item", vEffects.map(vEffect => vEffect.id));
			
			return vEffects.length;
		}
		
		return false;
	}
	
	static markRideableEffect(pEffect, pOptions = {reach : false}) {
		if (!pEffect.flags) pEffect.flags = {};
		
		pEffect.flags[cModuleName] = {
			[cIsRideableFlag] : true,
			[cRideableEffectTypes] : Object.keys(pOptions).filter(vKey => pOptions[vKey])
		}
	}
	
	static isRideableEffect(pEffect, pOptions = {reach : true}) {
		const cIsRideableEffect = pEffect.flags?.[cModuleName]?.[cIsRideableFlag];
		
		if (cIsRideableEffect) {
			const cEffectTypes = pEffect.flags?.[cModuleName]?.[cRideableEffectTypes];
			
			if (cEffectTypes && cEffectTypes.length) {
				return cEffectTypes.find(vType => pOptions[vType]);
			}
			
			return true;
		}
		
		return false;
	}
	
	static hasSystemEffect(pType) {
		return cEffectLibrary[game.system.id]?.[pType];
	}
}